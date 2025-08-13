@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

echo Cleaning Gradle cache...
rd /s /q "%USERPROFILE%\.gradle\caches\8.0.1" 2>nul

echo Cleaning project...
call gradlew.bat clean

echo Clean complete!