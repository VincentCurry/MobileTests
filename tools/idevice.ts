import { execSync } from 'child_process';

// Cache the derived data path so we don't rebuild on every config load
let cachedDerivedDataPath: string | null = null;

/**
 * Get derivedDataPath for Appium capabilities
 * Just returns the path, doesn't build - Appium will handle WDA
 */
export function getDerivedDataPath(isSimulator: boolean = false): string {
  if (cachedDerivedDataPath) {
    return cachedDerivedDataPath;
  }
  
  const wdaFolder = `${process.env.HOME}/Library/Developer/Xcode/DerivedData/WebDriverAgent-*/Build/Products/Debug-${isSimulator ? 'iphonesimulator' : 'iphoneos'}`;
  
  try {
    const path = execSync(`ls -d ${wdaFolder} 2>/dev/null | head -1`, { encoding: 'utf-8', shell: '/bin/bash' }).trim();
    if (path) {
      cachedDerivedDataPath = path.split('Build/')[0];
      return cachedDerivedDataPath;
    }
  } catch {}
  
  // Return default path - Appium will build if needed
  cachedDerivedDataPath = `${process.env.HOME}/Library/Developer/Xcode/DerivedData/WebDriverAgent`;
  return cachedDerivedDataPath;
}

export function installApp(udid: string, appPath: string): void {
  console.log(`Installing ${appPath}...`);
  execSync(`ideviceinstaller -u ${udid} install "${appPath}"`, { stdio: 'inherit' });
}

export function uninstallApp(udid: string, bundleId: string): void {
  try {
    execSync(`ideviceinstaller -u ${udid} uninstall ${bundleId}`, { stdio: 'pipe' });
  } catch {}
}

export function getConnectedIOSDevice(): { udid: string; name: string; version: string } | null {
  try {
    const output = execSync('xcrun xctrace list devices 2>&1', { encoding: 'utf-8' });
    for (const line of output.split('\n')) {
      const match = line.match(/^(.+?)\s+\((\d+\.\d+(?:\.\d+)?)\)\s+\(([A-F0-9-]+)\)$/i);
      if (match && !line.includes('Simulator')) {
        return { name: match[1].trim(), version: match[2], udid: match[3] };
      }
    }
  } catch {}
  return null;
}

/**
 * Build WebDriverAgent for a specific device
 * Returns the path to the built WDA app
 */
export function buildWDA(udid: string, teamId: string): string {
  const wdaProject = `${process.env.HOME}/.appium/node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent/WebDriverAgent.xcodeproj`;
  
  console.log('Building WebDriverAgent for device...');
  execSync(
    `xcodebuild build-for-testing -project "${wdaProject}" -scheme WebDriverAgentRunner -destination "id=${udid}" DEVELOPMENT_TEAM=${teamId} CODE_SIGN_IDENTITY="Apple Development" GCC_TREAT_WARNINGS_AS_ERRORS=NO -allowProvisioningUpdates -quiet`,
    { stdio: 'inherit', shell: '/bin/bash' }
  );
  
  // Find the built app
  const wdaAppPath = execSync(
    `ls -d ${process.env.HOME}/Library/Developer/Xcode/DerivedData/WebDriverAgent-*/Build/Products/Debug-iphoneos/WebDriverAgentRunner-Runner.app 2>/dev/null | head -1`,
    { encoding: 'utf-8', shell: '/bin/bash' }
  ).trim();
  
  console.log('WebDriverAgent built successfully.');
  return wdaAppPath;
}

/**
 * Ensure WDA is installed on device - builds if needed, installs if not present
 * @param udid - Device UDID
 * @param teamId - Apple Development Team ID
 * @param options - { forceBuild: boolean, forceInstall: boolean }
 */
export function ensureWDAInstalled(
  udid: string, 
  teamId: string, 
  options: { forceBuild?: boolean; forceInstall?: boolean } = {}
): void {
  const { forceBuild = false, forceInstall = false } = options;
  const wdaBundleId = 'com.domasvz.WebDriverAgentRunner.xctrunner';
  
  // Check if WDA is already installed (skip if forceInstall)
  if (!forceInstall) {
    try {
      const installed = execSync(`ideviceinstaller -u ${udid} list | grep ${wdaBundleId}`, { encoding: 'utf-8', stdio: 'pipe' });
      if (installed.includes(wdaBundleId)) {
        console.log('WebDriverAgent already installed on device.');
        return;
      }
    } catch {}
  }
  
  // Check if WDA is built (skip check if forceBuild)
  let wdaAppPath: string = '';
  if (!forceBuild) {
    try {
      wdaAppPath = execSync(
        `ls -d ${process.env.HOME}/Library/Developer/Xcode/DerivedData/WebDriverAgent-*/Build/Products/Debug-iphoneos/WebDriverAgentRunner-Runner.app 2>/dev/null | head -1`,
        { encoding: 'utf-8', shell: '/bin/bash' }
      ).trim();
    } catch {
      wdaAppPath = '';
    }
  }
  
  // Build if not found or forceBuild
  if (!wdaAppPath || forceBuild) {
    wdaAppPath = buildWDA(udid, teamId);
  }
  
  // Install WDA
  console.log('Installing WebDriverAgent on device...');
  execSync(`ideviceinstaller -u ${udid} install "${wdaAppPath}"`, { stdio: 'inherit' });
  console.log('WebDriverAgent installed.');
}
