package com.example.etouch

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.findNavController
import androidx.navigation.ui.setupWithNavController
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.floatingactionbutton.FloatingActionButton

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val navView: BottomNavigationView = findViewById(R.id.bottom_navigation)
        val navController = findNavController(R.id.nav_host_fragment)
        
        navView.setupWithNavController(navController)
        
        // 设置按钮点击事件
        val fabSettings: FloatingActionButton = findViewById(R.id.fab_settings)
        fabSettings.setOnClickListener {
            // TODO: 打开设置页面
            Toast.makeText(this, "打开设置", Toast.LENGTH_SHORT).show()
        }
        
        // 邮箱按钮点击事件
        val fabEmail: FloatingActionButton = findViewById(R.id.fab_email)
        fabEmail.setOnClickListener {
            // TODO: 打开邮箱页面
            Toast.makeText(this, "打开邮箱", Toast.LENGTH_SHORT).show()
        }
        
        // 背景音乐按钮点击事件
        val fabMusic: FloatingActionButton = findViewById(R.id.fab_music)
        fabMusic.setOnClickListener {
            // TODO: 更换背景音乐
            Toast.makeText(this, "更换背景音乐", Toast.LENGTH_SHORT).show()
        }
        
        // 主页显示/隐藏按钮点击事件
        val fabVisibility: FloatingActionButton = findViewById(R.id.fab_visibility)
        var isHomeVisible = true
        fabVisibility.setOnClickListener {
            isHomeVisible = !isHomeVisible
            val message = if (isHomeVisible) "显示主页" else "隐藏主页"
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
            // TODO: 实现主页显示/隐藏逻辑
        }
        
        // 角色更换按钮点击事件
        val fabCharacter: FloatingActionButton = findViewById(R.id.fab_character)
        fabCharacter.setOnClickListener {
            // TODO: 更换主页角色
            Toast.makeText(this, "更换主页角色", Toast.LENGTH_SHORT).show()
        }
    }
}