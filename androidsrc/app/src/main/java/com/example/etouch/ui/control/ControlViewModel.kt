package com.example.etouch.ui.control

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class ControlViewModel : ViewModel() {

    private val _text = MutableLiveData<String>().apply {
        value = "控制界面"
    }
    val text: LiveData<String> = _text
}