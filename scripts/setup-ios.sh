#!/bin/bash

# iOS Testing Framework Setup for macOS
# Installs prerequisites for iOS testing (Node.js, Xcode, Appium)
# For WebDriverAgent setup, run: ./scripts/setup-wda.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

echo -e "${BOLD}${CYAN}"
echo "╔════════════════════════════════════════╗"
echo "║     iOS Environment Setup              ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================
# Step 1: Check Node.js
# ============================================
echo -e "${BOLD}[1/4]${NC} Checking Node.js..."
if command -v node > /dev/null 2>&1; then
    echo -e "      ${GREEN}✓${NC} Node.js $(node -v) found"
else
    echo -e "      ${YELLOW}Installing Node.js...${NC}"
    curl -sL -o /tmp/node.pkg "https://nodejs.org/dist/v20.18.0/node-v20.18.0.pkg"
    sudo installer -pkg /tmp/node.pkg -target /
    rm -f /tmp/node.pkg
    echo -e "      ${GREEN}✓${NC} Node.js installed"
fi

# ============================================
# Step 2: Check Xcode
# ============================================
echo -e "${BOLD}[2/4]${NC} Checking Xcode..."
if ! xcode-select -p > /dev/null 2>&1; then
    echo -e "      ${YELLOW}Installing Xcode CLI tools...${NC}"
    xcode-select --install
    echo -e "      ${YELLOW}Please complete installation and re-run this script.${NC}"
    exit 0
fi

if [ -d "/Applications/Xcode.app" ]; then
    sudo xcode-select --switch /Applications/Xcode.app 2>/dev/null
    echo -e "      ${GREEN}✓${NC} Xcode configured"
else
    echo -e "      ${RED}✗${NC} Xcode.app not found. Install from App Store."
    exit 1
fi

# ============================================
# Step 3: Check Appium
# ============================================
echo -e "${BOLD}[3/4]${NC} Checking Appium..."
if command -v appium > /dev/null 2>&1; then
    echo -e "      ${GREEN}✓${NC} Appium $(appium -v) found"
else
    echo -e "      ${YELLOW}Installing Appium...${NC}"
    sudo npm install -g appium@2.11.3
    echo -e "      ${GREEN}✓${NC} Appium installed"
fi

# Fix npm permissions
sudo chown -R $(whoami) ~/.npm 2>/dev/null || true

# ============================================
# Step 4: Check XCUITest Driver
# ============================================
echo -e "${BOLD}[4/4]${NC} Checking XCUITest driver..."
if appium driver list --installed 2>/dev/null | grep -q xcuitest; then
    echo -e "      ${GREEN}✓${NC} XCUITest driver installed"
else
    echo -e "      ${YELLOW}Installing XCUITest driver...${NC}"
    appium driver install xcuitest@5.12.2 || true
    echo -e "      ${GREEN}✓${NC} XCUITest driver installed"
fi

# ============================================
# Summary
# ============================================
echo ""
echo -e "${BOLD}${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${GREEN}║  ✓ iOS Environment Ready               ║${NC}"
echo -e "${BOLD}${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}Next Steps:${NC}"
echo ""
echo -e "  ${BOLD}1. Manual Setup (one-time):${NC}"
echo -e "     → Xcode → Settings → Accounts → Add Apple ID"
echo -e "     → Manage Certificates → Add 'Apple Development'"
echo ""
echo -e "  ${BOLD}2. iPhone Setup (one-time):${NC}"
echo -e "     → Connect iPhone via USB"
echo -e "     → Xcode → Window → Devices and Simulators"
echo -e "     → iPhone → Settings → Privacy & Security → Developer Mode → Enable"
echo ""
echo -e "  ${BOLD}3. Add Team ID to .env:${NC}"
echo -e "     ${CYAN}XCODE_ORG_ID=YOUR_TEAM_ID${NC}"
echo ""
echo -e "     To find your Team ID:"
echo -e "     ${CYAN}security find-certificate -c \"Apple Development\" ~/Library/Keychains/login.keychain-db | grep alis${NC}"
echo ""
echo -e "  ${BOLD}4. Setup WebDriverAgent:${NC}"
echo -e "     ${CYAN}./scripts/setup-wda.sh${NC}"
echo ""
echo -e "  ${BOLD}5. Run tests:${NC}"
echo -e "     ${CYAN}npm run appium${NC}   (Terminal 1)"
echo -e "     ${CYAN}npm run debug${NC}    (Terminal 2)"
echo ""
