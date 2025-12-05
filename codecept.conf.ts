import * as dotenv from 'dotenv';
import { SupportedPlatform } from './config/capabilities/types';
import { getAndroidCapabilities } from './config/capabilities/android.capabilities';
import { getFirstConnectedDevice } from './tools/deviceDetection';

dotenv.config();


// Platform: Set PLATFORM=android or PLATFORM=ios via environment variable
const platform: SupportedPlatform = (process.env.PLATFORM as SupportedPlatform) || 'android';

// Cloud testing options:
// - BrowserStack: Available as example in capabilities files (set BROWSERSTACK=true)
const useBrowserStack = false;

// Auto-detect first connected device for the platform
const detectedDevice = getFirstConnectedDevice(platform);

if (!detectedDevice) {
  console.log(`WARNING: No ${platform} device connected. Connect a device and try again.`);
  console.log(platform === 'android' ? '  Run "adb devices" to check connected devices' : '  Connect iPhone via USB');
}

const device = detectedDevice ? {
  udid: detectedDevice.udid,
  deviceName: detectedDevice.deviceName,
  platformName: platform,
  platformVersion: detectedDevice.platformVersion,
  manufacturer: detectedDevice.manufacturer
} : {
  udid: '',
  deviceName: '',
  platformName: platform,
  platformVersion: '',
  manufacturer: ''
};

console.log(`Using device: ${device.deviceName} (${device.udid})`);

// WDA should already be built via Xcode (Cmd+U on WebDriverAgent.xcodeproj)

// App config - use receipts-rewards consumer app for @debug test
const appPackage = 'com.receiptsandrewards.dev';
const appPath = platform === 'ios' 
  ? './apps/ios/Receipts_and_Rewards_debug.ipa'
  : './apps/android/app-develop-bitrise-signed.apk';

function getCapabilities() {
  if (platform === 'ios') {
    // WDA is pre-built via Xcode, Appium will use test-without-building
    const derivedDataPath = `${process.env.HOME}/Library/Developer/Xcode/DerivedData/WebDriverAgent-dwkpxiojltkdazdlxjffpqneywsz`;
    return {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': device.deviceName,
      'appium:udid': device.udid,
      'appium:platformVersion': device.platformVersion,
      'appium:app': appPath,
      'appium:xcodeOrgId': process.env.XCODE_ORG_ID,
      'appium:xcodeSigningId': 'Apple Development',
      'appium:newCommandTimeout': 4000,
      'appium:noReset': true,
      'appium:fullReset': false,
      'appium:autoLaunch': false,
      'appium:useNewWDA': false,
      'appium:usePrebuiltWDA': true,
      'appium:derivedDataPath': derivedDataPath,
      'appium:showXcodeLog': true,
      'appium:wdaLocalPort': 8100
    };
  } else {
    const caps = getAndroidCapabilities(device, appPath, appPackage, undefined, { useBrowserStack });
    return {
      platformName: 'Android',
      'appium:automationName': caps.capabilities.automationName,
      'appium:deviceName': device.deviceName,
      'appium:udid': device.udid,
      'appium:appPackage': appPackage,
      'appium:noReset': caps.capabilities.noReset,
      'appium:autoLaunch': caps.capabilities.autoLaunch,
      'appium:autoGrantPermissions': caps.capabilities.autoGrantPermissions,
      'appium:newCommandTimeout': caps.capabilities.newCommandTimeout,
      'appium:adbExecTimeout': caps.capabilities.adbExecTimeout,
      'appium:skipDeviceInitialization': caps.capabilities.skipDeviceInitialization,
      'appium:skipServerInstallation': caps.capabilities.skipServerInstallation,
      'appium:dontStopAppOnReset': caps.capabilities.dontStopAppOnReset
    };
  }
}

export const config = {
  tests: './features/**/*.feature',
  output: './output',
  helpers: {
    Appium: {
      host: useBrowserStack ? 'hub-cloud.browserstack.com' : '127.0.0.1',
      port: useBrowserStack ? 80 : 4723,
      path: '/wd/hub',
      platform: platform === 'ios' ? 'iOS' : 'Android',
      device: device.deviceName,
      restart: false,
      desiredCapabilities: getCapabilities()
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
