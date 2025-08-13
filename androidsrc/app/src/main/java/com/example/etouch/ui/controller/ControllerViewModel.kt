package com.example.etouch.ui.controller

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class ControllerViewModel : ViewModel() {

    private val _text = MutableLiveData<String>().apply {
        value = "控制器界面"
    }
    val text: LiveData<String> = _text
}