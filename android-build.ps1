# Android Build Script for Smart Device Control

Write-Host "=== Smart Device Control - Android Build ===" -ForegroundColor Green

# Check if dependencies are installed
Write-Host "`nChecking dependencies..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = node -v 2>$null
if ($?) {
    Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

# Check Java
$javaVersion = java -version 2>&1 | Select-String "version"
if ($?) {
    Write-Host "✓ Java installed" -ForegroundColor Green
} else {
    Write-Host "✗ Java not found. Please install JDK 11" -ForegroundColor Red
    exit 1
}

# Check Android SDK
if (Test-Path "$env:LOCALAPPDATA\Android\Sdk") {
    Write-Host "✓ Android SDK found" -ForegroundColor Green
} else {
    Write-Host "✗ Android SDK not found. Please install Android Studio" -ForegroundColor Red
    exit 1
}

# Clean previous builds
Write-Host "`nCleaning previous builds..." -ForegroundColor Yellow
Set-Location android
if (Test-Path ".\gradlew.bat") {
    .\gradlew.bat clean
}
Set-Location ..

# Start Metro bundler in background
Write-Host "`nStarting Metro bundler..." -ForegroundColor Yellow
$metro = Start-Process npx -ArgumentList "react-native","start","--reset-cache" -PassThru -WindowStyle Hidden

# Wait a moment for Metro to start
Start-Sleep -Seconds 5

# Build and run Android app
Write-Host "`nBuilding and running Android app..." -ForegroundColor Yellow
Write-Host "Make sure you have an Android emulator running or device connected!" -ForegroundColor Cyan

try {
    npx react-native run-android
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✓ Android app built and deployed successfully!" -ForegroundColor Green
        Write-Host "`nApp Controls:" -ForegroundColor Cyan
        Write-Host "  - Shake device or press Ctrl+M in emulator for dev menu"
        Write-Host "  - Press 'r' in Metro bundler to reload"
        Write-Host "  - Press 'a' to run on Android again"
        Write-Host "`nPress Ctrl+C to stop Metro bundler when done" -ForegroundColor Yellow
    } else {
        Write-Host "`n✗ Build failed. Check error messages above." -ForegroundColor Red
    }
} finally {
    # Keep Metro running
    if ($metro -and !$metro.HasExited) {
        Write-Host "`nMetro bundler is running. Press Ctrl+C to stop." -ForegroundColor Yellow
        $metro.WaitForExit()
    }
}