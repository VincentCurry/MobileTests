# Mobile E2E Test Framework

Automated mobile testing framework for Receipts & Rewards apps using CodeceptJS, Appium, and BDD/Gherkin.

## Quick Start

### Prerequisites
- Node.js 18+
- Java 11+
- Android SDK (for Android testing)
- Xcode (for iOS testing, macOS only)
- Appium 2.x

### Setup

**1. Install dependencies:**
```bash
npm install
```

**2. Setup Android environment (Windows):**
```powershell
.\scripts\setup-adb.ps1
```

**3. Configure environment:**
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Running Tests

**Terminal 1 - Start Appium:**
```bash
npm run appium
```

**Terminal 2 - Run Tests:**
```bash
npm run debug          # Run @debug tagged tests
npm run test:merchant  # Run @merchant tests
npm run test:mobile    # Run all @mobile tests
```

### Allure Reports
```bash
npm run report         # Generate and open Allure report
```

## Initial Project Structure Example (will be bigger in the future)

```
├── features/                    # Gherkin feature files
│   └── app-launch.feature
│
├── pageObjects/                 # Page Object Model
│   ├── common/                  # Shared page objects
│   │   └── app.page.ts          # App lifecycle (setup, launch, screenshots)
│   └── merchantPO/              # Merchant app specific
│       ├── merchant.page.ts     # Merchant page actions
│       ├── merchant.steps.ts    # Step definitions
│       ├── merchant.locators.ts # Element locators
│       └── merchant.utils.ts    # OCR & QR utilities
│
├── tools/                       # Device tools
│   └── adb.ts                   # ADB commands wrapper
│
├── config/                      # Configuration
│   ├── app.config.ts            # App package configurations
│   ├── appium.launcher.ts       # Appium server management
│   └── capabilities/            # Device capabilities
│       ├── android.capabilities.ts
│       ├── ios.capabilities.ts
│       └── types.ts
│
├── scripts/                     # Setup & utility scripts
│   ├── start-appium.js          # Start Appium with Inspector config
│   ├── setup-adb.ps1            # Windows Android SDK setup
│   ├── setup-android.sh         # Linux/Mac Android SDK setup
│   └── clean-reports.js         # Clean output directory
│
├── helpers/                     # Appium utilities
│   └── AppiumHelper.ts          # Wait, assertion, element utilities
│
└── output/                      # Test artifacts
    ├── allure-results/          # Allure report data
    └── *.png                    # Screenshots
```

## Available Apps

| App | Package | Platform |
|-----|---------|----------|
| Merchant | `com.receiptsandrewards.merchant.dev` | Android/iOS |
| Consumer | `com.receiptsandrewards.dev` | Android/iOS |

## Environment Variables

Create `.env` file (see `.env.example`):

```env
# Credentials
MERCHANT_EMAIL=your-email
MERCHANT_PASSWORD=your-password

# Device (optional - auto-detected)
DEVICE_UDID=your-device-udid
DEVICE_NAME=your-device-name

# Platform (required)
MOBILE_OS=android  # or 'ios'
```

## Test Tags

| Tag | Description |
|-----|-------------|
| `@mobile` | All mobile tests |
| `@android` | Android-specific tests |
| `@merchant` | Merchant app tests |
| `@consumer` | Consumer app tests |
| `@smoke` | Quick smoke tests |
| `@debug` | Tests under development |

## Appium Inspector

When you run `npm run appium`, it displays JSON configs for Appium Inspector:

```json
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "SM-G986B",
  "appium:appPackage": "com.receiptsandrewards.merchant.dev",
  "appium:noReset": true
}
```

## Platform Support

### Android
- Automation: UiAutomator2
- Capabilities defined in `config/capabilities/android.capabilities.ts`

### iOS
- Automation: XCUITest
- Capabilities defined in `config/capabilities/ios.capabilities.ts`
- Requires macOS with Xcode

## iOS Setup Guide

### Prerequisites

1. **macOS with Xcode installed**
2. **libimobiledevice tools:**
   ```bash
   brew install libimobiledevice ideviceinstaller
   ```

### One-Time Xcode Setup

**1. Add Apple Account to Xcode:**
- Open Xcode → Settings (Cmd+,) → Accounts
- Click + → Add Apple ID (personal account works, no paid developer account needed)
- Select your account → Manage Certificates
- Click + → Add "Apple Development" certificate

**2. Keychain Access:**
- When prompted for keychain password during builds, enter password and click **"Always Allow"**
- This may prompt multiple times - keep clicking "Always Allow" for each

**3. Enable Developer Mode on iPhone:**
- Connect iPhone to Mac via USB
- Open Xcode → Window → Devices and Simulators
- Select your device (may need to plug/unplug a few times)
- On iPhone: Settings → Privacy & Security → Developer Mode → Enable

### Environment Variables for iOS

Add to your `.env` file:
```env
MOBILE_OS=ios
XCODE_ORG_ID=YOUR_TEAM_ID  # Find in Xcode → Settings → Accounts → Your account
```

### WebDriverAgent Setup

**Run the setup script:**
```bash
./scripts/setup-wda.sh
```

This script:
- Builds WDA with your developer certificate (takes 20-60 seconds)
- Installs it on your connected iPhone
- Uses a custom bundle ID to avoid signing conflicts

**After running the script, trust the certificate on iPhone:**
- Settings → General → VPN & Device Management
- Find your developer certificate (your Apple ID email)
- Tap → Trust → Verify

> ⚠️ **Important:** If Appium fails to launch WDA (code 65 error), it will uninstall WDA from the device. You'll need to run `./scripts/setup-wda.sh` again and re-trust the certificate.

### XCUITest Driver Version

For iOS 18+ compatibility (especially for Appium Inspector), use XCUITest driver **7.24.15 or later**:

```bash
appium driver update xcuitest
# Or install specific version:
appium driver install xcuitest@7.24.15
```

Older driver versions have issues with `getPageSource` on iOS 18.

### Appium Inspector (iOS)

Use these capabilities in Appium Inspector:

```json
{
  "platformName": "iOS",
  "appium:automationName": "XCUITest",
  "appium:udid": "YOUR_DEVICE_UDID",
  "appium:platformVersion": "18.4",
  "appium:bundleId": "com.apple.Preferences",
  "appium:xcodeOrgId": "YOUR_TEAM_ID",
  "appium:xcodeSigningId": "Apple Development"
}
```

### Manual WDA Commands (if script fails)

**Build WDA:**
```bash
xcodebuild build-for-testing \
  -project ~/.appium/node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent/WebDriverAgent.xcodeproj \
  -scheme WebDriverAgentRunner \
  -destination "id=YOUR_DEVICE_UDID" \
  DEVELOPMENT_TEAM=YOUR_TEAM_ID \
  PRODUCT_BUNDLE_IDENTIFIER="com.yourname.WebDriverAgentRunner" \
  CODE_SIGN_IDENTITY="Apple Development" \
  GCC_TREAT_WARNINGS_AS_ERRORS=NO \
  -allowProvisioningUpdates
```

**Install WDA on device:**
```bash
ideviceinstaller -u YOUR_DEVICE_UDID install \
  ~/Library/Developer/Xcode/DerivedData/WebDriverAgent-*/Build/Products/Debug-iphoneos/WebDriverAgentRunner-Runner.app
```

**Open WDA project in Xcode (for troubleshooting):**
```bash
open ~/.appium/node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent/WebDriverAgent.xcodeproj
```

### Running iOS Tests

```bash
# Terminal 1 - Start Appium
npm run appium

# Terminal 2 - Run tests
MOBILE_OS=ios npm run debug
```

### iOS Troubleshooting

**Code 65 error**
Run `./scripts/setup-wda.sh` then trust certificate on device

**"Developer App Certificate not trusted"**
iPhone → Settings → General → VPN & Device Management → Trust

**Device not detected**
Enable Developer Mode, try Xcode → Devices and Simulators

**WDA uninstalled after failure**
Run `./scripts/setup-wda.sh` again and re-trust on iPhone

**Appium Inspector won't load elements / "waitForQuiescence" error**
Update XCUITest driver for iOS 18 compatibility:
```bash
appium driver update xcuitest
```

**Keychain password prompts**
Click "Always Allow" for each prompt during build

**Build takes too long**
Normal - WDA build takes 20-60 seconds on first run

## Documentation
- [Step Guidelines](./STEP_GUIDELINES.md)
