package com.example.etouch.ui.controller

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.etouch.R

class ControllerFragment : Fragment() {

    private lateinit var controllerViewModel: ControllerViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        controllerViewModel =
            ViewModelProvider(this).get(ControllerViewModel::class.java)

        val root = inflater.inflate(R.layout.fragment_controller, container, false)
        
        val textView: TextView = root.findViewById(R.id.text_controller)
        controllerViewModel.text.observe(viewLifecycleOwner) {
            textView.text = it
        }
        return root
    }
}