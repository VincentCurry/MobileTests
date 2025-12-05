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
