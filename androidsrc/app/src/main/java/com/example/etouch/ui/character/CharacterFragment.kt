package com.example.etouch.ui.character

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.etouch.R

class CharacterFragment : Fragment() {

    private lateinit var characterViewModel: CharacterViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        characterViewModel =
            ViewModelProvider(this).get(CharacterViewModel::class.java)

        val root = inflater.inflate(R.layout.fragment_character, container, false)
        
        val textView: TextView = root.findViewById(R.id.text_character)
        characterViewModel.text.observe(viewLifecycleOwner) {
            textView.text = it
        }
        return root
    }
}