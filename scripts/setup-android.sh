#!/bin/bash

# Mobile Testing Framework Setup for macOS
# Based on native-mobile-e2e framework setup

LOGFILE="setup_log.txt"
ANDROID_SDK="$HOME/Library/Android/sdk"
PLATFORM_TOOLS_URL="https://dl.google.com/android/repository/platform-tools-latest-darwin.zip"
PROFILE_FILE=~/.zshrc

echo "=== Mobile Testing Framework Setup (macOS) ===" | tee $LOGFILE
echo ""

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
# Step 1: Check/Install Homebrew
# ============================================
echo "Step 1: Checking Homebrew..." | tee -a $LOGFILE
if ! command -v brew > /dev/null; then
    echo "  Installing Homebrew..." | tee -a $LOGFILE
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "  [OK] Homebrew found" | tee -a $LOGFILE
fi

# ============================================
# Step 2: Check/Install Node.js
# ============================================
echo "Step 2: Checking Node.js..." | tee -a $LOGFILE
if ! command -v node > /dev/null; then
    echo "  Installing Node.js..." | tee -a $LOGFILE
    brew install node
else
    NODE_VER=$(node -v)
    echo "  [OK] Node.js $NODE_VER found" | tee -a $LOGFILE
fi

# ============================================
# Step 3: Check/Install Java
# ============================================
echo "Step 3: Checking Java..." | tee -a $LOGFILE
if ! command -v java &> /dev/null; then
    echo "  Java not found. Installing OpenJDK 17..." | tee -a $LOGFILE
    brew install openjdk@17
    
    # Detect architecture and set correct path
    if [[ $(uname -m) == "arm64" ]]; then
        # Apple Silicon (M1/M2/M3)
        JAVA_PATH="/opt/homebrew/opt/openjdk@17/bin"
    else
        # Intel Mac
        JAVA_PATH="/usr/local/opt/openjdk@17/bin"
    fi
    
    add_to_profile "export PATH=\"$JAVA_PATH:\$PATH\""
    export PATH="$JAVA_PATH:$PATH"
    echo "  [OK] OpenJDK 17 installed" | tee -a $LOGFILE
else
    JAVA_VER=$(java -version 2>&1 | head -1 | cut -d'"' -f2)
    JAVA_MAJOR=$(echo "$JAVA_VER" | cut -d'.' -f1)
    
    # Handle old version format (1.8.x)
    if [[ "$JAVA_MAJOR" == "1" ]]; then
        JAVA_MAJOR=$(echo "$JAVA_VER" | cut -d'.' -f2)
    fi
    
    if [[ "$JAVA_MAJOR" -ge 11 ]]; then
        echo "  [OK] Java $JAVA_VER found" | tee -a $LOGFILE
    else
        echo "  [WARN] Java $JAVA_VER found, but Java 11+ required for Appium" | tee -a $LOGFILE
        echo "  To upgrade, run:" | tee -a $LOGFILE
        echo "    brew install openjdk@17" | tee -a $LOGFILE
        echo "  After install, close and reopen your terminal/IDE!" | tee -a $LOGFILE
    fi
fi

# Set JAVA_HOME
add_to_profile 'export JAVA_HOME=$(/usr/libexec/java_home)'

# ============================================
# Step 4: Install Android Platform Tools
# ============================================
echo "Step 4: Checking Android SDK..." | tee -a $LOGFILE
if [ -f "$ANDROID_SDK/platform-tools/adb" ]; then
    echo "  [OK] Android SDK found at $ANDROID_SDK" | tee -a $LOGFILE
else
    echo "  Installing Android Platform Tools..." | tee -a $LOGFILE
    mkdir -p "$ANDROID_SDK"
    
    echo "  Downloading (~15MB)..." | tee -a $LOGFILE
    curl -L "$PLATFORM_TOOLS_URL" -o /tmp/platform-tools.zip --progress-bar
    
    echo "  Extracting..." | tee -a $LOGFILE
    unzip -q /tmp/platform-tools.zip -d "$ANDROID_SDK"
    rm -f /tmp/platform-tools.zip
    
    echo "  [OK] Platform-tools installed" | tee -a $LOGFILE
fi

# Set ANDROID_HOME
add_to_profile "export ANDROID_HOME=$ANDROID_SDK"
add_to_profile 'export PATH=$ANDROID_HOME/platform-tools:$PATH'

# ============================================
# Step 5: Install Appium + Drivers
# ============================================
echo "Step 5: Checking Appium..." | tee -a $LOGFILE
if ! command -v appium > /dev/null; then
    echo "  Installing Appium..." | tee -a $LOGFILE
    npm install -g appium
else
    APPIUM_VER=$(appium -v)
    echo "  [OK] Appium $APPIUM_VER found" | tee -a $LOGFILE
fi

echo "  Installing UiAutomator2 driver..." | tee -a $LOGFILE
appium driver install uiautomator2 2>/dev/null || echo "  UiAutomator2 already installed" | tee -a $LOGFILE

# ============================================
# Step 6: Install Xcode Command Line Tools (for iOS)
# ============================================
echo "Step 6: Checking Xcode CLI tools..." | tee -a $LOGFILE
if ! xcode-select -p > /dev/null 2>&1; then
    echo "  Installing Xcode command line tools..." | tee -a $LOGFILE
    xcode-select --install
else
    echo "  [OK] Xcode CLI tools found" | tee -a $LOGFILE
fi

# ============================================
# Step 7: Verification
# ============================================
echo "" | tee -a $LOGFILE
echo "=== Verification ===" | tee -a $LOGFILE
echo "ADB:" | tee -a $LOGFILE
"$ANDROID_SDK/platform-tools/adb" version 2>/dev/null || echo "  [WARN] ADB not found - restart terminal" | tee -a $LOGFILE

echo "" | tee -a $LOGFILE
echo "Java:" | tee -a $LOGFILE
java -version 2>&1 | head -1 | tee -a $LOGFILE

echo "" | tee -a $LOGFILE
echo "Appium:" | tee -a $LOGFILE
appium -v 2>/dev/null || echo "  [WARN] Appium not found - restart terminal" | tee -a $LOGFILE

# ============================================
# Summary
# ============================================
echo "" | tee -a $LOGFILE
echo "=== Setup Complete ===" | tee -a $LOGFILE
echo "ANDROID_HOME = $ANDROID_SDK" | tee -a $LOGFILE
echo "JAVA_HOME = \$(/usr/libexec/java_home)" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "IMPORTANT: Run 'source ~/.zshrc' or restart terminal!" | tee -a $LOGFILE
echo "Then run: npm run appium" | tee -a $LOGFILE
