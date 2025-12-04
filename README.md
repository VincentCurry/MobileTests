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

# Platform
PLATFORM=android  # or 'ios'
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

## Documentation

- [Mobile Setup Guide](./docs/MOBILE_SETUP.md)
- [Step Guidelines](./STEP_GUIDELINES.md)
