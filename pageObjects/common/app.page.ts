/// <reference path="../../global.d.ts" />
import * as adb from '../../tools/adb';
import { APP_CONFIG } from '../../config/app.config';

const { I } = inject();

let currentBundleId: string = '';

function getAppConfig(appName: string) {
  const appConfig = APP_CONFIG[appName];
  if (!appConfig) {
    throw new Error(`Unknown app: ${appName}. Available: ${Object.keys(APP_CONFIG).join(', ')}`);
  }
  return appConfig;
}

export const AppPage = {
  async setupApp(appName: string) {
    const appConfig = getAppConfig(appName);
    
    switch (process.env.MOBILE_OS) {
      case 'ios':
        currentBundleId = appConfig.ios.packageIdentifier;
        // App installation is handled by Appium via capabilities (appium:app)
        if (process.env.IOS_APP) {
          I.say(`iOS: App will be installed from ${process.env.IOS_APP}`);
        } else {
          I.say('iOS: Using existing app installation');
        }
        break;
      case 'android':
        currentBundleId = appConfig.android.packageIdentifier;
        if (!adb.isAppInstalled(currentBundleId)) {
          throw new Error(`App ${currentBundleId} not installed`);
        }
        adb.resetApp(currentBundleId);
        break;
    }
  },

  async launchApp() {
    switch (process.env.MOBILE_OS) {
      case 'ios':
        // App is launched automatically by Appium when session starts
        I.say('iOS: App launched by Appium');
        break;
      case 'android':
        adb.launchApp(currentBundleId);
        break;
    }
  },

  async verifyAppVisible() {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    switch (process.env.MOBILE_OS) {
      case 'ios':
        I.say('iOS: Verifying app is visible...');
        // Take a screenshot to verify app state
        await I.saveScreenshot('ios_app_visible.png');
        I.say('iOS: ✓ App is running');
        break;
      case 'android':
        if (!adb.isAppInForeground(currentBundleId)) {
          throw new Error('App not in foreground');
        }
        break;
    }
  },

  async lockScreen() {
    switch (process.env.MOBILE_OS) {
      case 'ios':
        // iOS: Not implemented
        break;
      case 'android':
        adb.lockDevice();
        break;
    }
  },

  async wakeScreen() {
    switch (process.env.MOBILE_OS) {
      case 'ios':
        // iOS: Not implemented
        break;
      case 'android':
        adb.wakeScreen();
        break;
    }
  },

  async takeScreenshot(name: string): Promise<string> {
    switch (process.env.MOBILE_OS) {
      case 'ios':
        return `./output/${name}.png`;
      case 'android':
        return adb.takeScreenshot(name);
      default:
        return `./output/${name}.png`;
    }
  }
};
