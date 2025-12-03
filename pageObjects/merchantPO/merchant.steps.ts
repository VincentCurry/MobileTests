/// <reference path="../../global.d.ts" />
import { MerchantPage } from './merchant.page';
import { 
  getAppConfig, 
  setCurrentPackage, 
  getCurrentPackage, 
  isAppInstalled, 
  resetApp, 
  launchApp, 
  isAppInForeground 
} from './merchant.utils';
import * as dotenv from 'dotenv';

dotenv.config();

// Store data between steps
let capturedBusinessName: string = '';
let capturedQRData: string | null = null;

Given('the {string} app is installed on device', async (appName: string) => {
  const appConfig = getAppConfig(appName);
  const packageName = appConfig.android.packageIdentifier;
  setCurrentPackage(packageName);
  
  if (!isAppInstalled(packageName)) {
    throw new Error(`App ${packageName} not installed`);
  }
  
  resetApp(packageName);
});

Given('the app is installed on device', async () => {
  const packageName = getCurrentPackage();
  if (!isAppInstalled(packageName)) {
    throw new Error(`App ${packageName} not installed`);
  }
});

When('I launch the app', async () => {
  launchApp(getCurrentPackage());
});

Then('the app should be visible', async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  if (!isAppInForeground(getCurrentPackage())) {
    throw new Error('App not in foreground');
  }
});

Then('I wait for {int} seconds', async (seconds: number) => {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
});

Given('I am a merchant logged into the merchant app', async () => {
  const email = process.env.MERCHANT_EMAIL;
  const password = process.env.MERCHANT_PASSWORD;
  
  if (!email || !password) {
    throw new Error('MERCHANT_EMAIL and MERCHANT_PASSWORD must be set in .env file');
  }
  
  await MerchantPage.login(email, password);
});

Given('I have switched on updating scan codes in the settings', async () => {
  await MerchantPage.enableQrLockScreen();
});

When('I generate a scan code in the app', async () => {
  const result = await MerchantPage.generateScanCode('2');
  capturedBusinessName = result.businessName;
  capturedQRData = result.qrData;
});

Then('this scan code and the business icon is written to the lock screen', async () => {
  await MerchantPage.verifyLockScreenContent(capturedBusinessName, capturedQRData);
});
