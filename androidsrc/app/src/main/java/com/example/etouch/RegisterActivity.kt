package com.example.etouch

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.etouch.api.ApiService
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch

class RegisterActivity : AppCompatActivity() {
    
    private lateinit var etUsername: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var btnRegister: Button
    private lateinit var btnBack: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var apiService: ApiService
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)
        
        // 初始化API服务
        apiService = ApiService.getInstance(this)
        
        initViews()
        setupClickListeners()
    }
    
    private fun initViews() {
        etUsername = findViewById(R.id.et_reg_username)
        etEmail = findViewById(R.id.et_reg_email)
        etPassword = findViewById(R.id.et_reg_password)
        etConfirmPassword = findViewById(R.id.et_reg_confirm_password)
        btnRegister = findViewById(R.id.btn_register_submit)
        btnBack = findViewById(R.id.btn_back_to_login)
        progressBar = findViewById(R.id.register_progress_bar)
    }
    
    private fun setupClickListeners() {
        btnRegister.setOnClickListener {
            if (validateRegistration()) {
                performRegistration()
            }
        }
        
        btnBack.setOnClickListener {
            finish() // 返回登录页面
        }
    }
    
    private fun validateRegistration(): Boolean {
        val username = etUsername.text.toString().trim()
        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString().trim()
        val confirmPassword = etConfirmPassword.text.toString().trim()
        
        if (username.isEmpty()) {
            etUsername.error = "请输入用户名"
            return false
        }
        
        if (email.isEmpty()) {
            etEmail.error = "请输入邮箱"
            return false
        }
        
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            etEmail.error = "请输入有效的邮箱地址"
            return false
        }
        
        if (password.isEmpty()) {
            etPassword.error = "请输入密码"
            return false
        }
        
        if (password.length < 6) {
            etPassword.error = "密码至少6位"
            return false
        }
        
        if (confirmPassword != password) {
            etConfirmPassword.error = "两次密码不一致"
            return false
        }
        
        return true
    }
    
    private fun performRegistration() {
        val username = etUsername.text.toString().trim()
        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString().trim()
        
        // 显示加载进度
        showLoading(true)
        
        lifecycleScope.launch {
            try {
                val result = apiService.register(
                    username = username,
                    email = email,
                    password = password,
                    nickname = username // 使用用户名作为默认昵称
                )
                
                result.fold(
                    onSuccess = { authResponse ->
                        showLoading(false)
                        Toast.makeText(this@RegisterActivity, "注册成功！欢迎 ${authResponse.user.nickname ?: authResponse.user.username}", Toast.LENGTH_LONG).show()
                        
                        // 直接跳转到主页
                        val intent = Intent(this@RegisterActivity, MainActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    },
                    onFailure = { exception ->
                        showLoading(false)
                        Toast.makeText(this@RegisterActivity, "注册失败: ${exception.message}", Toast.LENGTH_LONG).show()
                    }
                )
            } catch (e: Exception) {
                showLoading(false)
                Toast.makeText(this@RegisterActivity, "网络错误: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
    
    private fun showLoading(show: Boolean) {
        progressBar.visibility = if (show) View.VISIBLE else View.GONE
        btnRegister.isEnabled = !show
        btnBack.isEnabled = !show
    }
}