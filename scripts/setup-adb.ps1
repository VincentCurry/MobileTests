$androidSdk = "$env:LOCALAPPDATA\Android\Sdk"
$platformToolsUrl = "https://dl.google.com/android/repository/platform-tools-latest-windows.zip"
$zipPath = "$env:TEMP\platform-tools.zip"

Write-Host "=== Mobile Testing Framework Setup (Windows) ===" -ForegroundColor Cyan
Write-Host ""

# ============================================
# Step 1: Check Node.js
# ============================================
Write-Host "Step 1: Checking Node.js..." -ForegroundColor White
try {
    $nodeVersion = & node -v 2>$null
    Write-Host "  [OK] Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Node.js not found! Install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# ============================================
# Step 2: Check/Install Java
# ============================================
Write-Host "Step 2: Checking Java..." -ForegroundColor White
$javaFound = $false
try {
    $javaVersion = & java -version 2>&1 | Select-String -Pattern 'version "(\d+)'
    if ($javaVersion -match 'version "(\d+)') {
        $majorVersion = [int]$Matches[1]
        $javaFound = $true
        if ($majorVersion -ge 11) {
            Write-Host "  [OK] Java $majorVersion found" -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Java $majorVersion found, but Java 11+ required for Appium" -ForegroundColor Yellow
            Write-Host "  To upgrade, run:" -ForegroundColor Yellow
            Write-Host "    winget install --id EclipseAdoptium.Temurin.17.JDK" -ForegroundColor Cyan
            Write-Host "  After install, close and reopen your terminal/IDE!" -ForegroundColor Yellow
        }
    }
} catch {}

if (-not $javaFound) {
    Write-Host "  Java not found. Attempting to install via winget..." -ForegroundColor Yellow
    try {
        winget install --id EclipseAdoptium.Temurin.17.JDK --silent --accept-package-agreements --accept-source-agreements
        Write-Host "  [OK] Java 17 installed. Restart terminal to use." -ForegroundColor Green
    } catch {
        Write-Host "  [ERROR] Could not install Java automatically." -ForegroundColor Red
        Write-Host "  To install manually, run:" -ForegroundColor Yellow
        Write-Host "    winget install --id EclipseAdoptium.Temurin.17.JDK" -ForegroundColor Cyan
        Write-Host "  Or download from: https://adoptium.net/" -ForegroundColor Yellow
    }
}

# ============================================
# Step 3: Install Android Platform Tools
# ============================================
Write-Host "Step 3: Checking Android SDK..." -ForegroundColor White
if (Test-Path "$androidSdk\platform-tools\adb.exe") {
    Write-Host "  [OK] Android SDK found at $androidSdk" -ForegroundColor Green
} else {
    Write-Host "  Installing Android Platform Tools..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $androidSdk | Out-Null
    
    Write-Host "  Downloading (~15MB)..."
    curl.exe -L -o $zipPath $platformToolsUrl --progress-bar
    
    Write-Host "  Extracting..."
    Expand-Archive -Path $zipPath -DestinationPath $androidSdk -Force
    Remove-Item $zipPath -Force
    
    Write-Host "  [OK] Platform-tools installed" -ForegroundColor Green
}

# Set ANDROID_HOME
$currentAndroidHome = [Environment]::GetEnvironmentVariable("ANDROID_HOME", "User")
if ($currentAndroidHome -ne $androidSdk) {
    Write-Host "  Setting ANDROID_HOME..."
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdk, "User")
    $env:ANDROID_HOME = $androidSdk
}

# Add platform-tools to PATH
$platformTools = "$androidSdk\platform-tools"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$platformTools*") {
    Write-Host "  Adding to PATH..."
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$platformTools", "User")
    $env:Path = "$env:Path;$platformTools"
}

# ============================================
# Step 4: Install Appium + Drivers
# ============================================
Write-Host "Step 4: Checking Appium..." -ForegroundColor White
$appiumInstalled = $false
try {
    $appiumVersion = & appium -v 2>$null
    if ($appiumVersion) {
        Write-Host "  [OK] Appium $appiumVersion found" -ForegroundColor Green
        $appiumInstalled = $true
    }
} catch {}

if (-not $appiumInstalled) {
    Write-Host "  Installing Appium..." -ForegroundColor Yellow
    npm install -g appium
    Write-Host "  [OK] Appium installed" -ForegroundColor Green
}

Write-Host "  Installing UiAutomator2 driver..."
appium driver install uiautomator2 2>$null
Write-Host "  [OK] UiAutomator2 ready" -ForegroundColor Green

# ============================================
# Step 5: Verification
# ============================================
Write-Host ""
Write-Host "=== Verification ===" -ForegroundColor Cyan
Write-Host "ADB:" -ForegroundColor White
& "$platformTools\adb.exe" version

Write-Host ""
Write-Host "Java:" -ForegroundColor White
$javaVer = & java -version 2>&1 | Select-Object -First 1
Write-Host "  $javaVer"

Write-Host ""
Write-Host "Appium:" -ForegroundColor White
appium -v

# ============================================
# Summary
# ============================================
Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "ANDROID_HOME = $androidSdk"
Write-Host ""
Write-Host "IMPORTANT: Restart your terminal/IDE, then run: npm run appium" -ForegroundColor Yellow
