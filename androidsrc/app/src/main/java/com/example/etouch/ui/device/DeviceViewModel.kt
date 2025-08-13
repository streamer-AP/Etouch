package com.example.etouch.ui.device

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class DeviceViewModel : ViewModel() {

    private val _text = MutableLiveData<String>().apply {
        value = "设备管理中心"
    }
    val text: LiveData<String> = _text
    
    private val _connectionStatus = MutableLiveData<String>().apply {
        value = "未连接"
    }
    val connectionStatus: LiveData<String> = _connectionStatus
}