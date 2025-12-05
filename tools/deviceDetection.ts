import { execSync } from 'child_process';

export interface Device {
  udid: string;
  deviceName: string;
  platformName: 'android' | 'ios';
  platformVersion: string;
  manufacturer: string;
}

/**
 * Get connected Android devices using adb
 */
export function getConnectedAndroidDevices(): Device[] {
  try {
    const stdout = execSync('adb devices', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    const lines = stdout.split('\n').slice(1);
    const devices: Device[] = [];

    for (const line of lines) {
      const [udid, status] = line.split('\t');
      if (status?.trim() === 'device' && udid) {
        const platformVersion = execSync(`adb -s ${udid} shell getprop ro.build.version.release`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        const deviceName = execSync(`adb -s ${udid} shell getprop ro.product.model`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        const manufacturer = execSync(`adb -s ${udid} shell getprop ro.product.manufacturer`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
        
        devices.push({
          udid,
          deviceName: deviceName || 'Unknown',
          platformName: 'android',
          platformVersion: platformVersion || 'Unknown',
          manufacturer: manufacturer || 'Unknown'
        });
      }
    }
    return devices;
  } catch {
    console.log('No Android devices found or adb not available');
    return [];
  }
}

/**
 * Get connected iOS devices using xcrun xctrace (most reliable on modern macOS)
 */
export function getConnectedIOSDevices(): Device[] {
  try {
    // Use xcrun xctrace list devices - works on all modern macOS
    const stdout = execSync('xcrun xctrace list devices 2>&1', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    const lines = stdout.split('\n');
    const devices: Device[] = [];
    
    for (const line of lines) {
      // Match real devices: "iPhone (18.4.1) (00008120-001609042E7B601E)"
      // Skip simulators which have "Simulator" in the name
      const match = line.match(/^(.+?)\s+\((\d+\.\d+(?:\.\d+)?)\)\s+\(([A-F0-9-]+)\)$/i);
      if (match && !line.includes('Simulator')) {
        devices.push({
          udid: match[3],
          deviceName: match[1].trim(),
          platformName: 'ios',
          platformVersion: match[2],
          manufacturer: 'Apple'
        });
      }
    }
    
    return devices;
  } catch {
    // Fallback: try idevice_id (libimobiledevice)
    try {
      const stdout = execSync('idevice_id --list', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
      const udids = stdout.trim().split('\n').filter(u => u.length > 0);
      
      return udids.map(udid => ({
        udid,
        deviceName: 'iPhone',
        platformName: 'ios' as const,
        platformVersion: 'Unknown',
        manufacturer: 'Apple'
      }));
    } catch {
      console.log('No iOS devices found');
      return [];
    }
  }
}

/**
 * Get the first connected device for the specified platform
 */
export function getFirstConnectedDevice(platform: 'android' | 'ios'): Device | null {
  if (platform === 'android') {
    const devices = getConnectedAndroidDevices();
    return devices.length > 0 ? devices[0] : null;
  } else {
    const devices = getConnectedIOSDevices();
    return devices.length > 0 ? devices[0] : null;
  }
}

/**
 * Get all connected devices across platforms
 */
export function getAllConnectedDevices(): Device[] {
  return [...getConnectedAndroidDevices(), ...getConnectedIOSDevices()];
}
