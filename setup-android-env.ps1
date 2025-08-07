# Android Development Environment Setup Script
# Run this script in PowerShell as Administrator

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Android Development Environment Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Function to check if a command exists
function Test-Command($command) {
    try {
        Get-Command $command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to download and install a program
function Install-Program($name, $url, $installer) {
    Write-Host "Installing $name..." -ForegroundColor Yellow
    $tempPath = "$env:TEMP\$installer"
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $tempPath
        Start-Process -FilePath $tempPath -Wait
        Remove-Item $tempPath -Force
        Write-Host "✓ $name installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to install $name. Please install manually from: $url" -ForegroundColor Red
        return $false
    }
    return $true
}

# 1. Check Node.js
Write-Host "[1/7] Checking Node.js..." -ForegroundColor Yellow
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found" -ForegroundColor Red
    $install = Read-Host "Would you like to install Node.js? (Y/N)"
    if ($install -eq 'Y') {
        Install-Program "Node.js" "https://nodejs.org/dist/v18.17.0/node-v18.17.0-x64.msi" "node-installer.msi"
    } else {
        Write-Host "Please install Node.js manually from: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
}

# 2. Check Java
Write-Host ""
Write-Host "[2/7] Checking Java JDK 11..." -ForegroundColor Yellow
if (Test-Command "java") {
    $javaVersion = java -version 2>&1 | Select-String "version"
    Write-Host "✓ Java is installed: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Java JDK 11 not found" -ForegroundColor Red
    Write-Host "Please install JDK 11 from: https://adoptium.net/temurin/releases/?version=11" -ForegroundColor Yellow
    Write-Host "After installation, restart this script" -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
}

# 3. Check Android SDK
Write-Host ""
Write-Host "[3/7] Checking Android SDK..." -ForegroundColor Yellow
$androidSdkPath = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $androidSdkPath) {
    Write-Host "✓ Android SDK found at: $androidSdkPath" -ForegroundColor Green
} else {
    Write-Host "✗ Android SDK not found" -ForegroundColor Red
    Write-Host "Please install Android Studio from: https://developer.android.com/studio" -ForegroundColor Yellow
    Write-Host "After installation:" -ForegroundColor Yellow
    Write-Host "  1. Open Android Studio" -ForegroundColor Cyan
    Write-Host "  2. Go to SDK Manager" -ForegroundColor Cyan
    Write-Host "  3. Install Android SDK Platform 31-33" -ForegroundColor Cyan
    Write-Host "  4. Install Android SDK Build-Tools" -ForegroundColor Cyan
    Read-Host "Press Enter to continue"
}

# 4. Set Environment Variables
Write-Host ""
Write-Host "[4/7] Setting environment variables..." -ForegroundColor Yellow

# Set ANDROID_HOME
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, "User")
Write-Host "✓ ANDROID_HOME set to: $androidSdkPath" -ForegroundColor Green

# Find and set JAVA_HOME
$javaPath = Get-ChildItem "C:\Program Files\Eclipse Adoptium\jdk-11*" -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $javaPath) {
    $javaPath = Get-ChildItem "C:\Program Files\Java\jdk-11*" -ErrorAction SilentlyContinue | Select-Object -First 1
}
if ($javaPath) {
    [System.Environment]::SetEnvironmentVariable("JAVA_HOME", $javaPath.FullName, "User")
    Write-Host "✓ JAVA_HOME set to: $($javaPath.FullName)" -ForegroundColor Green
} else {
    Write-Host "! JAVA_HOME needs manual configuration" -ForegroundColor Yellow
}

# Update PATH
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$androidPaths = @(
    "$androidSdkPath\platform-tools",
    "$androidSdkPath\emulator",
    "$androidSdkPath\tools",
    "$androidSdkPath\tools\bin"
)

foreach ($path in $androidPaths) {
    if ($currentPath -notlike "*$path*") {
        $currentPath += ";$path"
    }
}

[System.Environment]::SetEnvironmentVariable("Path", $currentPath, "User")
Write-Host "✓ Android tools added to PATH" -ForegroundColor Green

# 5. Install React Native CLI
Write-Host ""
Write-Host "[5/7] Installing React Native CLI..." -ForegroundColor Yellow
npm install -g react-native-cli 2>$null
Write-Host "✓ React Native CLI installed" -ForegroundColor Green

# 6. Check ADB
Write-Host ""
Write-Host "[6/7] Checking ADB..." -ForegroundColor Yellow
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
if (Test-Command "adb") {
    Write-Host "✓ ADB is accessible" -ForegroundColor Green
} else {
    Write-Host "! ADB not found in PATH. You may need to restart your terminal" -ForegroundColor Yellow
}

# 7. Project Setup
Write-Host ""
Write-Host "[7/7] Project configuration..." -ForegroundColor Yellow

# Create local.properties if it doesn't exist
$localPropertiesPath = ".\android\local.properties"
if (-not (Test-Path $localPropertiesPath)) {
    $content = "sdk.dir=$($androidSdkPath -replace '\\', '\\')"
    New-Item -Path $localPropertiesPath -ItemType File -Force | Out-Null
    Set-Content -Path $localPropertiesPath -Value $content
    Write-Host "✓ Created android/local.properties" -ForegroundColor Green
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Close and reopen your terminal/PowerShell" -ForegroundColor Cyan
Write-Host "2. Navigate to project directory: cd $PWD" -ForegroundColor Cyan
Write-Host "3. Install dependencies: npm install" -ForegroundColor Cyan
Write-Host "4. Run Android app: npx react-native run-android" -ForegroundColor Cyan
Write-Host ""
Write-Host "For USB debugging:" -ForegroundColor Yellow
Write-Host "- Enable Developer Options on your Android device" -ForegroundColor Cyan
Write-Host "- Enable USB Debugging" -ForegroundColor Cyan
Write-Host "- Connect device and run: adb devices" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"