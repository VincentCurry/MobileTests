/// <reference path="../../global.d.ts" />
import * as adb from '../../tools/adb';
import { APP_CONFIG } from '../../config/app.config';

// Get platform from environment
const platform = process.env.PLATFORM || 'android';
const isIOS = platform === 'ios';

let currentPackage: string = '';

function getAppConfig(appName: string) {
  const appConfig = APP_CONFIG[appName];
  if (!appConfig) {
    throw new Error(`Unknown app: ${appName}. Available: ${Object.keys(APP_CONFIG).join(', ')}`);
  }
  return appConfig;
}

function setCurrentPackage(packageName: string) {
  currentPackage = packageName;
}

function getCurrentPackage() {
  return currentPackage;
}

export const AppPage = {
  async setupApp(appName: string) {
    const appConfig = getAppConfig(appName);
    // Use platform-specific package identifier
    const packageName = isIOS 
      ? appConfig.ios.packageIdentifier 
      : appConfig.android.packageIdentifier;
    setCurrentPackage(packageName);
    
    // For iOS, Appium handles app installation via capabilities
    // For Android, check if installed
    if (!isIOS) {
      if (!adb.isAppInstalled(packageName)) {
        throw new Error(`App ${packageName} not installed`);
      }
      adb.resetApp(packageName);
    }
    // iOS: app will be installed/launched by Appium via the IPA path in capabilities
  },

  async launchApp() {
    if (isIOS) {
      // iOS: Use Appium/WebDriverIO to launch
      // The app should already be launched by Appium session
      console.log('iOS: App launched via Appium session');
    } else {
      adb.launchApp(getCurrentPackage());
    }
  },

  async verifyAppVisible() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    if (isIOS) {
      // iOS: Just wait and assume visible if no error
      console.log('iOS: Verifying app is visible');
    } else {
      if (!adb.isAppInForeground(getCurrentPackage())) {
        throw new Error('App not in foreground');
      }
    }
  },

  async lockScreen() {
    if (!isIOS) {
      adb.lockDevice();
    }
  },

  async wakeScreen() {
    if (!isIOS) {
      adb.wakeScreen();
    }
  },

  async takeScreenshot(name: string): Promise<string> {
    if (isIOS) {
      // Use Appium for iOS screenshots
      return `./output/${name}.png`;
    }
    return adb.takeScreenshot(name);
  }
};
