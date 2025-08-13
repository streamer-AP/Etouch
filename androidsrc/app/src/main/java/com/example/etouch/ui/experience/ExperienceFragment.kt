package com.example.etouch.ui.experience

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.etouch.R

class ExperienceFragment : Fragment() {

    private lateinit var experienceViewModel: ExperienceViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        experienceViewModel =
            ViewModelProvider(this).get(ExperienceViewModel::class.java)

        val root = inflater.inflate(R.layout.fragment_experience, container, false)
        
        val textView: TextView = root.findViewById(R.id.text_experience)
        experienceViewModel.text.observe(viewLifecycleOwner) {
            textView.text = it
        }
        return root
    }
}