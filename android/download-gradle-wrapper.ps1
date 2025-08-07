# Download Gradle Wrapper JAR
$wrapperUrl = "https://github.com/gradle/gradle/raw/v8.0.1/gradle/wrapper/gradle-wrapper.jar"
$outputPath = "gradle\wrapper\gradle-wrapper.jar"

Write-Host "Downloading Gradle Wrapper..." -ForegroundColor Yellow

try {
    Invoke-WebRequest -Uri $wrapperUrl -OutFile $outputPath -UseBasicParsing
    Write-Host "✓ Gradle Wrapper downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to download Gradle Wrapper: $_" -ForegroundColor Red
    exit 1
}