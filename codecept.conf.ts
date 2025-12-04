import * as dotenv from 'dotenv';
import { SupportedPlatform } from './config/capabilities/types';
import { getAndroidCapabilities } from './config/capabilities/android.capabilities';
import { getIOSCapabilities } from './config/capabilities/ios.capabilities';

dotenv.config();

// Platform: Set PLATFORM=android or PLATFORM=ios in .env
const platform: SupportedPlatform = (process.env.PLATFORM as SupportedPlatform) || 'android';

// Cloud testing options:
// - BrowserStack: Available as example in capabilities files (set BROWSERSTACK=true)
const useBrowserStack = false;

// Device configuration - all values should be set in .env file
// Required: DEVICE_UDID, DEVICE_NAME
// Optional: PLATFORM_VERSION, DEVICE_MANUFACTURER
if (!process.env.DEVICE_UDID) {
  console.log('WARNING: DEVICE_UDID not set in .env - run "adb devices" to get your device UDID');
}
if (!process.env.DEVICE_NAME) {
  console.log('WARNING: DEVICE_NAME not set in .env - run "adb shell getprop ro.product.model" to get device name');
}

const device = {
  udid: process.env.DEVICE_UDID || '',
  deviceName: process.env.DEVICE_NAME || '',
  platformName: platform,
  platformVersion: process.env.PLATFORM_VERSION || '',
  manufacturer: process.env.DEVICE_MANUFACTURER || ''
};

const appPackage = 'com.receiptsandrewards.merchant.dev';
const appPath = ''; // Not using app path - app already installed

function getCapabilities() {
  if (platform === 'ios') {
    const caps = getIOSCapabilities(device, appPath, { useBrowserStack });
    return {
      platformName: 'iOS',
      'appium:automationName': caps.capabilities.automationName,
      'appium:deviceName': device.deviceName,
      'appium:udid': device.udid,
      'appium:bundleId': appPackage,
      'appium:noReset': caps.capabilities.noReset,
      'appium:autoLaunch': caps.capabilities.autoLaunch,
      'appium:newCommandTimeout': caps.capabilities.newCommandTimeout,
      'appium:useNewWDA': caps.capabilities.useNewWDA,
      'appium:wdaStartupRetries': caps.capabilities.wdaStartupRetries,
      'appium:usePrebuiltWDA': caps.capabilities.usePrebuiltWDA,
      'appium:wdaLocalPort': caps.capabilities.wdaLocalPort
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
