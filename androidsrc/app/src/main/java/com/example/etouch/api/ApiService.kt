package com.example.etouch.api

import android.content.Context
import android.util.Log
import com.google.gson.Gson
import com.google.gson.JsonParser
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import java.io.IOException
import java.util.concurrent.TimeUnit

class ApiService private constructor(private val context: Context) {
    
    companion object {
        private const val TAG = "ApiService"
        private const val BASE_URL = "http://47.105.45.48:3001" // 远程服务器地址
        private const val PREFS_NAME = "etouch_prefs"
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        
        @Volatile
        private var INSTANCE: ApiService? = null
        
        fun getInstance(context: Context): ApiService {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: ApiService(context.applicationContext).also { INSTANCE = it }
            }
        }
    }
    
    private val gson = Gson()
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    
    private val client: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .addInterceptor { chain ->
            val original = chain.request()
            val token = getToken()
            
            val request = if (token != null) {
                original.newBuilder()
                    .header("Authorization", "Bearer $token")
                    .header("Content-Type", "application/json")
                    .build()
            } else {
                original.newBuilder()
                    .header("Content-Type", "application/json")
                    .build()
            }
            
            chain.proceed(request)
        }
        .build()
    
    // 数据类定义
    data class RegisterRequest(
        val username: String,
        val email: String,
        val password: String,
        val mobile: String? = null,
        val nickname: String? = null
    )
    
    data class LoginRequest(
        val loginId: String,
        val password: String
    )
    
    data class AuthResponse(
        val user: User,
        val token: String,
        val refreshToken: String? = null
    )
    
    data class User(
        val userId: Int,
        val username: String,
        val email: String,
        val nickname: String?
    )
    
    data class ApiError(
        val statusCode: Int,
        val message: String,
        val error: String? = null
    )
    
    data class MusicUploadRequest(
        val title: String,
        val artist: String? = null,
        val album: String? = null,
        val durationSeconds: Int,
        val fileUrl: String,
        val fileSize: Long,
        val format: String,
        val bpm: Int? = null,
        val energyLevel: Int? = null,
        val category: String? = null,
        val tags: String? = null,
        val isPublic: Boolean = false,
        val autoGenerateSequence: Boolean = true
    )
    
    data class MusicItem(
        val id: String,
        val title: String,
        val artist: String?,
        val album: String?,
        val durationSeconds: Int,
        val fileUrl: String,
        val fileSize: Long,
        val format: String,
        val bpm: Int?,
        val energyLevel: Int?,
        val category: String?,
        val tags: String?,
        val isPublic: Boolean,
        val uploadTime: String?,
        val userId: String
    )
    
    // Token管理
    fun saveToken(token: String) {
        prefs.edit().putString(KEY_TOKEN, token).apply()
    }
    
    fun saveRefreshToken(refreshToken: String) {
        prefs.edit().putString(KEY_REFRESH_TOKEN, refreshToken).apply()
    }
    
    fun getToken(): String? {
        return prefs.getString(KEY_TOKEN, null)
    }
    
    fun getRefreshToken(): String? {
        return prefs.getString(KEY_REFRESH_TOKEN, null)
    }
    
    fun clearTokens() {
        prefs.edit()
            .remove(KEY_TOKEN)
            .remove(KEY_REFRESH_TOKEN)
            .apply()
    }
    
    // 注册功能
    suspend fun register(
        username: String,
        email: String,
        password: String,
        mobile: String? = null,
        nickname: String? = null
    ): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val requestBody = RegisterRequest(username, email, password, mobile, nickname)
            val json = gson.toJson(requestBody)
            
            val request = Request.Builder()
                .url("$BASE_URL/auth/register")
                .post(json.toRequestBody("application/json".toMediaType()))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val authResponse = gson.fromJson(responseBody, AuthResponse::class.java)
                
                // 保存token
                saveToken(authResponse.token)
                authResponse.refreshToken?.let { saveRefreshToken(it) }
                
                Result.success(authResponse)
            } else {
                val errorBody = response.body?.string()
                val error = try {
                    gson.fromJson(errorBody, ApiError::class.java)
                } catch (e: Exception) {
                    ApiError(response.code, "注册失败: ${response.message}")
                }
                
                // 处理特定错误状态码
                val errorMessage = when (response.code) {
                    409 -> {
                        when {
                            error.message.contains("Email", ignoreCase = true) -> "该邮箱已被注册"
                            error.message.contains("Username", ignoreCase = true) -> "该用户名已存在"
                            error.message.contains("Mobile", ignoreCase = true) -> "该手机号已被注册"
                            else -> "用户名、邮箱或手机号已存在"
                        }
                    }
                    400 -> "注册信息格式不正确"
                    500 -> "服务器错误，请稍后重试"
                    else -> error.message
                }
                
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Register failed", e)
            Result.failure(Exception("网络请求失败: ${e.message}"))
        }
    }
    
    // 登录功能
    suspend fun login(
        loginId: String,
        password: String
    ): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val requestBody = LoginRequest(loginId, password)
            val json = gson.toJson(requestBody)
            
            val request = Request.Builder()
                .url("$BASE_URL/auth/login")
                .post(json.toRequestBody("application/json".toMediaType()))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val authResponse = gson.fromJson(responseBody, AuthResponse::class.java)
                
                // 保存token
                saveToken(authResponse.token)
                authResponse.refreshToken?.let { saveRefreshToken(it) }
                
                Result.success(authResponse)
            } else {
                val errorBody = response.body?.string()
                val error = try {
                    gson.fromJson(errorBody, ApiError::class.java)
                } catch (e: Exception) {
                    ApiError(response.code, "登录失败: ${response.message}")
                }
                
                // 处理特定错误状态码
                val errorMessage = when (response.code) {
                    401 -> "用户名或密码错误"
                    404 -> "用户不存在"
                    400 -> "登录信息格式不正确"
                    500 -> "服务器错误，请稍后重试"
                    else -> error.message
                }
                
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Login failed", e)
            Result.failure(Exception("网络请求失败: ${e.message}"))
        }
    }
    
    // 登出功能
    suspend fun logout(): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$BASE_URL/auth/logout")
                .post("".toRequestBody("application/json".toMediaType()))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                clearTokens()
                Result.success(true)
            } else {
                Result.failure(Exception("登出失败"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Logout failed", e)
            // 即使网络请求失败，也清除本地token
            clearTokens()
            Result.success(true)
        }
    }
    
    // 获取用户信息
    suspend fun getUserProfile(): Result<User> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$BASE_URL/auth/profile")
                .get()
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val user = gson.fromJson(responseBody, User::class.java)
                Result.success(user)
            } else {
                Result.failure(Exception("获取用户信息失败"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Get profile failed", e)
            Result.failure(Exception("网络请求失败: ${e.message}"))
        }
    }
    
    // 上传音乐文件到服务器
    suspend fun uploadMusicFile(
        file: java.io.File,
        onProgress: ((Int) -> Unit)? = null
    ): Result<String> = withContext(Dispatchers.IO) {
        try {
            val requestBody = file.asRequestBody("audio/*".toMediaType())
            val multipartBody = MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart(
                    "file",
                    file.name,
                    requestBody
                )
                .build()
            
            val request = Request.Builder()
                .url("$BASE_URL/upload/music")
                .post(multipartBody)
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val jsonObject = JsonParser.parseString(responseBody).asJsonObject
                val fileUrl = jsonObject.get("url").asString
                Result.success(fileUrl)
            } else {
                Result.failure(Exception("文件上传失败: ${response.message}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "File upload failed", e)
            Result.failure(Exception("文件上传失败: ${e.message}"))
        }
    }
    
    // 创建音乐记录
    suspend fun createMusicRecord(
        musicData: MusicUploadRequest
    ): Result<MusicItem> = withContext(Dispatchers.IO) {
        try {
            val json = gson.toJson(musicData)
            
            val request = Request.Builder()
                .url("$BASE_URL/music")
                .post(json.toRequestBody("application/json".toMediaType()))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val musicItem = gson.fromJson(responseBody, MusicItem::class.java)
                Result.success(musicItem)
            } else {
                val errorBody = response.body?.string()
                val error = try {
                    gson.fromJson(errorBody, ApiError::class.java)
                } catch (e: Exception) {
                    ApiError(response.code, "创建音乐记录失败")
                }
                Result.failure(Exception(error.message))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Create music record failed", e)
            Result.failure(Exception("创建音乐记录失败: ${e.message}"))
        }
    }
    
    // 获取用户音乐列表
    suspend fun getUserMusicList(): Result<List<MusicItem>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$BASE_URL/music/my")
                .get()
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val musicList = gson.fromJson(responseBody, Array<MusicItem>::class.java).toList()
                Result.success(musicList)
            } else {
                Result.failure(Exception("获取音乐列表失败"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Get music list failed", e)
            Result.failure(Exception("获取音乐列表失败: ${e.message}"))
        }
    }
    
    // 刷新Token
    suspend fun refreshToken(): Result<String> = withContext(Dispatchers.IO) {
        try {
            val refreshToken = getRefreshToken()
            if (refreshToken == null) {
                return@withContext Result.failure(Exception("No refresh token available"))
            }
            
            val json = gson.toJson(mapOf("refreshToken" to refreshToken))
            
            val request = Request.Builder()
                .url("$BASE_URL/auth/refresh")
                .post(json.toRequestBody("application/json".toMediaType()))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val jsonObject = JsonParser.parseString(responseBody).asJsonObject
                val newToken = jsonObject.get("token").asString
                val newRefreshToken = jsonObject.get("refreshToken").asString
                
                saveToken(newToken)
                saveRefreshToken(newRefreshToken)
                
                Result.success(newToken)
            } else {
                clearTokens()
                Result.failure(Exception("Token refresh failed"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Token refresh failed", e)
            clearTokens()
            Result.failure(Exception("Token刷新失败: ${e.message}"))
        }
    }
}