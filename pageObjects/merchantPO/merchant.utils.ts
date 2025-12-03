import { execSync } from 'child_process';
import { APP_CONFIG } from '../../config/app.config';
import Tesseract from 'tesseract.js';
import jsQR from 'jsqr';
import sharp from 'sharp';

const ADB = process.env.ANDROID_HOME 
  ? `${process.env.ANDROID_HOME}\\platform-tools\\adb.exe`
  : 'adb';

let currentPackage: string = APP_CONFIG['receipts-rewards'].android.packageIdentifier;

export function resetApp(packageName: string) {
  console.log(`Resetting app: ${packageName}...`);
  try {
    execSync(`${ADB} shell am force-stop ${packageName}`, { stdio: 'ignore' });
    execSync(`${ADB} shell pm clear ${packageName}`, { stdio: 'ignore' });
    execSync(`${ADB} shell monkey -p ${packageName} 1`, { stdio: 'ignore' });
    console.log('App reset complete');
  } catch {
    console.log('Warning: Could not reset app');
  }
}

export function setCurrentPackage(packageName: string) {
  currentPackage = packageName;
}

export function getCurrentPackage() {
  return currentPackage;
}

export function isAppInstalled(packageName: string): boolean {
  const packages = execSync(`${ADB} shell pm list packages`, { encoding: 'utf-8' });
  return packages.includes(packageName);
}

export function launchApp(packageName: string) {
  execSync(`${ADB} shell monkey -p ${packageName} 1`);
}

export function isAppInForeground(packageName: string): boolean {
  const activity = execSync(`${ADB} shell dumpsys activity activities | findstr ${packageName}`, { encoding: 'utf-8' });
  return activity.includes(packageName);
}

export function getAppConfig(appName: string) {
  const appConfig = APP_CONFIG[appName];
  if (!appConfig) {
    throw new Error(`Unknown app: ${appName}. Available: ${Object.keys(APP_CONFIG).join(', ')}`);
  }
  return appConfig;
}

export function lockDevice() {
  execSync(`${ADB} shell input keyevent 26`, { stdio: 'ignore' }); // Power button to lock
}

export function wakeScreen() {
  // Wake screen without unlocking - tap or power button
  execSync(`${ADB} shell input keyevent 26`, { stdio: 'ignore' }); // Power button to wake
}

export function unlockDevice() {
  execSync(`${ADB} shell input keyevent 26`, { stdio: 'ignore' }); // Wake
  execSync(`${ADB} shell input swipe 500 1500 500 500`, { stdio: 'ignore' }); // Swipe up
}

export function takeLockScreenScreenshot(filename: string): string {
  const path = `/sdcard/${filename}.png`;
  execSync(`${ADB} shell screencap -p ${path}`, { stdio: 'ignore' });
  execSync(`${ADB} pull ${path} ./output/${filename}.png`, { stdio: 'ignore' });
  return `./output/${filename}.png`;
}

export function getLockScreenDump(): string {
  // Dump UI hierarchy from lock screen
  try {
    const dump = execSync(`${ADB} shell uiautomator dump /sdcard/lockscreen.xml && ${ADB} shell cat /sdcard/lockscreen.xml`, { encoding: 'utf-8' });
    return dump;
  } catch {
    return '';
  }
}

export async function verifyTextInScreenshot(imagePath: string, expectedTexts: string[]): Promise<{ found: string[], notFound: string[] }> {
  console.log(`Running OCR on: ${imagePath}`);
  
  const result = await Tesseract.recognize(imagePath, 'eng', {
    logger: () => {} // Suppress progress logs
  });
  
  const recognizedText = result.data.text.toLowerCase();
  console.log(`OCR recognized text: ${recognizedText.substring(0, 200)}...`);
  
  const found: string[] = [];
  const notFound: string[] = [];
  
  for (const text of expectedTexts) {
    if (recognizedText.includes(text.toLowerCase())) {
      found.push(text);
    } else {
      notFound.push(text);
    }
  }
  
  return { found, notFound };
}

export async function decodeQRFromImage(imagePath: string): Promise<string | null> {
  console.log(`Decoding QR from: ${imagePath}`);
  
  try {
    // Load image and convert to raw pixel data
    const image = sharp(imagePath);
    const { data, info } = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    // Decode QR code
    const qrCode = jsQR(new Uint8ClampedArray(data), info.width, info.height);
    
    if (qrCode) {
      console.log(`QR decoded: ${qrCode.data.substring(0, 100)}...`);
      return qrCode.data;
    } else {
      console.log('No QR code found in image');
      return null;
    }
  } catch (error) {
    console.log(`QR decode error: ${error}`);
    return null;
  }
}

export function compareQRCodes(qr1: string | null, qr2: string | null): { match: boolean, qr1Data: string | null, qr2Data: string | null } {
  const match = qr1 !== null && qr2 !== null && qr1 === qr2;
  return { match, qr1Data: qr1, qr2Data: qr2 };
}
