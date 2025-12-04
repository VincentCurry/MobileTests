/// <reference path="../../global.d.ts" />
import { 
  isAppInstalled, 
  resetApp, 
  launchApp as launchAppUtil, 
  isAppInForeground,
  lockDevice,
  wakeScreen,
  takeScreenshot
} from '../../tools/adb';
import { APP_CONFIG } from '../../config/app.config';

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
    const packageName = appConfig.android.packageIdentifier;
    setCurrentPackage(packageName);
    
    if (!isAppInstalled(packageName)) {
      throw new Error(`App ${packageName} not installed`);
    }
    
    resetApp(packageName);
  },

  async launchApp() {
    launchAppUtil(getCurrentPackage());
  },

  async verifyAppVisible() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!isAppInForeground(getCurrentPackage())) {
      throw new Error('App not in foreground');
    }
  },

  async lockScreen() {
    lockDevice();
  },

  async wakeScreen() {
    wakeScreen();
  },

  async takeScreenshot(name: string): Promise<string> {
    return takeScreenshot(name);
  }
};
