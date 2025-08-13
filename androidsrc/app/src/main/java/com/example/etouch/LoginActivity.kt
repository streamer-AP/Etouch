package com.example.etouch

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.etouch.api.ApiService
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {
    
    private lateinit var etUsername: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var btnRegister: Button
    private lateinit var tvForgotPassword: TextView
    private lateinit var cbAgreeTerms: CheckBox
    private lateinit var tvTerms: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var apiService: ApiService
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)
        
        // 初始化API服务
        apiService = ApiService.getInstance(this)
        
        // 初始化视图
        initViews()
        
        // 设置点击事件
        setupClickListeners()
    }
    
    private fun initViews() {
        etUsername = findViewById(R.id.et_username)
        etPassword = findViewById(R.id.et_password)
        btnLogin = findViewById(R.id.btn_login)
        btnRegister = findViewById(R.id.btn_register)
        tvForgotPassword = findViewById(R.id.tv_forgot_password)
        cbAgreeTerms = findViewById(R.id.cb_agree_terms)
        tvTerms = findViewById(R.id.tv_terms)
        progressBar = findViewById(R.id.progress_bar)
        
        // 调试模式：使用测试账号
        etUsername.setText("testuser")
        etPassword.setText("Test123456!")
        cbAgreeTerms.isChecked = true
    }
    
    private fun setupClickListeners() {
        // 登录按钮
        btnLogin.setOnClickListener {
            if (validateInput()) {
                performLogin()
            }
        }
        
        // 注册按钮
        btnRegister.setOnClickListener {
            val intent = Intent(this, RegisterActivity::class.java)
            startActivity(intent)
        }
        
        // 忘记密码
        tvForgotPassword.setOnClickListener {
            Toast.makeText(this, "忘记密码功能", Toast.LENGTH_SHORT).show()
            // TODO: 实现忘记密码功能
        }
        
        // 使用条款
        tvTerms.setOnClickListener {
            Toast.makeText(this, "查看使用条款", Toast.LENGTH_SHORT).show()
            // TODO: 显示使用条款对话框
        }
    }
    
    private fun validateInput(): Boolean {
        val username = etUsername.text.toString().trim()
        val password = etPassword.text.toString().trim()
        
        if (username.isEmpty()) {
            etUsername.error = "请输入用户名"
            return false
        }
        
        if (password.isEmpty()) {
            etPassword.error = "请输入密码"
            return false
        }
        
        if (!cbAgreeTerms.isChecked) {
            Toast.makeText(this, "请同意使用条款", Toast.LENGTH_SHORT).show()
            return false
        }
        
        return true
    }
    
    private fun performLogin() {
        val loginId = etUsername.text.toString().trim()
        val password = etPassword.text.toString().trim()
        
        // 显示加载进度
        showLoading(true)
        
        lifecycleScope.launch {
            try {
                val result = apiService.login(loginId, password)
                
                result.fold(
                    onSuccess = { authResponse ->
                        showLoading(false)
                        Toast.makeText(this@LoginActivity, "登录成功！欢迎 ${authResponse.user.nickname ?: authResponse.user.username}", Toast.LENGTH_SHORT).show()
                        navigateToMainActivity()
                    },
                    onFailure = { exception ->
                        showLoading(false)
                        Toast.makeText(this@LoginActivity, "登录失败: ${exception.message}", Toast.LENGTH_LONG).show()
                    }
                )
            } catch (e: Exception) {
                showLoading(false)
                Toast.makeText(this@LoginActivity, "网络错误: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }
    
    private fun showLoading(show: Boolean) {
        progressBar.visibility = if (show) View.VISIBLE else View.GONE
        btnLogin.isEnabled = !show
        btnRegister.isEnabled = !show
    }
    
    private fun navigateToMainActivity() {
        // 跳转到主页
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
        finish() // 关闭登录页面
    }
}