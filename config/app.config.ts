import * as path from 'path';
import * as fs from 'fs';
import { SupportedPlatform } from './capabilities/types';

/**
 * App configuration for mobile testing
 */
export interface AppConfig {
  /** App package identifier (e.g., com.example.app) */
  packageIdentifier: string;
  /** App package name (filename without extension) */
  packageName: string;
  /** Main activity for Android (e.g., com.example.app.MainActivity) */
  appActivity?: string;
  /** Activities to wait for on Android */
  appWaitActivity?: string;
}

/**
 * App configurations per platform
 */
export interface AppPlatformConfig {
  android: AppConfig;
  ios: AppConfig;
}

/**
 * Define your app configurations here
 */
export const APP_CONFIG: Record<string, AppPlatformConfig> = {
  'receipts-rewards': {
    android: {
      packageIdentifier: 'com.receiptsandrewards.dev',
      packageName: 'app-develop-bitrise-signed.apk',
      appActivity: '.MainActivity',
      appWaitActivity: '.MainActivity,.SplashActivity'
    },
    ios: {
      packageIdentifier: 'com.receiptsandrewards.dev',
      packageName: 'receipts-rewards.ipa'
    }
  },
  'merchant': {
    android: {
      packageIdentifier: 'com.receiptsandrewards.merchant.dev',
      packageName: 'app-develop-bitrise-mechant-signed.apk',
      appActivity: '.MainActivity',
      appWaitActivity: '.MainActivity,.SplashActivity'
    },
    ios: {
      packageIdentifier: 'com.receiptsandrewards.merchant.dev',
      packageName: 'merchant.ipa'
    }
  }
};

/**
 * Get the full path to an app file
 */
export function getAppPath(
  appName: string,
  platform: SupportedPlatform,
  isSimulator: boolean = false
): string {
  const config = APP_CONFIG[appName];
  
  if (!config) {
    throw new Error(`App configuration not found for: ${appName}. Available apps: ${Object.keys(APP_CONFIG).join(', ')}`);
  }

  const platformConfig = config[platform];
  let packageName = platformConfig.packageName;

  // For iOS simulators, use .app instead of .ipa
  if (platform === 'ios' && isSimulator) {
    packageName = packageName.replace('.ipa', '.app');
  }

  const appPath = path.join(process.cwd(), 'apps', platform, packageName);
  
  return appPath;
}

/**
 * Check if app exists at the expected path
 */
export function appExists(
  appName: string,
  platform: SupportedPlatform,
  isSimulator: boolean = false
): boolean {
  const appPath = getAppPath(appName, platform, isSimulator);
  return fs.existsSync(appPath);
}

/**
 * Get app configuration
 */
export function getAppConfig(appName: string, platform: SupportedPlatform): AppConfig {
  const config = APP_CONFIG[appName];
  
  if (!config) {
    throw new Error(`App configuration not found for: ${appName}`);
  }

  return config[platform];
}

/**
 * List all available apps in the apps folder
 */
export function listAvailableApps(): { android: string[]; ios: string[] } {
  const appsDir = path.join(process.cwd(), 'apps');
  const result = { android: [] as string[], ios: [] as string[] };

  const androidDir = path.join(appsDir, 'android');
  const iosDir = path.join(appsDir, 'ios');

  if (fs.existsSync(androidDir)) {
    result.android = fs.readdirSync(androidDir).filter(f => f.endsWith('.apk'));
  }

  if (fs.existsSync(iosDir)) {
    result.ios = fs.readdirSync(iosDir).filter(f => f.endsWith('.ipa') || f.endsWith('.app'));
  }

  return result;
}
