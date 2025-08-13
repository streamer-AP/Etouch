package com.example.etouch.ui.card

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.etouch.R

class CardFragment : Fragment() {

    private lateinit var cardViewModel: CardViewModel

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        cardViewModel =
            ViewModelProvider(this).get(CardViewModel::class.java)

        val root = inflater.inflate(R.layout.fragment_card, container, false)
        
        val textView: TextView = root.findViewById(R.id.text_card)
        cardViewModel.text.observe(viewLifecycleOwner) {
            textView.text = it
        }
        return root
    }
}