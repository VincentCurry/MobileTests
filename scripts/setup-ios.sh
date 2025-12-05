#!/bin/bash

# iOS Testing Framework Setup for macOS
# Uses direct downloads for fast installation (no Homebrew compilation)

LOGFILE="setup_ios_log.txt"
PROFILE_FILE=~/.zshrc

echo "=== iOS Testing Framework Setup (macOS) ===" | tee $LOGFILE
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
# Step 2: Check/Install Xcode Command Line Tools
# ============================================
echo "Step 2: Checking Xcode CLI tools..." | tee -a $LOGFILE
if ! xcode-select -p > /dev/null 2>&1; then
    echo "  Installing Xcode command line tools..." | tee -a $LOGFILE
    xcode-select --install
    echo "  Please complete the Xcode CLI tools installation and re-run this script." | tee -a $LOGFILE
    exit 0
else
    echo "  [OK] Xcode CLI tools found" | tee -a $LOGFILE
fi

# ============================================
# Step 3: Configure Xcode
# ============================================
echo "Step 3: Configuring Xcode..." | tee -a $LOGFILE

if [ -d "/Applications/Xcode.app" ]; then
    echo "  Resetting xcode-select..." | tee -a $LOGFILE
    sudo xcode-select --reset
    echo "  Switching to Xcode.app..." | tee -a $LOGFILE
    sudo xcode-select --switch /Applications/Xcode.app
    echo "  [OK] Xcode configured" | tee -a $LOGFILE
else
    echo "  [ERROR] Xcode.app not found in /Applications" | tee -a $LOGFILE
    echo "  Please install Xcode from the App Store and re-run this script." | tee -a $LOGFILE
    exit 1
fi

# ============================================
# Step 4: Install Appium + XCUITest Driver
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

echo "  Installing Appium Doctor..." | tee -a $LOGFILE
sudo npm install -g appium-doctor || echo "  Failed to install Appium Doctor, continuing..." | tee -a $LOGFILE

echo "  Fixing npm cache permissions..." | tee -a $LOGFILE
sudo chown -R $(whoami) ~/.npm 2>/dev/null || true

echo "  Installing XCUITest driver..." | tee -a $LOGFILE
appium driver install xcuitest@5.12.2 || echo "  XCUITest already installed or failed" | tee -a $LOGFILE

# ============================================
# Step 5: Locate WebDriverAgent
# ============================================
echo "Step 5: Locating WebDriverAgent..." | tee -a $LOGFILE

WDA_PATHS=(
    "$HOME/.appium/node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent"
    "/usr/local/lib/node_modules/appium/node_modules/appium-webdriveragent"
    "/opt/homebrew/lib/node_modules/appium/node_modules/appium-webdriveragent"
)

WDA_FOUND=""
for path in "${WDA_PATHS[@]}"; do
    if [ -d "$path" ]; then
        WDA_FOUND="$path"
        echo "  [OK] WebDriverAgent found at: $path" | tee -a $LOGFILE
        break
    fi
done

if [ -z "$WDA_FOUND" ]; then
    echo "  [WARN] WebDriverAgent not found in common locations" | tee -a $LOGFILE
    echo "  Searching for WebDriverAgent..." | tee -a $LOGFILE
    WDA_SEARCH=$(find ~/.appium /usr/local/lib/node_modules /opt/homebrew/lib/node_modules -name "WebDriverAgent.xcodeproj" 2>/dev/null | head -1)
    if [ -n "$WDA_SEARCH" ]; then
        WDA_FOUND=$(dirname "$WDA_SEARCH")
        echo "  [OK] WebDriverAgent found at: $WDA_FOUND" | tee -a $LOGFILE
    else
        echo "  [WARN] WebDriverAgent not found - it will be installed when you first run Appium with XCUITest" | tee -a $LOGFILE
    fi
fi

# ============================================
# Step 6: Verification
# ============================================
echo "" | tee -a $LOGFILE
echo "=== Verification ===" | tee -a $LOGFILE

echo "Node.js:" | tee -a $LOGFILE
node -v 2>/dev/null || echo "  [WARN] Node.js not found - restart terminal" | tee -a $LOGFILE

echo "" | tee -a $LOGFILE
echo "Xcode:" | tee -a $LOGFILE
xcode-select -p 2>/dev/null || echo "  [WARN] Xcode not configured" | tee -a $LOGFILE

echo "" | tee -a $LOGFILE
echo "Appium:" | tee -a $LOGFILE
appium -v 2>/dev/null || echo "  [WARN] Appium not found - restart terminal" | tee -a $LOGFILE

echo "" | tee -a $LOGFILE
echo "Appium Drivers:" | tee -a $LOGFILE
appium driver list --installed 2>/dev/null || echo "  [WARN] Could not list Appium drivers" | tee -a $LOGFILE

echo "" | tee -a $LOGFILE
echo "Appium Doctor (iOS):" | tee -a $LOGFILE
if command -v appium-doctor > /dev/null 2>&1; then
    appium-doctor --ios || echo "  Appium Doctor reported issues, please check above." | tee -a $LOGFILE
else
    echo "  [WARN] Appium Doctor not found" | tee -a $LOGFILE
fi

# ============================================
# Summary
# ============================================
echo "" | tee -a $LOGFILE
echo "=== iOS Setup Complete ===" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "IMPORTANT: Run 'source ~/.zshrc' or restart terminal!" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "=== Manual Steps Required ===" | tee -a $LOGFILE
echo "To complete iOS setup, you need to configure WebDriverAgent in Xcode:" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "1. Connect your iOS device via USB" | tee -a $LOGFILE
echo "2. Open Xcode and sign in with your Apple Developer account" | tee -a $LOGFILE
if [ -n "$WDA_FOUND" ]; then
    echo "3. Open WebDriverAgent project:" | tee -a $LOGFILE
    echo "   open \"$WDA_FOUND/WebDriverAgent.xcodeproj\"" | tee -a $LOGFILE
else
    echo "3. Find and open WebDriverAgent.xcodeproj in Xcode" | tee -a $LOGFILE
fi
echo "4. In Targets sidebar, select 'WebDriverAgentLib'" | tee -a $LOGFILE
echo "   -> Signing & Capabilities -> Check 'Automatically manage signing'" | tee -a $LOGFILE
echo "   -> Select your Development Team" | tee -a $LOGFILE
echo "5. In Targets sidebar, select 'WebDriverAgentRunner'" | tee -a $LOGFILE
echo "   -> Signing & Capabilities -> Check 'Automatically manage signing'" | tee -a $LOGFILE
echo "   -> Select your Development Team" | tee -a $LOGFILE
echo "6. Click the Build button (play icon) to build and verify" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "Then run: npm install && npm run appium" | tee -a $LOGFILE
