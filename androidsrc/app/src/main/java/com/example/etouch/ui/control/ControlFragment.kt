package com.example.etouch.ui.control

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.etouch.R

class ControlFragment : Fragment() {

    private lateinit var controlViewModel: ControlViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        controlViewModel =
            ViewModelProvider(this).get(ControlViewModel::class.java)

        val root = inflater.inflate(R.layout.fragment_control, container, false)
        
        val textView: TextView = root.findViewById(R.id.text_control)
        controlViewModel.text.observe(viewLifecycleOwner) {
            textView.text = it
        }
        return root
    }
}