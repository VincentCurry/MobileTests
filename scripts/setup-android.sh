#!/bin/bash

# Android Testing Framework Setup for macOS
# Uses direct downloads for fast installation (no Homebrew compilation)

LOGFILE="setup_android_log.txt"
ANDROID_SDK="$HOME/Library/Android/sdk"
PROFILE_FILE=~/.zshrc

echo "=== Android Testing Framework Setup (macOS) ===" | tee $LOGFILE
echo "" | tee -a $LOGFILE

# Ensure profile file exists
touch $PROFILE_FILE

# Function to add export to profile if it doesn't exist
add_to_profile() {
    if grep -qxF "$1" $PROFILE_FILE; then
        echo "  Already in profile: $1" | tee -a $LOGFILE
    else
        echo "$1" >> $PROFILE_FILE
        echo "  Added to profile: $1" | tee -a $LOGFILE
    fi
}

# ============================================
# Step 1: Check/Install Node.js (direct download)
# ============================================
echo "Step 1: Checking Node.js..." | tee -a $LOGFILE
if command -v node > /dev/null 2>&1; then
    NODE_VER=$(node -v)
    echo "  [OK] Node.js $NODE_VER found" | tee -a $LOGFILE
else
    echo "  Installing Node.js (direct download)..." | tee -a $LOGFILE
    curl -sL -o /tmp/node.pkg "https://nodejs.org/dist/v20.18.0/node-v20.18.0.pkg"
    sudo installer -pkg /tmp/node.pkg -target /
    rm -f /tmp/node.pkg
    echo "  [OK] Node.js installed" | tee -a $LOGFILE
fi

# ============================================
# Step 2: Check/Install Java (direct download)
# ============================================
echo "Step 2: Checking Java..." | tee -a $LOGFILE

JAVA_CHECK=$(java -version 2>&1)
if echo "$JAVA_CHECK" | grep -q "version"; then
    JAVA_VER=$(echo "$JAVA_CHECK" | head -1 | cut -d'"' -f2 2>/dev/null || echo "unknown")
    echo "  [OK] Java $JAVA_VER found" | tee -a $LOGFILE
else
    echo "  Installing OpenJDK 17 (direct download)..." | tee -a $LOGFILE
    
    # Detect architecture
    if [[ $(uname -m) == "arm64" ]]; then
        JAVA_URL="https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%2B9/OpenJDK17U-jdk_aarch64_mac_hotspot_17.0.9_9.pkg"
    else
        JAVA_URL="https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%2B9/OpenJDK17U-jdk_x64_mac_hotspot_17.0.9_9.pkg"
    fi
    
    curl -sL -o /tmp/java.pkg "$JAVA_URL"
    sudo installer -pkg /tmp/java.pkg -target /
    rm -f /tmp/java.pkg
    
    # Set JAVA_HOME
    add_to_profile 'export JAVA_HOME=$(/usr/libexec/java_home)'
    export JAVA_HOME=$(/usr/libexec/java_home)
    
    echo "  [OK] OpenJDK 17 installed" | tee -a $LOGFILE
fi

# ============================================
# Step 3: Install Android Platform Tools
# ============================================
echo "Step 3: Checking Android SDK..." | tee -a $LOGFILE
if [ -f "$ANDROID_SDK/platform-tools/adb" ]; then
    echo "  [OK] Android SDK found at $ANDROID_SDK" | tee -a $LOGFILE
else
    echo "  Installing Android Platform Tools (direct download)..." | tee -a $LOGFILE
    mkdir -p "$ANDROID_SDK"
    
    curl -sL -o /tmp/platform-tools.zip "https://dl.google.com/android/repository/platform-tools-latest-darwin.zip"
    unzip -q /tmp/platform-tools.zip -d "$ANDROID_SDK"
    rm -f /tmp/platform-tools.zip
    
    echo "  [OK] Platform-tools installed" | tee -a $LOGFILE
fi

# Set ANDROID_HOME
add_to_profile "export ANDROID_HOME=$ANDROID_SDK"
add_to_profile 'export PATH=$ANDROID_HOME/platform-tools:$PATH'

# ============================================
# Step 4: Install Appium + Drivers
# ============================================
echo "Step 4: Checking Appium..." | tee -a $LOGFILE
if command -v appium > /dev/null 2>&1; then
    APPIUM_VER=$(appium -v)
    echo "  [OK] Appium $APPIUM_VER found" | tee -a $LOGFILE
else
    echo "  Installing Appium 2.11.3..." | tee -a $LOGFILE
    sudo npm install -g appium@2.11.3 || { echo "  Failed to install Appium." | tee -a $LOGFILE; exit 1; }
    echo "  [OK] Appium installed" | tee -a $LOGFILE
fi

# Fix npm cache permissions once
sudo chown -R $(whoami) ~/.npm 2>/dev/null || true

# Install UiAutomator2 driver if not installed
if appium driver list --installed 2>/dev/null | grep -q uiautomator2; then
    echo "  [OK] UiAutomator2 driver already installed" | tee -a $LOGFILE
else
    echo "  Installing UiAutomator2 driver..." | tee -a $LOGFILE
    appium driver install uiautomator2@3.7.7 || echo "  [WARN] UiAutomator2 install failed" | tee -a $LOGFILE
fi

# ============================================
# Step 5: Update Environment Variables
# ============================================
echo "Step 5: Updating environment variables..." | tee -a $LOGFILE
add_to_profile 'export ANDROID_HOME=~/Library/Android/sdk'
add_to_profile 'export JAVA_HOME=$(/usr/libexec/java_home)'
add_to_profile 'export PATH=$ANDROID_HOME/platform-tools:$PATH'
add_to_profile 'export PATH=$ANDROID_HOME/tools:$PATH'
add_to_profile 'export PATH=$JAVA_HOME/bin:$PATH'

# Source the profile to apply changes
echo "  Sourcing profile..." | tee -a $LOGFILE
source $PROFILE_FILE 2>/dev/null || true

# ============================================
# Step 6: Verification
# ============================================
echo "" | tee -a $LOGFILE
echo "=== Verification ===" | tee -a $LOGFILE

echo "Node.js:" | tee -a $LOGFILE
node -v 2>/dev/null || echo "  [WARN] Node.js not found - restart terminal" | tee -a $LOGFILE

echo "" | tee -a $LOGFILE
echo "Java:" | tee -a $LOGFILE
java -version 2>&1 | head -1 | tee -a $LOGFILE

echo "" | tee -a $LOGFILE
echo "ADB:" | tee -a $LOGFILE
"$ANDROID_SDK/platform-tools/adb" version 2>/dev/null || echo "  [WARN] ADB not found - restart terminal" | tee -a $LOGFILE

echo "" | tee -a $LOGFILE
echo "Appium:" | tee -a $LOGFILE
appium -v 2>/dev/null || echo "  [WARN] Appium not found - restart terminal" | tee -a $LOGFILE

echo "" | tee -a $LOGFILE
echo "Appium Drivers:" | tee -a $LOGFILE
appium driver list --installed 2>/dev/null || echo "  [WARN] Could not list Appium drivers" | tee -a $LOGFILE


# ============================================
# Summary
# ============================================
echo "" | tee -a $LOGFILE
echo "=== Android Setup Complete ===" | tee -a $LOGFILE
echo "ANDROID_HOME = $ANDROID_SDK" | tee -a $LOGFILE
echo "JAVA_HOME = \$(/usr/libexec/java_home)" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "IMPORTANT: Run 'source ~/.zshrc' or restart terminal!" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "For iOS testing, run: ./scripts/setup-ios.sh" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "Then run: npm install && npm run appium" | tee -a $LOGFILE
