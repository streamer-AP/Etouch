package com.example.etouch.ui.device

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.etouch.R

class DeviceFragment : Fragment() {

    private lateinit var deviceViewModel: DeviceViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        deviceViewModel =
            ViewModelProvider(this).get(DeviceViewModel::class.java)

        val root = inflater.inflate(R.layout.fragment_device, container, false)
        
        val textView: TextView = root.findViewById(R.id.text_device)
        deviceViewModel.text.observe(viewLifecycleOwner) {
            textView.text = it
        }
        return root
    }
}