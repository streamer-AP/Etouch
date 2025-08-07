# 📱 Android编译运行指南

## 📋 目录
1. [环境准备](#环境准备)
2. [项目配置](#项目配置)
3. [编译运行](#编译运行)
4. [打包发布](#打包发布)
5. [常见问题](#常见问题)
6. [性能优化](#性能优化)

---

## 🛠️ 环境准备

### 1. 系统要求

| 项目 | 最低要求 | 推荐配置 |
|------|---------|---------|
| **操作系统** | Windows 10/macOS 10.14/Ubuntu 18.04 | Windows 11/macOS 12+/Ubuntu 20.04 |
| **内存** | 8GB RAM | 16GB RAM |
| **存储** | 20GB可用空间 | 50GB+ SSD |
| **处理器** | Intel i5/AMD Ryzen 5 | Intel i7/AMD Ryzen 7 |

### 2. 安装必需软件

#### 2.1 安装Node.js
```bash
# 下载并安装Node.js (推荐使用LTS版本)
# 官网: https://nodejs.org/

# 验证安装
node --version  # 应显示 v16.0.0 或更高
npm --version   # 应显示 8.0.0 或更高
```

#### 2.2 安装Java Development Kit (JDK)
```bash
# 安装JDK 11 (React Native要求)
# Windows: 下载并安装 https://adoptium.net/
# macOS: 
brew install --cask adoptopenjdk11
# Ubuntu:
sudo apt-get install openjdk-11-jdk

# 验证安装
java -version  # 应显示 java version "11.x.x"
javac -version # 应显示 javac 11.x.x
```

#### 2.3 安装Android Studio
```bash
# 1. 下载Android Studio
# 官网: https://developer.android.com/studio

# 2. 安装时选择以下组件:
# - Android SDK
# - Android SDK Platform
# - Android Virtual Device (AVD)

# 3. 安装完成后，打开Android Studio
# - 点击 Configure → SDK Manager
# - 安装以下内容:
```

**SDK Platforms:**
- ✅ Android 13.0 (Tiramisu) - API Level 33
- ✅ Android 12.0 (S) - API Level 31
- ✅ Android 11.0 (R) - API Level 30

**SDK Tools:**
- ✅ Android SDK Build-Tools 33.0.0
- ✅ Android SDK Command-line Tools
- ✅ Android Emulator
- ✅ Android SDK Platform-Tools
- ✅ Intel x86 Emulator Accelerator (HAXM installer)

#### 2.4 配置环境变量

**Windows环境变量设置:**
```powershell
# 打开系统环境变量设置
# 添加以下环境变量:

ANDROID_HOME = C:\Users\<用户名>\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Java\jdk-11.0.x

# 添加到Path:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

**macOS/Linux环境变量设置:**
```bash
# 编辑 ~/.bash_profile 或 ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# export ANDROID_HOME=$HOME/Android/Sdk        # Linux

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.0.x.jdk/Contents/Home  # macOS
# export JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64  # Linux

# 重新加载配置
source ~/.bash_profile  # 或 source ~/.zshrc
```

#### 2.5 安装React Native CLI
```bash
# 安装React Native CLI
npm install -g react-native-cli

# 或使用 npx (推荐)
npx react-native --version
```

---

## ⚙️ 项目配置

### 1. 克隆并安装项目

```bash
# 克隆项目
git clone https://github.com/your-org/etouch.git
cd etouch

# 安装依赖
npm install

# 清理缓存（如果需要）
cd android && ./gradlew clean && cd ..
npx react-native start --reset-cache
```

### 2. Android项目配置

#### 2.1 检查gradle配置
```gradle
// android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=4096m -XX:+HeapDumpOnOutOfMemoryError
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
android.useAndroidX=true
android.enableJetifier=true

# 如果在中国，添加以下配置加速下载
systemProp.http.proxyHost=127.0.0.1
systemProp.http.proxyPort=7890
systemProp.https.proxyHost=127.0.0.1
systemProp.https.proxyPort=7890
```

#### 2.2 配置签名（用于发布版本）
```gradle
// android/app/build.gradle
android {
    ...
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. 配置后端连接

```javascript
// src/config/api.config.js
const API_CONFIG = {
  // 开发环境
  development: {
    // 使用电脑IP地址，不要用localhost
    API_BASE_URL: 'http://192.168.1.100:3000', // 替换为你的电脑IP
    WS_URL: 'ws://192.168.1.100:3000',
  },
  // 生产环境
  production: {
    API_BASE_URL: 'https://api.yourdomain.com',
    WS_URL: 'wss://api.yourdomain.com',
  },
};

export default API_CONFIG[__DEV__ ? 'development' : 'production'];
```

---

## 🚀 编译运行

### 1. 使用真机调试（推荐）

#### 1.1 准备Android手机
```bash
# 1. 在手机上启用开发者选项
# 设置 → 关于手机 → 连续点击"版本号"7次

# 2. 启用USB调试
# 设置 → 开发者选项 → USB调试 → 开启

# 3. 连接手机到电脑
# 选择"传输文件"模式

# 4. 验证连接
adb devices
# 应显示类似: 
# List of devices attached
# XXXXXXXX    device
```

#### 1.2 运行应用
```bash
# 启动后端服务（在另一个终端）
cd backend
docker-compose up -d
npm run start:dev

# 启动Metro bundler（在新终端）
npx react-native start

# 在连接的设备上运行（在新终端）
npx react-native run-android

# 或使用npm脚本
npm run android
```

### 2. 使用模拟器调试

#### 2.1 创建Android虚拟设备(AVD)
```bash
# 方法1: 通过Android Studio
# 1. 打开Android Studio
# 2. Tools → AVD Manager
# 3. Create Virtual Device
# 4. 选择设备 (推荐Pixel 4)
# 5. 选择系统镜像 (推荐API 31)
# 6. 完成创建

# 方法2: 命令行创建
avdmanager create avd -n "Pixel_4_API_31" -k "system-images;android-31;google_apis;x86_64"
```

#### 2.2 启动模拟器并运行
```bash
# 列出可用的模拟器
emulator -list-avds

# 启动模拟器
emulator -avd Pixel_4_API_31

# 等待模拟器完全启动后，运行应用
npx react-native run-android
```

### 3. 开发调试技巧

#### 3.1 启用开发者菜单
```bash
# 真机: 摇晃设备
# 模拟器: Ctrl+M (Windows/Linux) 或 Cmd+M (macOS)

# 开发者菜单选项:
# - Reload: 重新加载应用
# - Debug: 打开Chrome调试
# - Enable Hot Reloading: 启用热重载
# - Show Inspector: 显示元素检查器
```

#### 3.2 查看日志
```bash
# 查看所有日志
adb logcat

# 过滤React Native日志
adb logcat *:S ReactNative:V ReactNativeJS:V

# 使用react-native log
npx react-native log-android

# 清除日志
adb logcat -c
```

#### 3.3 调试网络请求
```javascript
// 在 index.js 或 App.js 中添加
if (__DEV__) {
  // 启用网络请求调试
  global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
  global.FormData = global.originalFormData || global.FormData;
  
  // 安装Flipper进行高级调试
  import('react-native-flipper').then(({default: flipper}) => {
    flipper();
  });
}
```

---

## 📦 打包发布

### 1. 生成签名密钥

```bash
# 生成release密钥
keytool -genkeypair -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 将密钥文件放到android/app目录下
mv my-release-key.keystore android/app/

# 配置gradle.properties
# android/gradle.properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=你的密码
MYAPP_RELEASE_KEY_PASSWORD=你的密码
```

### 2. 构建APK

#### 2.1 Debug APK
```bash
cd android
./gradlew assembleDebug

# APK位置: android/app/build/outputs/apk/debug/app-debug.apk
```

#### 2.2 Release APK
```bash
cd android

# 清理之前的构建
./gradlew clean

# 构建Release APK
./gradlew assembleRelease

# APK位置: android/app/build/outputs/apk/release/app-release.apk
```

### 3. 构建AAB (推荐用于Google Play)

```bash
cd android

# 构建AAB包
./gradlew bundleRelease

# AAB位置: android/app/build/outputs/bundle/release/app-release.aab

# 测试AAB包
java -jar bundletool.jar build-apks --bundle=app-release.aab --output=app-release.apks --mode=universal
```

### 4. 优化APK大小

```gradle
// android/app/build.gradle
android {
    buildTypes {
        release {
            // 启用代码压缩
            minifyEnabled true
            // 启用资源压缩
            shrinkResources true
            // ProGuard配置
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            
            // 分离ABI
            ndk {
                abiFilters "armeabi-v7a", "arm64-v8a"
            }
        }
    }
    
    // 启用APK分割
    splits {
        abi {
            enable true
            reset()
            include "armeabi-v7a", "arm64-v8a"
            universalApk false
        }
    }
}
```

---

## ❓ 常见问题

### 问题1: Metro连接失败
```bash
# 错误: Could not connect to development server

# 解决方案:
# 1. 确保Metro正在运行
npx react-native start

# 2. 清除缓存
npx react-native start --reset-cache

# 3. 配置正确的IP地址
adb reverse tcp:8081 tcp:8081

# 4. 在手机上手动设置服务器地址
# 摇晃设备 → Dev Settings → Debug server host
# 输入: 192.168.1.100:8081 (你的电脑IP)
```

### 问题2: 构建失败
```bash
# 错误: Could not compile settings file

# 解决方案:
cd android
./gradlew clean
./gradlew --stop
rm -rf ~/.gradle/caches/
cd ..
npx react-native run-android
```

### 问题3: 依赖冲突
```bash
# 错误: Duplicate class found

# 解决方案:
# 1. 清理并重新安装
cd android && ./gradlew clean && cd ..
rm -rf node_modules
npm install

# 2. 强制使用特定版本
# android/app/build.gradle
configurations.all {
    resolutionStrategy {
        force 'com.facebook.react:react-native:0.72.6'
    }
}
```

### 问题4: 内存不足
```gradle
// android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=4096m
org.gradle.daemon=true
org.gradle.parallel=true
android.enableJetifier=true
android.useAndroidX=true
```

### 问题5: 设备未授权
```bash
# 错误: device unauthorized

# 解决方案:
# 1. 断开USB连接
# 2. 撤销USB调试授权
#    设置 → 开发者选项 → 撤销USB调试授权
# 3. 重新连接并授权
adb kill-server
adb start-server
adb devices
```

---

## ⚡ 性能优化

### 1. 启用Hermes引擎
```gradle
// android/app/build.gradle
project.ext.react = [
    enableHermes: true,  // 启用Hermes
]
```

### 2. 启用ProGuard
```gradle
// android/app/proguard-rules.pro
# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep,allowobfuscation @interface com.facebook.common.internal.DoNotStrip

# 保持自定义组件
-keep class com.yourpackage.** { *; }
```

### 3. 图片优化
```javascript
// 使用WebP格式
import FastImage from 'react-native-fast-image';

<FastImage
  style={styles.image}
  source={{
    uri: 'https://example.com/image.webp',
    priority: FastImage.priority.normal,
  }}
  resizeMode={FastImage.resizeMode.contain}
/>
```

### 4. 减少JS Bundle大小
```bash
# 分析Bundle大小
npx react-native-bundle-visualizer

# 移除未使用的依赖
npm prune

# 使用动态导入
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

---

## 📱 测试检查清单

### 发布前检查
- [ ] 所有功能正常工作
- [ ] 没有控制台错误
- [ ] API连接正确（生产环境）
- [ ] 移除所有console.log
- [ ] 启用ProGuard和Hermes
- [ ] APK大小合理（<50MB）
- [ ] 在多种设备上测试
- [ ] 检查内存泄漏
- [ ] 测试网络断开情况
- [ ] 测试横竖屏切换

### 性能指标
- 启动时间: < 3秒
- 页面切换: < 500ms
- 内存使用: < 200MB
- FPS: > 55
- JS线程: < 16ms/帧

---

## 📚 相关资源

- [React Native官方文档](https://reactnative.dev/docs/getting-started)
- [Android开发者文档](https://developer.android.com/docs)
- [Gradle构建文档](https://docs.gradle.org/)
- [ProGuard规则](https://www.guardsquare.com/manual/configuration/usage)
- [性能优化指南](https://reactnative.dev/docs/performance)

---

**最后更新**: 2024-01-07
**文档版本**: v1.0.0