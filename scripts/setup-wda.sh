#!/bin/bash

# WebDriverAgent Setup Script
# Builds and installs WDA on connected iOS device

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Icons
CHECK="✓"
CROSS="✗"
ARROW="→"
PHONE="📱"
HAMMER="🔨"
PACKAGE="📦"
KEY="🔑"

echo ""
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${BLUE}║     ${CYAN}WebDriverAgent Setup Script${BLUE}        ║${NC}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Get Team ID from environment or .env file
TEAM_ID="${XCODE_ORG_ID:-}"

# Try to load from .env if not set
if [ -z "$TEAM_ID" ] && [ -f ".env" ]; then
    TEAM_ID=$(grep "^XCODE_ORG_ID=" .env | cut -d'=' -f2)
fi

if [ -z "$TEAM_ID" ]; then
    echo -e "${RED}${CROSS} ERROR: XCODE_ORG_ID not set${NC}"
    echo ""
    echo -e "  Set it in ${BOLD}.env${NC} file:"
    echo -e "    ${CYAN}XCODE_ORG_ID=YOUR_TEAM_ID${NC}"
    echo ""
    echo -e "  Or run with:"
    echo -e "    ${CYAN}XCODE_ORG_ID=YOUR_TEAM_ID ./scripts/setup-wda.sh${NC}"
    echo ""
    echo -e "  To find your Team ID, run:"
    echo -e "    ${CYAN}security find-certificate -a -c \"Apple Development\" ~/Library/Keychains/login.keychain-db 2>/dev/null | grep \"alis\"${NC}"
    echo ""
    exit 1
fi

echo -e "${KEY} Team ID: ${BOLD}$TEAM_ID${NC}"

# Get connected device
DEVICE_UDID=$(xcrun xctrace list devices 2>&1 | grep -v Simulator | grep -E "^\w.*\([0-9]+\.[0-9]+.*\) \([A-F0-9-]+\)$" | head -1 | sed 's/.*(\([A-F0-9-]*\))$/\1/')

if [ -z "$DEVICE_UDID" ]; then
    echo -e "${RED}${CROSS} ERROR: No iOS device connected${NC}"
    echo -e "  Connect your iPhone via USB and try again."
    exit 1
fi

DEVICE_NAME=$(xcrun xctrace list devices 2>&1 | grep "$DEVICE_UDID" | sed 's/ (.*//')
echo -e "${PHONE} Device: ${BOLD}$DEVICE_NAME${NC} (${DEVICE_UDID})"
echo ""

# WDA project path
WDA_PROJECT="$HOME/.appium/node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent/WebDriverAgent.xcodeproj"

if [ ! -d "$WDA_PROJECT" ]; then
    echo -e "${RED}${CROSS} ERROR: WebDriverAgent project not found${NC}"
    echo -e "  Run ${CYAN}appium driver install xcuitest${NC} first."
    exit 1
fi

# Get custom bundle ID from .env or use default based on team ID
WDA_BUNDLE_ID="${WDA_BUNDLE_ID:-}"
if [ -z "$WDA_BUNDLE_ID" ] && [ -f ".env" ]; then
    WDA_BUNDLE_ID=$(grep "^WDA_BUNDLE_ID=" .env | cut -d'=' -f2)
fi
# Default to a unique bundle ID based on your team if not set
if [ -z "$WDA_BUNDLE_ID" ]; then
    WDA_BUNDLE_ID="com.domasvz.WebDriverAgentRunner"
fi

echo -e "${PACKAGE} Bundle ID: ${BOLD}$WDA_BUNDLE_ID${NC}"

# Build and install WDA on device
echo -e "${HAMMER} ${BOLD}Building & Installing WebDriverAgent...${NC}"
echo ""

# Step 1: Build WDA (takes 20-60 seconds)
echo -e "  ${ARROW} Building... ${YELLOW}(this may take up to a minute)${NC}"
xcodebuild build-for-testing \
    -project "$WDA_PROJECT" \
    -scheme WebDriverAgentRunner \
    -destination "id=$DEVICE_UDID" \
    DEVELOPMENT_TEAM="$TEAM_ID" \
    PRODUCT_BUNDLE_IDENTIFIER="$WDA_BUNDLE_ID" \
    CODE_SIGN_IDENTITY="Apple Development" \
    GCC_TREAT_WARNINGS_AS_ERRORS=NO \
    -allowProvisioningUpdates \
    2>&1 | grep -E "(BUILD SUCCEEDED|BUILD FAILED|error:)" | head -5

if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo -e "${RED}${CROSS} Build failed${NC}"
    exit 1
fi
echo -e "  ${GREEN}${CHECK} Build succeeded${NC}"

# Step 2: Install WDA
echo -e "  ${ARROW} Installing..."
WDA_APP=$(ls -d ~/Library/Developer/Xcode/DerivedData/WebDriverAgent-*/Build/Products/Debug-iphoneos/WebDriverAgentRunner-Runner.app 2>/dev/null | head -1)

if [ -z "$WDA_APP" ]; then
    echo -e "${RED}${CROSS} WDA app not found in DerivedData${NC}"
    exit 1
fi

ideviceinstaller -u "$DEVICE_UDID" install "$WDA_APP" 2>&1 | grep -E "(Complete|error:|Error)"

# Check if WDA is installed
WDA_INSTALLED=$(ideviceinstaller -u "$DEVICE_UDID" list 2>/dev/null | grep -i "WebDriverAgentRunner")

if [ -z "$WDA_INSTALLED" ]; then
    echo ""
    echo -e "${RED}${CROSS} WDA installation failed${NC}"
    echo ""
    echo -e "  ${BOLD}Common fixes:${NC}"
    echo -e "    1. Open Xcode ${ARROW} Settings ${ARROW} Accounts ${ARROW} Add your Apple ID"
    echo -e "    2. Select account ${ARROW} Manage Certificates ${ARROW} Add 'Apple Development'"
    echo -e "    3. When prompted for keychain password, click 'Always Allow'"
    exit 1
fi

echo -e "      ${GREEN}${CHECK} WebDriverAgent installed on device${NC}"
echo ""

# Find the DerivedData path
DERIVED_DATA=$(ls -d ~/Library/Developer/Xcode/DerivedData/WebDriverAgent-* 2>/dev/null | head -1)

# Done!
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║  ${CHECK} WebDriverAgent Installed!                       ║${NC}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}${YELLOW}⚠️  NEXT STEP: Trust the Developer Certificate${NC}"
echo ""
echo -e "  On your iPhone:"
echo -e "    ${ARROW} Settings ${ARROW} General ${ARROW} VPN & Device Management"
echo -e "    ${ARROW} Tap your developer certificate ${ARROW} Trust"
echo ""
echo -e "  ${CYAN}After trusting, you can run tests.${NC}"
echo ""
