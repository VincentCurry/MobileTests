import { spawn, ChildProcess } from 'child_process';
import axios from 'axios';
import { 
  SupportedPlatform, 
  Device, 
  AppiumCapabilities 
} from './capabilities/types';
import { getAndroidCapabilities } from './capabilities/android.capabilities';
import { getIOSCapabilities } from './capabilities/ios.capabilities';
import { getAppPath, getAppConfig, appExists } from './app.config';

let appiumProcess: ChildProcess | null = null;

/**
 * Check if Appium server is running on a port
 */
export async function isAppiumRunning(port: number): Promise<boolean> {
  try {
    const response = await axios.get(`http://localhost:${port}/wd/hub/status`, { timeout: 2000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * Start Appium server on specified port
 */
export async function startAppiumServer(port: number = 4723): Promise<void> {
  if (await isAppiumRunning(port)) {
    console.log(`✓ Appium server already running on port ${port}`);
    return;
  }

  console.log(`Starting Appium server on port ${port}...`);
  
  appiumProcess = spawn('appium', [
    '-p', port.toString(),
    '--base-path', '/wd/hub',
    '--session-override',
    '--log-timestamp'
  ], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  // Wait for server to start
  const maxRetries = 30;
  let attempt = 0;

  while (attempt < maxRetries) {
    if (await isAppiumRunning(port)) {
      console.log(`✓ Appium server started on port ${port}`);
      return;
    }
    attempt++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error(`Failed to start Appium server on port ${port} after ${maxRetries} seconds`);
}

/**
 * Stop Appium server on specified port
 */
export function stopAppiumServer(port: number = 4723): void {
  try {
    // Kill by port (cross-platform approach)
    if (process.platform === 'win32') {
      spawn('taskkill', ['/F', '/IM', 'node.exe'], { shell: true });
    } else {
      spawn('pkill', ['-9', '-f', `appium -p ${port}`], { shell: true });
    }
    console.log(`✓ Appium server stopped on port ${port}`);
  } catch {
    console.warn(`Warning: Could not stop Appium server on port ${port}`);
  }
}

/**
 * Get capabilities for a device and app
 */
export function getCapabilities(
  appName: string,
  platform: SupportedPlatform,
  device: Device,
  options?: {
    useBrowserStack?: boolean;
    isSimulator?: boolean;
    appiumPort?: number;
    systemPort?: number;
  }
): AppiumCapabilities {
  const isSimulator = options?.isSimulator ?? false;
  const appPath = getAppPath(appName, platform, isSimulator);
  const appConfig = getAppConfig(appName, platform);

  if (!appExists(appName, platform, isSimulator)) {
    throw new Error(`App not found at: ${appPath}. Please place your ${platform === 'android' ? '.apk' : '.ipa/.app'} file in the apps/${platform}/ folder.`);
  }

  if (platform === 'android') {
    return getAndroidCapabilities(
      device,
      appPath,
      appConfig.packageIdentifier,
      appConfig.appActivity,
      {
        useBrowserStack: options?.useBrowserStack,
        appiumPort: options?.appiumPort,
        systemPort: options?.systemPort
      }
    );
  } else {
    return getIOSCapabilities(
      device,
      appPath,
      {
        useBrowserStack: options?.useBrowserStack,
        appiumPort: options?.appiumPort
      }
    );
  }
}

/**
 * Launch app on device
 * This prepares everything needed to run tests on a mobile device
 */
export async function launchApp(
  appName: string,
  platform: SupportedPlatform,
  device: Device,
  options?: {
    useBrowserStack?: boolean;
    isSimulator?: boolean;
    appiumPort?: number;
  }
): Promise<AppiumCapabilities> {
  const appiumPort = options?.appiumPort ?? 4723;

  console.log(`\n📱 Launching ${appName} on ${platform}...`);
  console.log(`   Device: ${device.deviceName} (${device.udid})`);
  console.log(`   Platform Version: ${device.platformVersion}`);

  // Start Appium server if not using BrowserStack
  if (!options?.useBrowserStack) {
    await startAppiumServer(appiumPort);
  }

  // Get capabilities
  const capabilities = getCapabilities(appName, platform, device, options);

  console.log(`✓ Ready to launch app`);
  console.log(`   App Path: ${capabilities.capabilities.app}`);
  console.log(`   Appium: ${capabilities.hostname}:${capabilities.port}`);

  return capabilities;
}

/**
 * Cleanup after test run
 */
export function cleanup(port: number = 4723): void {
  stopAppiumServer(port);
  if (appiumProcess) {
    appiumProcess.kill();
    appiumProcess = null;
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, cleaning up...');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, cleaning up...');
  cleanup();
  process.exit(0);
});
