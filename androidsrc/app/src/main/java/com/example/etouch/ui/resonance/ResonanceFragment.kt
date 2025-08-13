package com.example.etouch.ui.resonance

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.media.MediaMetadataRetriever
import android.media.MediaPlayer
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.OpenableColumns
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.example.etouch.R
import com.google.android.material.floatingactionbutton.FloatingActionButton
import java.io.File
import java.util.concurrent.TimeUnit

class ResonanceFragment : Fragment() {

    private lateinit var resonanceViewModel: ResonanceViewModel
    
    // 播放器相关控件
    private lateinit var btnPlayPause: FloatingActionButton
    private lateinit var btnPrevious: ImageButton
    private lateinit var btnNext: ImageButton
    private lateinit var btnPlayMode: ImageButton
    private lateinit var btnPlaylist: ImageButton
    private lateinit var btnUploadMusic: Button
    private lateinit var btnAnalyzeMusic: Button
    private lateinit var seekBarProgress: SeekBar
    private lateinit var seekBarVolume: SeekBar
    private lateinit var tvCurrentTime: TextView
    private lateinit var tvTotalTime: TextView
    private lateinit var tvSongTitle: TextView
    private lateinit var tvArtist: TextView
    private lateinit var tvVolume: TextView
    
    // MediaPlayer实例
    private var mediaPlayer: MediaPlayer? = null
    private var isPlaying = false
    private val handler = Handler(Looper.getMainLooper())
    private var updateProgressRunnable: Runnable? = null
    
    // 播放模式
    private var playMode = PlayMode.REPEAT_ALL
    
    enum class PlayMode {
        REPEAT_ALL,
        REPEAT_ONE,
        SHUFFLE
    }
    
    // 播放列表
    private val playlist = mutableListOf(
        Song("共鸣之歌", "未知艺术家", 180000, null),
        Song("心灵震撼", "神秘歌手", 240000, null),
        Song("灵魂共振", "匿名创作者", 200000, null)
    )
    private var currentSongIndex = 0
    private var currentMusicUri: Uri? = null
    
    // 文件选择器
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            handleMusicFileSelected(it)
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        resonanceViewModel =
            ViewModelProvider(this).get(ResonanceViewModel::class.java)

        val root = inflater.inflate(R.layout.fragment_resonance, container, false)
        
        initViews(root)
        setupClickListeners()
        setupSeekBars()
        
        // 初始化歌曲信息
        updateSongInfo()
        
        return root
    }
    
    private fun initViews(root: View) {
        btnPlayPause = root.findViewById(R.id.btn_play_pause)
        btnPrevious = root.findViewById(R.id.btn_previous)
        btnNext = root.findViewById(R.id.btn_next)
        btnPlayMode = root.findViewById(R.id.btn_play_mode)
        btnPlaylist = root.findViewById(R.id.btn_playlist)
        btnUploadMusic = root.findViewById(R.id.btn_upload_music)
        btnAnalyzeMusic = root.findViewById(R.id.btn_analyze_music)
        seekBarProgress = root.findViewById(R.id.seekbar_progress)
        seekBarVolume = root.findViewById(R.id.seekbar_volume)
        tvCurrentTime = root.findViewById(R.id.tv_current_time)
        tvTotalTime = root.findViewById(R.id.tv_total_time)
        tvSongTitle = root.findViewById(R.id.tv_song_title)
        tvArtist = root.findViewById(R.id.tv_artist)
        tvVolume = root.findViewById(R.id.tv_volume)
    }
    
    private fun setupClickListeners() {
        // 播放/暂停按钮
        btnPlayPause.setOnClickListener {
            if (isPlaying) {
                pauseMusic()
            } else {
                playMusic()
            }
        }
        
        // 上一曲
        btnPrevious.setOnClickListener {
            playPrevious()
        }
        
        // 下一曲
        btnNext.setOnClickListener {
            playNext()
        }
        
        // 播放模式切换
        btnPlayMode.setOnClickListener {
            togglePlayMode()
        }
        
        // 播放列表
        btnPlaylist.setOnClickListener {
            showPlaylist()
        }
        
        // 上传音乐
        btnUploadMusic.setOnClickListener {
            openMusicFilePicker()
        }
        
        // 音乐解析
        btnAnalyzeMusic.setOnClickListener {
            analyzeMusicFile()
        }
    }
    
    private fun setupSeekBars() {
        // 进度条
        seekBarProgress.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                if (fromUser && mediaPlayer != null) {
                    mediaPlayer?.seekTo(progress)
                    updateTimeDisplay(progress)
                }
            }
            
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
        
        // 音量控制
        seekBarVolume.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                tvVolume.text = "$progress%"
                // 实际项目中应该控制系统音量
                val volume = progress / 100f
                mediaPlayer?.setVolume(volume, volume)
            }
            
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
    }
    
    private fun playMusic() {
        try {
            if (mediaPlayer == null) {
                // 模拟播放音乐 - 实际项目中应该加载真实的音频文件
                // mediaPlayer = MediaPlayer.create(context, R.raw.sample_music)
                // 这里仅作演示
                simulatePlay()
            } else {
                mediaPlayer?.start()
            }
            
            isPlaying = true
            btnPlayPause.setImageResource(R.drawable.ic_pause)
            startProgressUpdate()
            
        } catch (e: Exception) {
            Toast.makeText(context, "播放失败: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun pauseMusic() {
        mediaPlayer?.pause()
        isPlaying = false
        btnPlayPause.setImageResource(R.drawable.ic_play)
        stopProgressUpdate()
    }
    
    private fun playPrevious() {
        currentSongIndex = if (currentSongIndex > 0) currentSongIndex - 1 else playlist.size - 1
        updateSongInfo()
        resetAndPlay()
    }
    
    private fun playNext() {
        when (playMode) {
            PlayMode.REPEAT_ONE -> {
                // 单曲循环，不切换
            }
            PlayMode.SHUFFLE -> {
                currentSongIndex = (0 until playlist.size).random()
            }
            else -> {
                currentSongIndex = (currentSongIndex + 1) % playlist.size
            }
        }
        updateSongInfo()
        resetAndPlay()
    }
    
    private fun togglePlayMode() {
        playMode = when (playMode) {
            PlayMode.REPEAT_ALL -> {
                btnPlayMode.setImageResource(R.drawable.ic_repeat_one)
                Toast.makeText(context, "单曲循环", Toast.LENGTH_SHORT).show()
                PlayMode.REPEAT_ONE
            }
            PlayMode.REPEAT_ONE -> {
                btnPlayMode.setImageResource(R.drawable.ic_shuffle)
                Toast.makeText(context, "随机播放", Toast.LENGTH_SHORT).show()
                PlayMode.SHUFFLE
            }
            PlayMode.SHUFFLE -> {
                btnPlayMode.setImageResource(R.drawable.ic_repeat)
                Toast.makeText(context, "列表循环", Toast.LENGTH_SHORT).show()
                PlayMode.REPEAT_ALL
            }
        }
    }
    
    private fun updateSongInfo() {
        val song = playlist[currentSongIndex]
        tvSongTitle.text = song.title
        tvArtist.text = song.artist
        tvTotalTime.text = formatTime(song.duration)
        seekBarProgress.max = song.duration
    }
    
    private fun resetAndPlay() {
        mediaPlayer?.reset()
        if (isPlaying) {
            playMusic()
        }
    }
    
    private fun simulatePlay() {
        // 模拟播放进度
        val song = playlist[currentSongIndex]
        seekBarProgress.max = song.duration
        startProgressUpdate()
    }
    
    private fun startProgressUpdate() {
        updateProgressRunnable = object : Runnable {
            override fun run() {
                if (isPlaying) {
                    val currentPosition = seekBarProgress.progress + 1000
                    if (currentPosition <= seekBarProgress.max) {
                        seekBarProgress.progress = currentPosition
                        updateTimeDisplay(currentPosition)
                        handler.postDelayed(this, 1000)
                    } else {
                        // 歌曲播放完毕
                        playNext()
                    }
                }
            }
        }
        handler.post(updateProgressRunnable!!)
    }
    
    private fun stopProgressUpdate() {
        updateProgressRunnable?.let {
            handler.removeCallbacks(it)
        }
    }
    
    private fun updateTimeDisplay(position: Int) {
        tvCurrentTime.text = formatTime(position)
    }
    
    private fun formatTime(milliseconds: Int): String {
        val minutes = TimeUnit.MILLISECONDS.toMinutes(milliseconds.toLong())
        val seconds = TimeUnit.MILLISECONDS.toSeconds(milliseconds.toLong()) % 60
        return String.format("%02d:%02d", minutes, seconds)
    }
    
    override fun onDestroy() {
        super.onDestroy()
        mediaPlayer?.release()
        mediaPlayer = null
        stopProgressUpdate()
    }
    
    // 打开文件选择器
    private fun openMusicFilePicker() {
        try {
            filePickerLauncher.launch("audio/*")
        } catch (e: Exception) {
            Toast.makeText(context, "无法打开文件选择器", Toast.LENGTH_SHORT).show()
        }
    }
    
    // 处理选择的音乐文件
    private fun handleMusicFileSelected(uri: Uri) {
        try {
            val fileName = getFileName(uri)
            val metadata = extractMusicMetadata(uri)
            
            // 创建新的歌曲对象并添加到播放列表
            val newSong = Song(
                title = metadata["title"] ?: fileName,
                artist = metadata["artist"] ?: "未知艺术家",
                duration = metadata["duration"]?.toIntOrNull() ?: 0,
                uri = uri
            )
            
            playlist.add(newSong)
            currentSongIndex = playlist.size - 1
            currentMusicUri = uri
            
            // 更新UI并播放
            updateSongInfo()
            Toast.makeText(context, "已添加: ${newSong.title}", Toast.LENGTH_SHORT).show()
            
            // 准备播放新上传的音乐
            prepareMediaPlayer(uri)
            
        } catch (e: Exception) {
            Toast.makeText(context, "加载音乐失败: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }
    
    // 获取文件名
    private fun getFileName(uri: Uri): String {
        var name = "未知音乐"
        context?.contentResolver?.query(uri, null, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            cursor.moveToFirst()
            name = cursor.getString(nameIndex)
        }
        return name
    }
    
    // 提取音乐元数据
    private fun extractMusicMetadata(uri: Uri): Map<String, String> {
        val metadata = mutableMapOf<String, String>()
        try {
            val retriever = MediaMetadataRetriever()
            context?.let {
                retriever.setDataSource(it, uri)
                
                metadata["title"] = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_TITLE) ?: ""
                metadata["artist"] = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ARTIST) ?: ""
                metadata["album"] = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUM) ?: ""
                metadata["duration"] = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION) ?: "0"
                metadata["genre"] = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_GENRE) ?: ""
                
                retriever.release()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return metadata
    }
    
    // 准备MediaPlayer
    private fun prepareMediaPlayer(uri: Uri) {
        try {
            mediaPlayer?.release()
            mediaPlayer = MediaPlayer().apply {
                context?.let { setDataSource(it, uri) }
                prepareAsync()
                setOnPreparedListener {
                    seekBarProgress.max = duration
                    tvTotalTime.text = formatTime(duration)
                }
            }
        } catch (e: Exception) {
            Toast.makeText(context, "准备播放器失败: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }
    
    // 音乐文件解析
    private fun analyzeMusicFile() {
        if (currentMusicUri == null) {
            Toast.makeText(context, "请先上传音乐文件", Toast.LENGTH_SHORT).show()
            return
        }
        
        val metadata = extractMusicMetadata(currentMusicUri!!)
        showAnalysisDialog(metadata)
    }
    
    // 显示解析结果对话框
    private fun showAnalysisDialog(metadata: Map<String, String>) {
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_music_analysis, null)
        
        // 设置解析结果
        dialogView.findViewById<TextView>(R.id.tv_analysis_title)?.text = 
            "标题: ${metadata["title"] ?: "未知"}"
        dialogView.findViewById<TextView>(R.id.tv_analysis_artist)?.text = 
            "艺术家: ${metadata["artist"] ?: "未知"}"
        dialogView.findViewById<TextView>(R.id.tv_analysis_album)?.text = 
            "专辑: ${metadata["album"] ?: "未知"}"
        dialogView.findViewById<TextView>(R.id.tv_analysis_duration)?.text = 
            "时长: ${formatTime(metadata["duration"]?.toIntOrNull() ?: 0)}"
        dialogView.findViewById<TextView>(R.id.tv_analysis_genre)?.text = 
            "流派: ${metadata["genre"] ?: "未知"}"
        
        // 模拟音频特征分析
        dialogView.findViewById<TextView>(R.id.tv_analysis_bpm)?.text = 
            "BPM: ${(80..180).random()}"
        dialogView.findViewById<TextView>(R.id.tv_analysis_key)?.text = 
            "调性: ${listOf("C", "D", "E", "F", "G", "A", "B").random()} ${listOf("Major", "Minor").random()}"
        dialogView.findViewById<TextView>(R.id.tv_analysis_energy)?.text = 
            "能量值: ${(60..100).random()}%"
        
        AlertDialog.Builder(context)
            .setTitle("音乐解析结果")
            .setView(dialogView)
            .setPositiveButton("确定", null)
            .show()
    }
    
    // 显示播放列表
    private fun showPlaylist() {
        val songs = playlist.map { "${it.title} - ${it.artist}" }.toTypedArray()
        
        AlertDialog.Builder(context)
            .setTitle("播放列表")
            .setItems(songs) { _, which ->
                currentSongIndex = which
                updateSongInfo()
                playlist[which].uri?.let {
                    currentMusicUri = it
                    prepareMediaPlayer(it)
                } ?: run {
                    // 模拟播放
                    resetAndPlay()
                }
            }
            .setNegativeButton("关闭", null)
            .show()
    }
    
    // 修改播放音乐方法以支持真实文件
    private fun playMusicWithUri() {
        try {
            mediaPlayer?.start()
            isPlaying = true
            btnPlayPause.setImageResource(R.drawable.ic_pause)
            startProgressUpdate()
        } catch (e: Exception) {
            Toast.makeText(context, "播放失败: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }
    
    // 歌曲数据类
    data class Song(
        val title: String,
        val artist: String,
        val duration: Int, // 毫秒
        val uri: Uri? = null
    )
}