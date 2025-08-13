package com.example.etouch.ui.story

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel

class StoryViewModel : ViewModel() {

    private val _text = MutableLiveData<String>().apply {
        value = "剧情界面"
    }
    val text: LiveData<String> = _text
}