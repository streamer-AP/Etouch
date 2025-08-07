# 沉浸体验模块

## 1. 模块概述

### 1.1 功能定位
沉浸体验模块是APP的核心特色功能，通过剧情演出、音频体验、内容导入等多维度功能，为用户提供独特的沉浸式互动体验。

### 1.2 模块架构

```
沉浸体验模块
├── 剧情演出系统
│   ├── 剧情列表
│   ├── 剧情播放器
│   ├── 交互节点
│   └── 设备联动
├── 音频体验系统
│   ├── 音频播放器
│   ├── 可视化效果
│   ├── 实时分析
│   └── 震动映射
├── 内容导入系统
│   ├── 文件导入
│   ├── 音频解析
│   ├── 模式生成
│   └── 云端同步
└── 实时捕捉系统
    ├── 系统音频捕获
    ├── 麦克风输入
    ├── 实时处理
    └── 动态控制
```

## 2. 剧情演出系统

### 2.1 剧情数据结构

```typescript
interface Story {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number; // 秒
  difficulty: 'easy' | 'normal' | 'hard';
  tags: string[];
  status: StoryStatus;
  chapters: Chapter[];
  requirements: StoryRequirements;
  statistics: StoryStatistics;
}

interface Chapter {
  id: string;
  title: string;
  order: number;
  scenes: Scene[];
  unlockCondition?: UnlockCondition;
}

interface Scene {
  id: string;
  type: 'dialogue' | 'animation' | 'interaction' | 'choice';
  duration: number;
  content: SceneContent;
  deviceCommands?: DeviceCommand[];
  transitions: Transition[];
}

interface SceneContent {
  // 对话场景
  dialogue?: {
    character: string;
    text: string;
    voice?: string; // 音频URL
    emotion?: string;
  };
  
  // 动画场景
  animation?: {
    characterId: string;
    animationName: string;
    loop: boolean;
  };
  
  // 交互场景
  interaction?: {
    type: 'tap' | 'swipe' | 'hold';
    zones: InteractionZone[];
    timeout?: number;
  };
  
  // 选择场景
  choice?: {
    question: string;
    options: ChoiceOption[];
    timer?: number;
  };
}

interface DeviceCommand {
  timestamp: number; // 相对于场景开始的时间
  channel: 'A' | 'B' | 'BOTH';
  action: 'vibrate' | 'pulse' | 'wave' | 'custom';
  intensity: number; // 0-100
  duration: number; // 毫秒
  pattern?: number[]; // 自定义模式
}
```

### 2.2 剧情播放器

```typescript
class StoryPlayer {
  private currentStory: Story;
  private currentChapter: Chapter;
  private currentScene: Scene;
  private playbackState: PlaybackState;
  private deviceController: DeviceController;
  
  async playStory(storyId: string) {
    // 1. 加载剧情数据
    this.currentStory = await this.loadStory(storyId);
    
    // 2. 检查解锁状态
    if (!this.isUnlocked(this.currentStory)) {
      throw new Error('Story is locked');
    }
    
    // 3. 初始化播放环境
    await this.initializePlayback();
    
    // 4. 开始播放
    await this.startPlayback();
  }
  
  private async playScene(scene: Scene) {
    // 渲染场景内容
    await this.renderScene(scene);
    
    // 执行设备命令
    if (scene.deviceCommands) {
      this.scheduleDeviceCommands(scene.deviceCommands);
    }
    
    // 处理场景交互
    await this.handleSceneInteraction(scene);
    
    // 场景转换
    await this.transitionToNext(scene);
  }
  
  private scheduleDeviceCommands(commands: DeviceCommand[]) {
    commands.forEach(cmd => {
      setTimeout(() => {
        this.deviceController.execute(cmd);
      }, cmd.timestamp);
    });
  }
}
```

### 2.3 剧情界面设计

```
┌─────────────────────────────────────┐
│  ← 剧情列表                         │
├─────────────────────────────────────┤
│                                     │
│  推荐剧情                           │
│  ┌─────────────┬─────────────┐     │
│  │ [缩略图]    │ [缩略图]    │     │
│  │ 初次见面    │ 浪漫约会    │     │
│  │ ⭐⭐⭐     │ ⭐⭐⭐⭐   │     │
│  │ 15分钟     │ 25分钟     │     │
│  └─────────────┴─────────────┘     │
│                                     │
│  全部剧情                           │
│  ┌─────────────────────────────┐   │
│  │ 📖 第一章：相遇            │   │
│  │    已解锁 | 15分钟         │   │
│  │    完成度: ████░ 80%       │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 🔒 第二章：心动            │   │
│  │    未解锁 | 20分钟         │   │
│  │    解锁条件: 完成第一章     │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 2.4 剧情播放界面

```
┌─────────────────────────────────────┐
│                                     │
│         [Live2D角色展示]            │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ 角色：你好，很高兴见到你     │   │
│  └─────────────────────────────┘   │
│                                     │
│  选择你的回应：                     │
│  [ 我也很高兴见到你 ]               │
│  [ 你是谁？ ]                      │
│  [ 保持沉默 ]                      │
│                                     │
│  ━━━━━━━━━━━━━━━━ 3:25/15:00      │
│                                     │
└─────────────────────────────────────┘
```

## 3. 音频体验系统

### 3.1 音频处理架构

```typescript
class AudioProcessor {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array;
  
  // 音频特征提取
  extractFeatures(audioBuffer: AudioBuffer): AudioFeatures {
    return {
      tempo: this.detectTempo(audioBuffer),
      energy: this.calculateEnergy(audioBuffer),
      frequency: this.analyzeFrequency(audioBuffer),
      rhythm: this.detectRhythm(audioBuffer),
      dynamics: this.analyzeDynamics(audioBuffer)
    };
  }
  
  // 节奏检测
  private detectTempo(buffer: AudioBuffer): number {
    // 使用自相关或onset detection算法
    const peaks = this.findPeaks(buffer);
    const intervals = this.calculateIntervals(peaks);
    return this.estimateBPM(intervals);
  }
  
  // FFT频谱分析
  private analyzeFrequency(buffer: AudioBuffer): FrequencyData {
    this.analyser.getByteFrequencyData(this.dataArray);
    
    return {
      bass: this.getFrequencyRange(20, 250),      // 低频
      midrange: this.getFrequencyRange(250, 4000), // 中频
      treble: this.getFrequencyRange(4000, 20000)  // 高频
    };
  }
}
```

### 3.2 震动映射算法

```typescript
class VibrationMapper {
  // 音频特征到震动强度的映射
  mapToVibration(features: AudioFeatures): VibrationPattern {
    const pattern = new VibrationPattern();
    
    // 基于节奏的震动
    if (features.rhythm.isRegular) {
      pattern.base = this.createRhythmicPattern(features.tempo);
    }
    
    // 基于能量的调制
    pattern.intensity = this.mapEnergyToIntensity(features.energy);
    
    // 基于频率的变化
    pattern.modulation = this.createFrequencyModulation(features.frequency);
    
    // 动态响应
    pattern.dynamics = this.mapDynamics(features.dynamics);
    
    return pattern;
  }
  
  // 预设映射模式
  private presetMappings = {
    rock: {
      bassEmphasis: 0.8,
      rhythmWeight: 0.7,
      intensityRange: [60, 100]
    },
    classical: {
      bassEmphasis: 0.3,
      rhythmWeight: 0.4,
      intensityRange: [20, 70]
    },
    electronic: {
      bassEmphasis: 0.9,
      rhythmWeight: 0.9,
      intensityRange: [40, 100]
    }
  };
}
```

### 3.3 音频播放器界面

```
┌─────────────────────────────────────┐
│         音频体验                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │                              │   │
│  │     [音频波形可视化]         │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  正在播放：Summer Vibes             │
│  艺术家：Unknown Artist             │
│                                     │
│  ⏮  ⏸  ⏭                         │
│                                     │
│  ━━━━━●━━━━━━━━━ 2:15/4:30        │
│                                     │
│  震动强度                           │
│  ████████░░ 80%                    │
│                                     │
│  预设模式                           │
│  [流行] [摇滚] [古典] [电子]        │
│                                     │
│  频谱分析                           │
│  低频 ████████░░                   │
│  中频 ██████░░░░                   │
│  高频 ████░░░░░░                   │
│                                     │
└─────────────────────────────────────┘
```

## 4. 内容导入系统

### 4.1 文件导入流程

```typescript
class ContentImporter {
  // 支持的格式
  private supportedFormats = {
    audio: ['.mp3', '.wav', '.aac', '.m4a', '.flac'],
    video: ['.mp4', '.mov', '.avi'],
    playlist: ['.m3u', '.pls']
  };
  
  async importFile(file: File): Promise<ImportResult> {
    // 1. 验证文件
    const validation = await this.validateFile(file);
    if (!validation.isValid) {
      throw new ImportError(validation.error);
    }
    
    // 2. 提取音频
    const audioData = await this.extractAudio(file);
    
    // 3. 分析音频
    const analysis = await this.analyzeAudio(audioData);
    
    // 4. 生成震动模式
    const pattern = await this.generatePattern(analysis);
    
    // 5. 保存结果
    const result = await this.saveImport({
      originalFile: file,
      audioData,
      analysis,
      pattern
    });
    
    return result;
  }
  
  // 批量导入
  async batchImport(files: File[]): Promise<BatchImportResult> {
    const results = [];
    const errors = [];
    
    for (const file of files) {
      try {
        const result = await this.importFile(file);
        results.push(result);
      } catch (error) {
        errors.push({ file: file.name, error });
      }
    }
    
    return { success: results, failed: errors };
  }
}
```

### 4.2 音频分析引擎

```typescript
class AudioAnalysisEngine {
  // 深度分析音频特征
  async deepAnalyze(audioBuffer: AudioBuffer): Promise<DeepAnalysis> {
    const analysis = {
      // 基础信息
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
      
      // 音频特征
      tempo: await this.analyzeTempo(audioBuffer),
      key: await this.detectKey(audioBuffer),
      mood: await this.analyzeMood(audioBuffer),
      genre: await this.classifyGenre(audioBuffer),
      
      // 结构分析
      structure: await this.analyzeStructure(audioBuffer),
      segments: await this.detectSegments(audioBuffer),
      
      // 动态特征
      dynamics: await this.analyzeDynamics(audioBuffer),
      energy: await this.calculateEnergyProfile(audioBuffer),
      
      // 频谱特征
      spectrum: await this.analyzeSpectrum(audioBuffer),
      harmonics: await this.detectHarmonics(audioBuffer)
    };
    
    return analysis;
  }
  
  // AI辅助分析（可选）
  async aiAnalysis(audioBuffer: AudioBuffer): Promise<AIAnalysisResult> {
    const features = await this.extractMLFeatures(audioBuffer);
    const prediction = await this.mlModel.predict(features);
    
    return {
      genre: prediction.genre,
      mood: prediction.mood,
      intensity: prediction.intensity,
      suggestedPattern: prediction.pattern
    };
  }
}
```

### 4.3 导入界面设计

```
┌─────────────────────────────────────┐
│         音频导入                     │
├─────────────────────────────────────┤
│                                     │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│  │                              │   │
│  │    拖拽文件到此处             │   │
│  │         或                   │   │
│  │    [选择文件]                │   │
│  │                              │   │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
│                                     │
│  支持格式：MP3, WAV, AAC, M4A       │
│                                     │
│  正在处理                           │
│  ┌─────────────────────────────┐   │
│  │ 🎵 song1.mp3                │   │
│  │    分析中... ████░░ 60%     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ✅ song2.mp3                │   │
│  │    分析完成                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  分析选项                           │
│  □ 自动检测节奏                    │
│  ☑ 增强低频响应                    │
│  □ AI智能优化                      │
│                                     │
└─────────────────────────────────────┘
```

## 5. 实时音频捕捉

### 5.1 系统音频捕获

```typescript
class SystemAudioCapture {
  private captureStream: MediaStream;
  private audioContext: AudioContext;
  private processor: ScriptProcessorNode;
  
  // iOS实现
  async startCaptureIOS() {
    // 使用ReplayKit或AVAudioEngine
    if (this.isReplayKitAvailable()) {
      const recorder = RPScreenRecorder.shared();
      await recorder.startCapture({
        audio: true,
        video: false
      });
    }
  }
  
  // Android实现
  async startCaptureAndroid() {
    // 使用MediaProjection API
    const projection = await this.requestMediaProjection();
    const audioRecord = new AudioRecord({
      source: MediaRecorder.AudioSource.REMOTE_SUBMIX,
      sampleRate: 44100,
      channelConfig: AudioFormat.CHANNEL_IN_STEREO
    });
    
    audioRecord.startRecording();
  }
  
  // 实时处理
  processAudioData(inputBuffer: Float32Array) {
    // 实时FFT
    const spectrum = this.fft(inputBuffer);
    
    // 特征提取
    const features = this.extractRealtimeFeatures(spectrum);
    
    // 生成控制信号
    const control = this.generateControl(features);
    
    // 发送到设备
    this.sendToDevice(control);
  }
}
```

### 5.2 实时响应算法

```typescript
class RealtimeResponseEngine {
  private responseLatency = 50; // 目标延迟50ms
  private bufferSize = 256; // 缓冲区大小
  private smoothingFactor = 0.8; // 平滑系数
  
  // 低延迟处理管线
  process(audioData: Float32Array): DeviceControl {
    // 1. 快速特征提取
    const features = this.fastFeatureExtraction(audioData);
    
    // 2. 预测下一帧
    const prediction = this.predictNext(features);
    
    // 3. 平滑处理
    const smoothed = this.smooth(prediction);
    
    // 4. 生成控制
    return this.generateControl(smoothed);
  }
  
  // 自适应算法
  private adaptiveResponse(features: RealtimeFeatures) {
    // 根据音频特征动态调整参数
    if (features.isPercussive) {
      this.smoothingFactor = 0.3; // 减少平滑，增加响应
    } else if (features.isMelodic) {
      this.smoothingFactor = 0.8; // 增加平滑，柔和响应
    }
    
    // 动态调整延迟
    if (features.tempo > 140) {
      this.responseLatency = 30; // 快节奏，降低延迟
    } else {
      this.responseLatency = 50; // 正常延迟
    }
  }
}
```

### 5.3 实时捕捉界面

```
┌─────────────────────────────────────┐
│         实时音频捕捉                 │
├─────────────────────────────────────┤
│                                     │
│  音频源                             │
│  ○ 系统音频                        │
│  ● 麦克风                          │
│  ○ 混合输入                        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                              │   │
│  │    [实时频谱显示]            │   │
│  │    |||||||||||||||           │   │
│  │                              │   │
│  └─────────────────────────────┘   │
│                                     │
│  实时响应                           │
│  延迟: 32ms | CPU: 15%             │
│                                     │
│  灵敏度 ──────●────── 70%          │
│  平滑度 ────●──────── 40%          │
│                                     │
│  预设模式                           │
│  [音乐] [语音] [游戏] [自定义]      │
│                                     │
│  [■ 开始捕捉]                      │
│                                     │
└─────────────────────────────────────┘
```

## 6. 内容管理

### 6.1 本地内容管理

```typescript
class LocalContentManager {
  private storage: LocalStorage;
  private database: ContentDatabase;
  
  // 内容分类
  categories = {
    stories: '剧情',
    audio: '音频',
    patterns: '震动模式',
    custom: '自定义'
  };
  
  // 存储管理
  async manageStorage() {
    const usage = await this.calculateStorageUsage();
    
    if (usage.percentage > 80) {
      // 清理策略
      await this.cleanupOldContent();
      await this.compressLargeFiles();
    }
    
    return {
      used: usage.used,
      total: usage.total,
      available: usage.available
    };
  }
  
  // 内容同步
  async syncContent() {
    const localContent = await this.getLocalContent();
    const cloudContent = await this.getCloudContent();
    
    const toUpload = this.findNewLocal(localContent, cloudContent);
    const toDownload = this.findNewCloud(localContent, cloudContent);
    
    await this.uploadContent(toUpload);
    await this.downloadContent(toDownload);
  }
}
```

### 6.2 云端内容服务

```typescript
class CloudContentService {
  // 内容上传
  async uploadContent(content: Content): Promise<UploadResult> {
    // 1. 压缩内容
    const compressed = await this.compress(content);
    
    // 2. 分片上传
    const chunks = this.splitIntoChunks(compressed);
    const uploadTasks = chunks.map(chunk => this.uploadChunk(chunk));
    
    // 3. 并行上传
    await Promise.all(uploadTasks);
    
    // 4. 验证完整性
    return await this.verifyUpload(content.id);
  }
  
  // 内容推荐
  async getRecommendations(userId: string): Promise<Content[]> {
    const userProfile = await this.getUserProfile(userId);
    const recommendations = await this.recommendationEngine.generate({
      preferences: userProfile.preferences,
      history: userProfile.history,
      trending: await this.getTrending()
    });
    
    return recommendations;
  }
}
```

## 7. 性能优化

### 7.1 音频处理优化

```typescript
class AudioOptimization {
  // Web Audio API优化
  optimizeWebAudio() {
    // 使用OfflineAudioContext预处理
    // 使用Worker进行后台处理
    // 使用WASM加速计算密集型操作
  }
  
  // 缓冲策略
  private bufferStrategy = {
    preloadSize: 30, // 预加载30秒
    minBuffer: 5,    // 最小缓冲5秒
    maxBuffer: 60    // 最大缓冲60秒
  };
  
  // 内存管理
  manageMemory() {
    // 及时释放AudioBuffer
    // 使用对象池复用
    // 限制同时处理的音频数量
  }
}
```

### 7.2 渲染优化

```typescript
class RenderOptimization {
  // 可视化优化
  optimizeVisualization() {
    // 使用Canvas而非SVG
    // 降低刷新率到30fps
    // 使用requestAnimationFrame
    // 离屏渲染
  }
  
  // UI响应优化
  optimizeUIResponse() {
    // 防抖和节流
    // 虚拟列表
    // 懒加载
    // 预渲染
  }
}
```

## 8. 错误处理

### 8.1 错误恢复

```typescript
class ErrorRecovery {
  // 音频播放错误
  async handlePlaybackError(error: PlaybackError) {
    switch (error.type) {
      case 'DECODE_ERROR':
        // 尝试其他解码器
        return this.tryAlternativeDecoder();
        
      case 'NETWORK_ERROR':
        // 使用本地缓存
        return this.useLocalCache();
        
      case 'FORMAT_ERROR':
        // 转换格式
        return this.convertFormat();
    }
  }
  
  // 导入错误
  async handleImportError(error: ImportError) {
    // 提供详细错误信息
    // 建议解决方案
    // 自动重试机制
  }
}
```

## 更新历史

| 版本 | 日期 | 更新内容 | 更新人 |
|------|------|---------|--------|
| v2.0 | 2025-08-07 | 完整的沉浸体验模块文档 | System |
| v1.0 | 2025-08-01 | 初始版本 | System |