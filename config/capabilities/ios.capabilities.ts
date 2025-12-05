import { AppiumCapabilities, Device } from './types';

const wdaLocalPort = 8100;

/**
 * Default iOS capabilities for Appium testing
 */
export function getIOSCapabilities(
  device: Device,
  appPath: string,
  options?: {
    useBrowserStack?: boolean;
    appiumPort?: number;
    xcodeOrgId?: string;
    xcodeSigningId?: string;
    derivedDataPath?: string;
  }
): AppiumCapabilities {
  const useBrowserStack = options?.useBrowserStack ?? false;
  const appiumPort = options?.appiumPort ?? 4723;
  const xcodeOrgId = options?.xcodeOrgId ?? process.env.XCODE_ORG_ID ?? '';
  const xcodeSigningId = options?.xcodeSigningId ?? 'Apple Development';
  const derivedDataPath = options?.derivedDataPath;

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
      automationName: 'XCUITest',
      xcodeOrgId: xcodeOrgId,
      xcodeSigningId: xcodeSigningId,
      newCommandTimeout: 4000,
      networkSpeed: 'full',
      noReset: true,
      fullReset: false,
      autoLaunch: false,
      useNewWDA: false,
      wdaStartupRetries: 4,
      usePrebuiltWDA: true,
      derivedDataPath: derivedDataPath,
      wdaLocalPort: wdaLocalPort
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
      platformName: 'ios',
      os: 'ios',
      osVersion: device.platformVersion,
      appiumLogs: true,
      video: true
    };
    baseCapabilities.capabilities.wdaLocalPort = undefined;
    baseCapabilities.capabilities.autoLaunch = true;
  }

  return baseCapabilities;
}

/**
 * Example iOS device configurations
 */
export const IOS_DEVICES = {
  iPhone14: {
    udid: '00008110-XXXXXXXXXXXX', // Replace with actual UDID
    deviceName: 'iPhone 14',
    platformName: 'ios' as const,
    platformVersion: '16.0',
    manufacturer: 'Apple'
  },
  iPhone14Simulator: {
    udid: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', // Replace with simulator UDID
    deviceName: 'iPhone 14',
    platformName: 'ios' as const,
    platformVersion: '16.0',
    manufacturer: 'Apple'
  },
  // BrowserStack devices
  browserStackiPhone14: {
    udid: 'browserstack',
    deviceName: 'iPhone 14',
    platformName: 'ios' as const,
    platformVersion: '16',
    manufacturer: 'Apple'
  },
  browserStackiPhone13: {
    udid: 'browserstack',
    deviceName: 'iPhone 13',
    platformName: 'ios' as const,
    platformVersion: '15',
    manufacturer: 'Apple'
  }
};
