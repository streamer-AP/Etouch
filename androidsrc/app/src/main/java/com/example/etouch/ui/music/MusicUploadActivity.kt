package com.example.etouch.ui.music

import android.app.Activity
import android.content.Intent
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.etouch.R
import com.example.etouch.api.ApiService
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.android.material.switchmaterial.SwitchMaterial
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream

class MusicUploadActivity : AppCompatActivity() {
    
    private lateinit var btnSelectFile: Button
    private lateinit var tvFileName: TextView
    private lateinit var tvFileInfo: TextView
    private lateinit var etTitle: EditText
    private lateinit var etArtist: EditText
    private lateinit var etAlbum: EditText
    private lateinit var etCategory: EditText
    private lateinit var etTags: EditText
    private lateinit var etBpm: EditText
    private lateinit var sbEnergyLevel: SeekBar
    private lateinit var tvEnergyLevel: TextView
    private lateinit var switchPublic: SwitchMaterial
    private lateinit var switchAutoGenerate: SwitchMaterial
    private lateinit var btnUpload: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var tvUploadStatus: TextView
    
    private lateinit var apiService: ApiService
    private var selectedFileUri: Uri? = null
    private var fileSize: Long = 0
    private var duration: Int = 0
    private var format: String = ""
    
    companion object {
        private const val REQUEST_CODE_PICK_AUDIO = 1001
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_music_upload)
        
        apiService = ApiService.getInstance(this)
        initViews()
        setupListeners()
    }
    
    private fun initViews() {
        btnSelectFile = findViewById(R.id.btn_select_file)
        tvFileName = findViewById(R.id.tv_file_name)
        tvFileInfo = findViewById(R.id.tv_file_info)
        etTitle = findViewById(R.id.et_title)
        etArtist = findViewById(R.id.et_artist)
        etAlbum = findViewById(R.id.et_album)
        etCategory = findViewById(R.id.et_category)
        etTags = findViewById(R.id.et_tags)
        etBpm = findViewById(R.id.et_bpm)
        sbEnergyLevel = findViewById(R.id.sb_energy_level)
        tvEnergyLevel = findViewById(R.id.tv_energy_level)
        switchPublic = findViewById(R.id.switch_public)
        switchAutoGenerate = findViewById(R.id.switch_auto_generate)
        btnUpload = findViewById(R.id.btn_upload)
        progressBar = findViewById(R.id.progress_upload)
        tvUploadStatus = findViewById(R.id.tv_upload_status)
        
        // 设置能量等级显示
        tvEnergyLevel.text = "能量等级: 5"
        sbEnergyLevel.progress = 5
    }
    
    private fun setupListeners() {
        btnSelectFile.setOnClickListener {
            selectAudioFile()
        }
        
        sbEnergyLevel.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                tvEnergyLevel.text = "能量等级: $progress"
            }
            
            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })
        
        btnUpload.setOnClickListener {
            if (validateInput()) {
                uploadMusic()
            }
        }
    }
    
    private fun selectAudioFile() {
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "audio/*"
            addCategory(Intent.CATEGORY_OPENABLE)
        }
        startActivityForResult(
            Intent.createChooser(intent, "选择音乐文件"),
            REQUEST_CODE_PICK_AUDIO
        )
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == REQUEST_CODE_PICK_AUDIO && resultCode == Activity.RESULT_OK) {
            data?.data?.let { uri ->
                selectedFileUri = uri
                extractAudioMetadata(uri)
            }
        }
    }
    
    private fun extractAudioMetadata(uri: Uri) {
        try {
            // 获取文件名和大小
            contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
                cursor.moveToFirst()
                
                val fileName = cursor.getString(nameIndex)
                fileSize = cursor.getLong(sizeIndex)
                
                tvFileName.text = fileName
                format = fileName.substringAfterLast('.', "mp3").uppercase()
                
                // 设置默认标题为文件名（去掉扩展名）
                if (etTitle.text.isEmpty()) {
                    etTitle.setText(fileName.substringBeforeLast('.'))
                }
            }
            
            // 使用MediaMetadataRetriever提取音频元数据
            val retriever = MediaMetadataRetriever()
            retriever.setDataSource(this, uri)
            
            // 获取时长
            val durationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
            duration = (durationStr?.toLongOrNull() ?: 0L).div(1000).toInt()
            
            // 获取艺术家
            val artist = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ARTIST)
            if (!artist.isNullOrEmpty() && etArtist.text.isEmpty()) {
                etArtist.setText(artist)
            }
            
            // 获取专辑
            val album = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUM)
            if (!album.isNullOrEmpty() && etAlbum.text.isEmpty()) {
                etAlbum.setText(album)
            }
            
            // 获取标题
            val title = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_TITLE)
            if (!title.isNullOrEmpty()) {
                etTitle.setText(title)
            }
            
            retriever.release()
            
            // 显示文件信息
            val fileSizeMB = fileSize / (1024 * 1024)
            val minutes = duration / 60
            val seconds = duration % 60
            tvFileInfo.text = "格式: $format | 大小: ${fileSizeMB}MB | 时长: ${minutes}分${seconds}秒"
            tvFileInfo.visibility = View.VISIBLE
            
            // 启用上传按钮
            btnUpload.isEnabled = true
            
        } catch (e: Exception) {
            Toast.makeText(this, "无法读取音频文件信息: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
    
    private fun validateInput(): Boolean {
        if (selectedFileUri == null) {
            Toast.makeText(this, "请先选择音乐文件", Toast.LENGTH_SHORT).show()
            return false
        }
        
        if (etTitle.text.toString().trim().isEmpty()) {
            etTitle.error = "请输入歌曲标题"
            return false
        }
        
        val bpmText = etBpm.text.toString().trim()
        if (bpmText.isNotEmpty()) {
            val bpm = bpmText.toIntOrNull()
            if (bpm == null || bpm < 60 || bpm > 200) {
                etBpm.error = "BPM应在60-200之间"
                return false
            }
        }
        
        return true
    }
    
    private fun uploadMusic() {
        val title = etTitle.text.toString().trim()
        val artist = etArtist.text.toString().trim()
        val album = etAlbum.text.toString().trim()
        val category = etCategory.text.toString().trim()
        val tags = etTags.text.toString().trim()
        val bpm = etBpm.text.toString().trim().toIntOrNull()
        val energyLevel = sbEnergyLevel.progress
        val isPublic = switchPublic.isChecked
        val autoGenerateSequence = switchAutoGenerate.isChecked
        
        showUploadProgress(true)
        tvUploadStatus.text = "正在上传文件..."
        
        lifecycleScope.launch {
            try {
                // 第一步：上传文件到服务器
                val tempFile = copyUriToTempFile(selectedFileUri!!)
                
                val uploadResult = apiService.uploadMusicFile(tempFile) { progress ->
                    runOnUiThread {
                        progressBar.progress = progress
                        tvUploadStatus.text = "上传进度: $progress%"
                    }
                }
                
                uploadResult.fold(
                    onSuccess = { fileUrl ->
                        tvUploadStatus.text = "创建音乐记录..."
                        
                        // 第二步：创建音乐记录
                        val musicData = ApiService.MusicUploadRequest(
                            title = title,
                            artist = artist.ifEmpty { null },
                            album = album.ifEmpty { null },
                            durationSeconds = duration,
                            fileUrl = fileUrl,
                            fileSize = fileSize,
                            format = format,
                            bpm = bpm,
                            energyLevel = energyLevel,
                            category = category.ifEmpty { null },
                            tags = tags.ifEmpty { null },
                            isPublic = isPublic,
                            autoGenerateSequence = autoGenerateSequence
                        )
                        
                        val createResult = apiService.createMusicRecord(musicData)
                        
                        createResult.fold(
                            onSuccess = { musicItem ->
                                showUploadProgress(false)
                                Toast.makeText(
                                    this@MusicUploadActivity,
                                    "音乐上传成功！",
                                    Toast.LENGTH_LONG
                                ).show()
                                
                                // 返回结果并关闭页面
                                setResult(Activity.RESULT_OK)
                                finish()
                            },
                            onFailure = { exception ->
                                showUploadProgress(false)
                                Toast.makeText(
                                    this@MusicUploadActivity,
                                    "创建音乐记录失败: ${exception.message}",
                                    Toast.LENGTH_LONG
                                ).show()
                            }
                        )
                        
                        // 删除临时文件
                        tempFile.delete()
                    },
                    onFailure = { exception ->
                        showUploadProgress(false)
                        Toast.makeText(
                            this@MusicUploadActivity,
                            "文件上传失败: ${exception.message}",
                            Toast.LENGTH_LONG
                        ).show()
                        tempFile.delete()
                    }
                )
                
            } catch (e: Exception) {
                showUploadProgress(false)
                Toast.makeText(
                    this@MusicUploadActivity,
                    "上传过程出错: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
    
    private fun copyUriToTempFile(uri: Uri): File {
        val tempFile = File(cacheDir, "temp_audio_${System.currentTimeMillis()}.${format.lowercase()}")
        
        contentResolver.openInputStream(uri)?.use { input ->
            FileOutputStream(tempFile).use { output ->
                input.copyTo(output)
            }
        }
        
        return tempFile
    }
    
    private fun showUploadProgress(show: Boolean) {
        progressBar.visibility = if (show) View.VISIBLE else View.GONE
        tvUploadStatus.visibility = if (show) View.VISIBLE else View.GONE
        btnUpload.isEnabled = !show
        btnSelectFile.isEnabled = !show
    }
}