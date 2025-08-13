package com.example.etouch.ui.story

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.etouch.R

class StoryFragment : Fragment() {

    private lateinit var storyViewModel: StoryViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        storyViewModel =
            ViewModelProvider(this).get(StoryViewModel::class.java)

        val root = inflater.inflate(R.layout.fragment_story, container, false)
        
        val textView: TextView = root.findViewById(R.id.text_story)
        storyViewModel.text.observe(viewLifecycleOwner) {
            textView.text = it
        }
        return root
    }
}