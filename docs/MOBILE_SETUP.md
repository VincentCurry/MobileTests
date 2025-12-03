# Mobile Testing Setup

## One-Command Setup

The setup script installs everything: Node.js check, Java, Android SDK, Appium, and UiAutomator2 driver.

### Windows
```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup-adb.ps1
```

### macOS
```bash
chmod +x scripts/setup-android.sh && ./scripts/setup-android.sh
```

### After Setup
1. **Restart your terminal/IDE**
2. Connect Android device via USB
3. Enable USB debugging on device
4. Verify: `adb devices`

## Run Tests
```bash
npm run appium        # Start Appium server (127.0.0.1:4723)
npm run test:mobile   # Run mobile tests
```

## Appium Inspector

Download: https://github.com/appium/appium-inspector/releases
- Windows: `Appium-Inspector-2025.11.1-win-x64.exe`

### Step 1: Server Settings (top bar)
```json
{
  "Remote Host": "127.0.0.1",
  "Remote Port": "4723",
  "Remote Path": "/"
}
```

### Step 2: Capabilities (JSON Representation)
```json
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "R5CN601FHXR",
  "appium:appPackage": "com.receiptsandrewards.dev",
  "appium:noReset": true
}
```

### Step 3: Click "Start Session"
