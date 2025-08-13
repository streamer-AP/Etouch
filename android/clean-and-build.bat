@echo off
title Gradle Clean and Build

echo ========================================
echo   Gradle Clean and Build
echo ========================================

:: Set environment variables
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set ANDROID_HOME=C:\Users\yan\AppData\Local\Android\Sdk
set PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%PATH%

echo.
echo Cleaning Gradle build...
call gradlew.bat clean

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Clean successful!
    echo.
    echo Ready to build. You can now run:
    echo   npx react-native run-android
    echo.
) else (
    echo.
    echo ✗ Clean failed. Please check error messages above.
    echo.
)

pause