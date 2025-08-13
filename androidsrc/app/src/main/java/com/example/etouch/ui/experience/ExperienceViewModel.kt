package com.example.etouch.ui.experience

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class ExperienceViewModel : ViewModel() {

    private val _text = MutableLiveData<String>().apply {
        value = "沉浸体验页面"
    }
    val text: LiveData<String> = _text
}