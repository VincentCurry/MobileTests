import * as dotenv from 'dotenv';
import { execSync } from 'child_process';
import { SupportedPlatform } from './config/capabilities/types';
import { getFirstConnectedDevice } from './tools/deviceDetection';

dotenv.config();

// MOBILE_OS must be set to 'ios' or 'android'
const platform = process.env.MOBILE_OS as SupportedPlatform;
if (platform !== 'ios' && platform !== 'android') {
  console.error('ERROR: MOBILE_OS must be set to "ios" or "android"');
  process.exit(1);
}

// Detect connected device
const detectedDevice = getFirstConnectedDevice(platform);
if (!detectedDevice) {
  console.error(`No ${platform} device connected.`);
  process.exit(1);
}

console.log(`Using device: ${detectedDevice.deviceName} (${detectedDevice.udid})`);

// Validate app path is set for Android (iOS can run without app for WDA testing)
if (platform === 'android' && !process.env.ANDROID_APP) {
  console.error('ERROR: ANDROID_APP must be set in .env');
  process.exit(1);
}

function getIOSCapabilities() {
  // Find WDA build (created by ./scripts/setup-wda.sh)
  let derivedDataPath = '';
  try {
    derivedDataPath = execSync('ls -d ~/Library/Developer/Xcode/DerivedData/WebDriverAgent-* 2>/dev/null | head -1', { encoding: 'utf-8' }).trim();
  } catch {
    console.error('WDA not found. Run: ./scripts/setup-wda.sh');
    process.exit(1);
  }

  // Skip app install - no signed IPA available yet
  // When IOS_BUNDLE_ID is set, will launch that app
  // When IOS_APP is set and signed, will install and launch
  // Otherwise, just starts WDA without launching an app
  console.log('iOS: Skipping app installation (no signed IPA available)');
  
  return {
    platformName: 'iOS',
    'appium:automationName': 'XCUITest',
    'appium:udid': detectedDevice.udid,
    'appium:bundleId': 'com.apple.Preferences', // Settings app for testing
    'appium:xcodeOrgId': process.env.XCODE_ORG_ID,
    'appium:xcodeSigningId': 'Apple Development',
    'appium:usePrebuiltWDA': true,
    'appium:derivedDataPath': derivedDataPath,
    'appium:noReset': true,
    'appium:wdaStartupRetries': 0
  };
}

function getAndroidCapabilities() {
  return {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:udid': detectedDevice.udid,
    'appium:app': process.env.ANDROID_APP!,
    'appium:noReset': true,
    'appium:autoGrantPermissions': true
  };
}

export const config = {
  tests: './features/**/*.feature',
  output: './output',
  helpers: {
    Appium: {
      host: '127.0.0.1',
      port: 4723,
      path: '/wd/hub',
      platform: platform === 'ios' ? 'iOS' : 'Android',
      // iOS: app commented out until signed IPA available
      ...(platform === 'android' ? { app: process.env.ANDROID_APP! } : {}),
      restart: false,
      desiredCapabilities: platform === 'ios' ? getIOSCapabilities() : getAndroidCapabilities()
    },
    FileSystem: {}
  },
  gherkin: {
    features: './features/**/*.feature',
    steps: [
      './pageObjects/merchantPO/merchant.steps.ts'
    ]
  },
  plugins: {
    screenshotOnFail: {
      enabled: true
    },
    allure: {
      enabled: true,
      require: 'allure-codeceptjs',
      outputDir: './output/allure-results'
    }
  },
  require: ['ts-node/register'],
  name: 'mobile-e2e-tests'
};
