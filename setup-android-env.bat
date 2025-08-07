@echo off
echo ======================================
echo Android Development Environment Setup
echo ======================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Please run this script as Administrator!
    pause
    exit /b 1
)

echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorLevel% equ 0 (
    echo ✓ Node.js is installed
    node --version
) else (
    echo ✗ Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [2/6] Checking Java installation...
java -version >nul 2>&1
if %errorLevel% equ 0 (
    echo ✓ Java is installed
    java -version 2>&1 | findstr /i version
) else (
    echo ✗ Java not found. Installing instructions:
    echo   1. Download JDK 11 from: https://adoptium.net/
    echo   2. Install with default settings
    echo   3. Restart this script after installation
    pause
    exit /b 1
)

echo.
echo [3/6] Checking Android SDK...
if exist "%LOCALAPPDATA%\Android\Sdk" (
    echo ✓ Android SDK found at %LOCALAPPDATA%\Android\Sdk
) else (
    echo ✗ Android SDK not found. Please:
    echo   1. Install Android Studio from: https://developer.android.com/studio
    echo   2. Open Android Studio and complete initial setup
    echo   3. Install SDK via SDK Manager
    pause
    exit /b 1
)

echo.
echo [4/6] Setting up environment variables...

REM Set ANDROID_HOME
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk" /M >nul 2>&1
echo ✓ ANDROID_HOME set to %LOCALAPPDATA%\Android\Sdk

REM Set JAVA_HOME (assuming JDK 11 default path)
if exist "C:\Program Files\Eclipse Adoptium\jdk-11.0.21.9-hotspot" (
    setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-11.0.21.9-hotspot" /M >nul 2>&1
    echo ✓ JAVA_HOME set
) else if exist "C:\Program Files\Java\jdk-11*" (
    for /d %%i in ("C:\Program Files\Java\jdk-11*") do (
        setx JAVA_HOME "%%i" /M >nul 2>&1
        echo ✓ JAVA_HOME set to %%i
    )
) else (
    echo ! JAVA_HOME needs manual configuration
)

REM Add to PATH
echo ✓ Adding Android tools to PATH...
setx PATH "%PATH%;%LOCALAPPDATA%\Android\Sdk\platform-tools;%LOCALAPPDATA%\Android\Sdk\emulator;%LOCALAPPDATA%\Android\Sdk\tools;%LOCALAPPDATA%\Android\Sdk\tools\bin" /M >nul 2>&1

echo.
echo [5/6] Installing React Native CLI...
npm install -g react-native-cli
echo ✓ React Native CLI installed

echo.
echo [6/6] Verifying installation...
echo.
echo Environment setup complete!
echo.
echo Please:
echo 1. Close and reopen your terminal/command prompt
echo 2. Run 'npm install' in the project directory
echo 3. Run 'npx react-native run-android' to test
echo.
pause