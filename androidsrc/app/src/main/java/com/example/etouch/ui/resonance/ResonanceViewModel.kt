package com.example.etouch.ui.resonance

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class ResonanceViewModel : ViewModel() {

    private val _text = MutableLiveData<String>().apply {
        value = "共鸣界面"
    }
    val text: LiveData<String> = _text
}