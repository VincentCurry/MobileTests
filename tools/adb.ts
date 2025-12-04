import { execSync } from 'child_process';

const ADB = process.env.ANDROID_HOME 
  ? `${process.env.ANDROID_HOME}\\platform-tools\\adb.exe`
  : 'adb';

export function isAppInstalled(packageName: string): boolean {
  const packages = execSync(`${ADB} shell pm list packages`, { encoding: 'utf-8' });
  return packages.includes(packageName);
}

export function isAppInForeground(packageName: string): boolean {
  const activity = execSync(`${ADB} shell dumpsys activity activities | findstr ${packageName}`, { encoding: 'utf-8' });
  return activity.includes(packageName);
}

export function launchApp(packageName: string): void {
  execSync(`${ADB} shell monkey -p ${packageName} 1`);
}

export function closeApp(packageName: string): void {
  execSync(`${ADB} shell am force-stop ${packageName}`, { stdio: 'ignore' });
}

export function clearAppData(packageName: string): void {
  execSync(`${ADB} shell pm clear ${packageName}`, { stdio: 'ignore' });
}

export function resetApp(packageName: string): void {
  console.log(`Resetting app: ${packageName}...`);
  closeApp(packageName);
  clearAppData(packageName);
  launchApp(packageName);
  console.log('App reset complete');
}

export function lockDevice(): void {
  execSync(`${ADB} shell input keyevent 26`, { stdio: 'ignore' });
}

export function wakeScreen(): void {
  execSync(`${ADB} shell input keyevent 26`, { stdio: 'ignore' });
}

export function unlockDevice(): void {
  execSync(`${ADB} shell input keyevent 26`, { stdio: 'ignore' });
  execSync(`${ADB} shell input swipe 500 1500 500 500`, { stdio: 'ignore' });
}

export function takeScreenshot(filename: string): string {
  const devicePath = `/sdcard/${filename}.png`;
  const localPath = `./output/${filename}.png`;
  execSync(`${ADB} shell screencap -p ${devicePath}`, { stdio: 'ignore' });
  execSync(`${ADB} pull ${devicePath} ${localPath}`, { stdio: 'ignore' });
  return localPath;
}

export function runKeyEvent(keyEventNumber: number): void {
  execSync(`${ADB} shell input keyevent ${keyEventNumber}`, { stdio: 'ignore' });
}

export function tapScreen(x: number, y: number): void {
  execSync(`${ADB} shell input tap ${x} ${y}`, { stdio: 'ignore' });
}

export function swipe(x1: number, y1: number, x2: number, y2: number): void {
  execSync(`${ADB} shell input swipe ${x1} ${y1} ${x2} ${y2}`, { stdio: 'ignore' });
}
