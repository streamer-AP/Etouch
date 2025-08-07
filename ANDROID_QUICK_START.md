# Android Quick Start Guide

## Prerequisites Checklist

- [x] Node.js 16+ installed
- [x] JDK 11 installed
- [x] Android Studio installed with SDK
- [x] Android SDK environment variables configured
- [x] Project dependencies installed (`npm install`)

## Running the App

### Method 1: Using PowerShell Script (Recommended)
```powershell
.\android-build.ps1
```

### Method 2: Manual Steps

1. **Start Android Emulator**
   - Open Android Studio
   - Click "AVD Manager" icon
   - Start your preferred emulator

2. **Install Dependencies** (if not done)
   ```bash
   npm install
   ```

3. **Start Metro Bundler**
   ```bash
   npx react-native start
   ```

4. **Run Android App** (in new terminal)
   ```bash
   npx react-native run-android
   ```

## Common Issues & Solutions

### Issue: "JAVA_HOME is not set"
**Solution:**
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-11"
$env:Path += ";$env:JAVA_HOME\bin"
```

### Issue: "SDK location not found"
**Solution:**
Ensure `android/local.properties` contains:
```
sdk.dir=C:\\Users\\yan\\AppData\\Local\\Android\\Sdk
```

### Issue: "Could not connect to development server"
**Solution:**
1. Check Metro bundler is running
2. For physical device: `adb reverse tcp:8081 tcp:8081`
3. Shake device and select "Settings" → Enter your computer's IP address

### Issue: Build fails with "Could not find tools.jar"
**Solution:**
Install JDK 11 (not just JRE) and set JAVA_HOME correctly

## Development Tips

### Debugging
- **Dev Menu**: Shake device or press `Ctrl+M` (Windows) in emulator
- **Reload**: Press `R` twice in emulator or select "Reload" from dev menu
- **Debug JS**: Select "Debug JS Remotely" from dev menu

### Hot Reload
Enabled by default. Your changes will appear instantly without rebuilding.

### Connecting to Backend
The app is configured to connect to:
- **Development**: `http://10.0.2.2:3000` (Android emulator)
- **Production**: Configure in `src/config/development.config.js`

### Running Backend Services
```bash
# In backend directory
cd backend
docker-compose up -d
npm run start:dev
```

## Build APK for Testing

### Debug APK
```bash
cd android
.\gradlew.bat assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK
1. Generate signing key (first time only)
2. Configure signing in `android/app/build.gradle`
3. Build:
```bash
cd android
.\gradlew.bat assembleRelease
```

## Useful Commands

```bash
# Clean build
cd android && .\gradlew.bat clean

# List connected devices
adb devices

# Install APK directly
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat *:S ReactNative:V ReactNativeJS:V

# Clear app data
adb shell pm clear com.smartdevicecontrol
```

## Project Structure
```
android/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/smartdevicecontrol/
│   │   │   │   ├── MainActivity.kt
│   │   │   │   └── MainApplication.kt
│   │   │   ├── res/
│   │   │   └── AndroidManifest.xml
│   └── build.gradle
├── gradle/
├── build.gradle
├── settings.gradle
└── local.properties
```

## Next Steps
1. ✅ Run the app on emulator
2. Test BLE connectivity with real device
3. Configure backend services
4. Test all features
5. Build release APK for distribution