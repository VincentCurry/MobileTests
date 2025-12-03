import { AppiumCapabilities, Device } from './types';

/**
 * Default Android capabilities for Appium testing
 */
export function getAndroidCapabilities(
  device: Device,
  appPath: string,
  appPackage: string,
  appActivity?: string,
  options?: {
    useBrowserStack?: boolean;
    systemPort?: number;
    appiumPort?: number;
  }
): AppiumCapabilities {
  const useBrowserStack = options?.useBrowserStack ?? false;
  const systemPort = options?.systemPort ?? 8200;
  const appiumPort = options?.appiumPort ?? 4723;

  const baseCapabilities: AppiumCapabilities = {
    hostname: useBrowserStack ? 'hub-cloud.browserstack.com' : 'localhost',
    port: useBrowserStack ? 80 : appiumPort,
    path: '/wd/hub',
    protocol: 'http',
    logLevel: 'error',
    capabilities: {
      ...device,
      app: appPath,
      timeouts: { implicit: 20000 },
      automationName: 'UiAutomator2',
      appPackage: appPackage,
      appActivity: appActivity,
      appWaitActivity: appActivity,
      autoGrantPermissions: true,
      newCommandTimeout: 4000,
      adbExecTimeout: 600000,
      androidInstallTimeout: 600000,
      appWaitDuration: 60000,
      networkSpeed: 'full',
      noReset: true,
      fullReset: false,
      autoLaunch: false,
      systemPort: systemPort,
      // Performance optimizations
      skipDeviceInitialization: true,
      skipServerInstallation: true,
      skipLogcatCapture: true,
      suppressKillServer: true,
      ignoreHiddenApiPolicyError: true,
      dontStopAppOnReset: true,
      forceAppLaunch: false,
      shouldTerminateApp: false,
      noSign: true,
      mockLocationApp: null
    }
  };

  // Add BrowserStack options if enabled
  if (useBrowserStack) {
    baseCapabilities.capabilities['bstack:options'] = {
      userName: process.env.BROWSERSTACK_USER || '',
      accessKey: process.env.BROWSERSTACK_KEY || '',
      realMobile: true,
      interactiveDebugging: true,
      deviceName: device.deviceName,
      platformVersion: device.platformVersion,
      platformName: 'android',
      os: 'android',
      osVersion: device.platformVersion,
      appiumLogs: true,
      video: true
    };
    baseCapabilities.capabilities.noReset = false;
    baseCapabilities.capabilities.autoLaunch = true;
    baseCapabilities.capabilities.appActivity = undefined;
  }

  // Docker environment support
  if (process.env.ANDROID_ADB_SERVER_ADDRESS === 'host.docker.internal') {
    baseCapabilities.capabilities.remoteAdbHost = 'host.docker.internal';
  }

  return baseCapabilities;
}

/**
 * Example Android device configurations
 */
export const ANDROID_DEVICES = {
  pixel6: {
    udid: 'emulator-5554',
    deviceName: 'Pixel 6',
    platformName: 'android' as const,
    platformVersion: '13.0',
    manufacturer: 'Google'
  },
  samsungS21: {
    udid: 'RF8M33XXXXX', // Replace with actual UDID
    deviceName: 'Samsung Galaxy S21',
    platformName: 'android' as const,
    platformVersion: '12.0',
    manufacturer: 'Samsung'
  },
  // BrowserStack devices
  browserStackPixel6: {
    udid: 'browserstack',
    deviceName: 'Google Pixel 6',
    platformName: 'android' as const,
    platformVersion: '12.0',
    manufacturer: 'Google'
  }
};
