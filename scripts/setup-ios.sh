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

# Fix npm cache permissions once
sudo chown -R $(whoami) ~/.npm 2>/dev/null || true

# Install XCUITest driver if not installed
if appium driver list --installed 2>/dev/null | grep -q xcuitest; then
    echo "  [OK] XCUITest driver already installed" | tee -a $LOGFILE
else
    echo "  Installing XCUITest driver..." | tee -a $LOGFILE
    appium driver install xcuitest@5.12.2 || echo "  [WARN] XCUITest install failed" | tee -a $LOGFILE
fi

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


# ============================================
# Summary
# ============================================
echo "" | tee -a $LOGFILE
echo "=== iOS Setup Complete ===" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "IMPORTANT: Run 'source ~/.zshrc' or restart terminal!" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "========================================================" | tee -a $LOGFILE
echo "=== MANUAL STEPS REQUIRED FOR iOS DEVICE TESTING ===" | tee -a $LOGFILE
echo "========================================================" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "--- STEP A: Install iOS Platform in Xcode ---" | tee -a $LOGFILE
echo "1. Open Xcode" | tee -a $LOGFILE
echo "2. Go to: Xcode → Settings → Components (or Platforms)" | tee -a $LOGFILE
echo "3. Download and install 'iOS' platform" | tee -a $LOGFILE
echo "   (This matches your connected iPhone's iOS version)" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "--- STEP A2: Enable Developer Mode on iPhone ---" | tee -a $LOGFILE
echo "NOTE: Developer Mode option only appears AFTER connecting iPhone to Xcode!" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "1. Connect iPhone via USB" | tee -a $LOGFILE
echo "2. Open Xcode → Window → Devices and Simulators (Cmd+Shift+2)" | tee -a $LOGFILE
echo "3. Click your iPhone in the left sidebar" | tee -a $LOGFILE
echo "4. You'll see 'Developer Mode disabled' error - this is expected" | tee -a $LOGFILE
echo "5. On iPhone: Settings → Privacy & Security → Developer Mode" | tee -a $LOGFILE
echo "   (This option only appears after step 2-4!)" | tee -a $LOGFILE
echo "6. Enable Developer Mode → iPhone will restart" | tee -a $LOGFILE
echo "7. After restart, swipe up and confirm to enable Developer Mode" | tee -a $LOGFILE
echo "8. Go back to Settings → Developer → Enable 'UI Automation'" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "--- STEP B: Create Apple Development Certificate ---" | tee -a $LOGFILE
echo "This is needed to sign WebDriverAgent (not your app)." | tee -a $LOGFILE
echo "Any Apple ID works - you don't need the client's Team ID." | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "1. Open Xcode → Settings → Apple Accounts" | tee -a $LOGFILE
echo "2. Click '+' to add your Apple ID (if not added)" | tee -a $LOGFILE
echo "3. Select your account → Click 'Manage Certificates...'" | tee -a $LOGFILE
echo "4. Click '+' button (bottom left) → Select 'Apple Development'" | tee -a $LOGFILE
echo "5. Click 'Done'" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "--- STEP C: Get Your Team ID ---" | tee -a $LOGFILE
echo "Run this command to find your Team ID:" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "  security find-certificate -a -c \"Apple Development\" ~/Library/Keychains/login.keychain-db 2>/dev/null | grep \"alis\"" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "Look for the ID in parentheses, e.g.: (XXXXXXXXXX)" | tee -a $LOGFILE
echo "That 10-character code is your Team ID." | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "--- STEP D: Build & Install WebDriverAgent ---" | tee -a $LOGFILE

# Get Team ID from environment or prompt
TEAM_ID="${XCODE_ORG_ID:-}"
if [ -z "$TEAM_ID" ]; then
    TEAM_ID=$(security find-certificate -a -c "Apple Development" ~/Library/Keychains/login.keychain-db 2>/dev/null | grep "alis" | head -1 | sed 's/.*(\([A-Z0-9]*\)).*/\1/')
fi

if [ -z "$TEAM_ID" ]; then
    echo "  [ERROR] No Team ID found. Complete Step B first." | tee -a $LOGFILE
else
    echo "  Using Team ID: $TEAM_ID" | tee -a $LOGFILE
    
    # Get first connected iOS device
    DEVICE_UDID=$(xcrun xctrace list devices 2>&1 | grep -v Simulator | grep -E "^\w.*\([0-9]+\.[0-9]+.*\) \([A-F0-9-]+\)$" | head -1 | sed 's/.*(\([A-F0-9-]*\))$/\1/')
    
    if [ -z "$DEVICE_UDID" ]; then
        echo "  [ERROR] No iOS device connected. Connect your iPhone via USB." | tee -a $LOGFILE
    else
        echo "  Found device: $DEVICE_UDID" | tee -a $LOGFILE
        echo "  Building and installing WebDriverAgent..." | tee -a $LOGFILE
        
        xcodebuild -project ~/.appium/node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent/WebDriverAgent.xcodeproj \
            -scheme WebDriverAgentRunner \
            -destination "id=$DEVICE_UDID" \
            DEVELOPMENT_TEAM="$TEAM_ID" \
            CODE_SIGN_IDENTITY="Apple Development" \
            -allowProvisioningUpdates \
            build-for-testing 2>&1 | tail -5
        
        if [ $? -eq 0 ]; then
            echo "  [OK] WebDriverAgent installed on device" | tee -a $LOGFILE
        else
            echo "  [WARN] WebDriverAgent build may have issues - check output above" | tee -a $LOGFILE
        fi
    fi
fi
echo "" | tee -a $LOGFILE
echo "--- STEP E: For Running Client's IPA ---" | tee -a $LOGFILE
echo "The client must register your device in their Apple Developer account:" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "  Device UDID: (run 'system_profiler SPUSBDataType | grep -A5 iPhone | grep Serial')" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "Send the UDID to client. They need to:" | tee -a $LOGFILE
echo "  1. Add device at: https://developer.apple.com/account/resources/devices/list" | tee -a $LOGFILE
echo "  2. Regenerate provisioning profile with your device" | tee -a $LOGFILE
echo "  3. Rebuild and send you the new IPA" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "========================================================" | tee -a $LOGFILE
echo "=== Appium Capabilities for iOS ===" | tee -a $LOGFILE
echo "========================================================" | tee -a $LOGFILE
echo "Use these in your test configuration:" | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "  xcodeOrgId: 'YOUR_TEAM_ID'," | tee -a $LOGFILE
echo "  xcodeSigningId: 'Apple Development'," | tee -a $LOGFILE
echo "  usePrebuiltWDA: true," | tee -a $LOGFILE
echo "  useNewWDA: false," | tee -a $LOGFILE
echo "" | tee -a $LOGFILE
echo "Then run: npm install && npm run appium" | tee -a $LOGFILE
