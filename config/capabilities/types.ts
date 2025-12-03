/**
 * Supported mobile platforms
 */
export const SUPPORTED_PLATFORMS = ['android', 'ios'] as const;
export type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

/**
 * Basic device info
 */
export interface Device {
  /** Device UDID */
  udid: string;
  /** Platform version of the device */
  platformVersion: string;
  /** Platform name of the device */
  platformName: SupportedPlatform;
  /** Device full name */
  deviceName: string;
  /** Device manufacturer */
  manufacturer?: string;
}

/**
 * Appium capabilities for mobile testing
 */
export interface AppiumCapabilities {
  // Connection settings
  hostname: string;
  port: number;
  path: string;
  protocol: 'http' | 'https';
  logLevel: 'error' | 'info' | 'debug';
  
  // Device capabilities
  capabilities: DesiredCapabilities;
}

/**
 * Extended device capabilities for Appium
 */
export interface DesiredCapabilities extends Device {
  /** App path or URL */
  app: string;
  /** Session timeouts */
  timeouts: { implicit: number };
  /** Automation tool (UiAutomator2 for Android, XCUITest for iOS) */
  automationName: string;
  /** Timeout before session is considered idle */
  newCommandTimeout: number;
  /** Network speed simulation */
  networkSpeed: string;
  /** Keep app data between sessions */
  noReset: boolean;
  /** Reinstall app between sessions */
  fullReset: boolean;
  /** Auto launch app */
  autoLaunch: boolean;

  // Android-specific (UiAutomator2)
  /** App package identifier */
  appPackage?: string;
  /** Main activity to launch */
  appActivity?: string;
  /** Activities to wait for */
  appWaitActivity?: string;
  /** Auto grant permissions */
  autoGrantPermissions?: boolean;
  /** ADB command timeout */
  adbExecTimeout?: number;
  /** App install timeout */
  androidInstallTimeout?: number;
  /** App wait duration */
  appWaitDuration?: number;
  /** System port for UiAutomator2 */
  systemPort?: number;
  /** Remote ADB host (for Docker) */
  remoteAdbHost?: string;
  /** Skip device initialization */
  skipDeviceInitialization?: boolean;
  /** Skip server installation */
  skipServerInstallation?: boolean;
  /** Skip logcat capture */
  skipLogcatCapture?: boolean;
  /** Suppress kill server */
  suppressKillServer?: boolean;
  /** Ignore hidden API policy error */
  ignoreHiddenApiPolicyError?: boolean;
  /** Don't stop app on reset */
  dontStopAppOnReset?: boolean;
  /** Force app launch */
  forceAppLaunch?: boolean;
  /** Should terminate app */
  shouldTerminateApp?: boolean;
  /** Skip app signing */
  noSign?: boolean;
  /** Mock location app */
  mockLocationApp?: string | null;

  // iOS-specific (XCUITest)
  /** Apple developer team ID */
  xcodeOrgId?: string;
  /** Signing certificate identifier */
  xcodeSigningId?: string;
  /** Force reinstall WebDriverAgent */
  useNewWDA?: boolean;
  /** WDA startup retry count */
  wdaStartupRetries?: number;
  /** Use prebuilt WDA */
  usePrebuiltWDA?: boolean;
  /** Derived data path for WDA */
  derivedDataPath?: string;
  /** Local port for WDA */
  wdaLocalPort?: number;

  // BrowserStack capabilities
  'bstack:options'?: BrowserStackOptions;
}

/**
 * BrowserStack cloud testing options
 */
export interface BrowserStackOptions {
  userName: string;
  accessKey: string;
  realMobile: boolean;
  interactiveDebugging: boolean;
  deviceName: string;
  platformVersion: string;
  platformName: string;
  os: string;
  osVersion: string;
  appiumLogs: boolean;
  video: boolean;
}
