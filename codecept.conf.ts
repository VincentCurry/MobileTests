import { setHeadlessWhen, setWindowSize } from '@codeceptjs/configure';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

// set window size for web testing
setWindowSize(1920, 1080);

const isMobile = process.env.MOBILE === 'true';

const platform = process.env.PLATFORM || 'android';

const androidCapabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': process.env.DEVICE_NAME || 'Android Device',
  'appium:udid': process.env.DEVICE_UDID || '',
  'appium:appPackage': 'com.receiptsandrewards.merchant.dev',
  'appium:noReset': true,
  'appium:autoLaunch': false,
  'appium:disableWindowAnimation': true,
  'appium:autoGrantPermissions': true,
  'appium:autoAcceptAlerts': true
};

const iosCapabilities = {
  platformName: 'iOS',
  'appium:automationName': 'XCUITest',
  'appium:deviceName': process.env.DEVICE_NAME || 'iPhone',
  'appium:udid': process.env.DEVICE_UDID || '',
  'appium:bundleId': 'com.receiptsandrewards.merchant.dev',
  'appium:noReset': true,
  'appium:autoLaunch': false,
  'appium:autoAcceptAlerts': true
};

const appiumHelper = {
  Appium: {
    host: '127.0.0.1',
    port: 4723,
    path: '/wd/hub',
    platform: platform === 'ios' ? 'iOS' : 'Android',
    device: process.env.DEVICE_NAME || 'Android Device',
    desiredCapabilities: platform === 'ios' ? iosCapabilities : androidCapabilities
  }
};

const playwrightHelper = {
  Playwright: {
    url: process.env.BASE_URL,
    show: true,
    browser: 'chromium',
    windowSize: '1920x1080',
    waitForTimeout: 10000,
    waitForAction: 1000,
    timeout: 30000,
    video: './output/videos/',
    keepVideoForPassedTests: true,
    chromium: {
      args: ['--disable-blink-features=AutomationControlled']
    },
    contextOptions: {
      acceptDownloads: true
    }
  }
};

export const config = {
  tests: './features/**/*.feature',
  output: './output',
  helpers: {
    ...(isMobile ? appiumHelper : playwrightHelper),
    FileSystem: {}
  },
  gherkin: {
    features: './features/**/*.feature',
    steps: [
      './pageObjects/merchantPO/merchant.steps.ts'
    ]
  },
  include: {
    // Generic Helpers
    waitHelper: './tests/helpers/WaitHelper.ts',
    clickHelper: './tests/helpers/ClickHelper.ts',
    assertionHelper: './tests/helpers/AssertionHelper.ts',
    navigationHelper: './tests/helpers/NavigationHelper.ts',
    elementHelper: './tests/helpers/ElementHelper.ts',
    searchHelper: './tests/helpers/SearchHelper.ts',
    downloadHelper: './tests/helpers/DownloadHelper.ts'
  },
  plugins: {
    screenshotOnFail: {
      enabled: true
    },
    retryFailedStep: {
      enabled: false
    },
    tryTo: {
      enabled: true
    },
    allure: {
      enabled: true,
      require: 'allure-codeceptjs',
      outputDir: './output/allure-results',
      enableScreenshotDiffPlugin: false,
    }
  },
  require: ['ts-node/register'],
  name: 'wallpaper-portal-tests',
  translation: 'en-US'
};
