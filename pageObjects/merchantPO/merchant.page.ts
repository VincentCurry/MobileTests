/// <reference path="../../global.d.ts" />
import * as dotenv from 'dotenv';
import { MERCHANT_LOCATORS } from './merchant.locators';
import { extractTextFromScreenshot, verifyTextInScreenshot, decodeQRFromImage, compareQRCodes } from './merchant.utils';
import { AppPage } from '../common/app.page';

dotenv.config();

const { I } = inject();

let capturedBusinessName: string = '';
let capturedQRData: string | null = null;

async function dismissSamsungPassIfPresent() {
  try {
    const cancelButton = await I.grabNumberOfVisibleElements(MERCHANT_LOCATORS.samsungPassCancel);
    if (cancelButton > 0) {
      console.log('Samsung Pass popup detected - dismissing');
      const dontAskCheckbox = await I.grabNumberOfVisibleElements(MERCHANT_LOCATORS.samsungPassDontAsk);
      if (dontAskCheckbox > 0) {
        await I.click(MERCHANT_LOCATORS.samsungPassDontAsk);
      }
      await I.click(MERCHANT_LOCATORS.samsungPassCancel);
      console.log('Samsung Pass popup dismissed');
    } else {
      console.log('No Samsung Pass popup - continuing');
    }
  } catch {
    console.log('No Samsung Pass popup - continuing');
  }
}

export const MerchantPage = {
  async login() {
    const email = process.env.MERCHANT_EMAIL;
    const password = process.env.MERCHANT_PASSWORD;
    
    if (!email || !password) {
      throw new Error('MERCHANT_EMAIL and MERCHANT_PASSWORD must be set in .env file');
    }

    await I.waitForElement(MERCHANT_LOCATORS.loginContainer, 10);
    await I.fillField(MERCHANT_LOCATORS.emailField, email);
    await dismissSamsungPassIfPresent();
    await I.fillField(MERCHANT_LOCATORS.passwordField, password);
    await dismissSamsungPassIfPresent();
    await I.click(MERCHANT_LOCATORS.loginButton);
    await I.wait(10);
    await dismissSamsungPassIfPresent();
    await I.waitForElement(MERCHANT_LOCATORS.loggedInBusinessIcon, 30);
  },

  async enableQrLockScreen() {
    await I.waitForElement(MERCHANT_LOCATORS.loggedInBusinessIcon, 15);
    await I.click(MERCHANT_LOCATORS.moreOptionsButton);
    await I.waitForElement(MERCHANT_LOCATORS.settingsMenuItem, 5);
    await I.click(MERCHANT_LOCATORS.settingsMenuItem);
    await I.waitForElement(MERCHANT_LOCATORS.settingsTitle, 5);
    await I.click(MERCHANT_LOCATORS.qrLockScreenSwitch);
    await I.waitForElement(MERCHANT_LOCATORS.closeSettingsButton, 5);
    await I.click(MERCHANT_LOCATORS.closeSettingsButton);
    await I.waitForElement(MERCHANT_LOCATORS.generateScanCodeButton, 10);
  },

  async generateScanCode(stamps: string = '2') {
    await I.waitForElement(MERCHANT_LOCATORS.instructionsContainer, 10);
    await I.fillField(MERCHANT_LOCATORS.numberOfStampsField, stamps);
    await I.click(MERCHANT_LOCATORS.instructionsContainer);
    await I.wait(1);
    await I.click(MERCHANT_LOCATORS.generateScanCodeButton);
    await I.waitForElement(MERCHANT_LOCATORS.qrCodeImage, 10);
    await I.wait(3);
    
    const appScreenshot = await AppPage.takeScreenshot('app_qr_screen');
    console.log(`App QR screen saved: ${appScreenshot}`);
    
    capturedQRData = await decodeQRFromImage(appScreenshot);
    if (!capturedQRData) {
      throw new Error('QR decode failed: Could not decode QR code from app screenshot');
    }
    console.log(`App QR data: ${capturedQRData}`);
    
    // Extract business name from the QR screen using OCR
    // The business name appears on the screen - we capture it dynamically
    const ocrResult = await extractTextFromScreenshot(appScreenshot);
    if (!ocrResult) {
      throw new Error('OCR failed: Could not extract any text from app screenshot');
    }
    
    // Business name is typically displayed prominently - extract meaningful words
    // Filter out common UI text and keep business-relevant words
    const excludeWords = ['scan', 'code', 'qr', 'stamps', 'number', 'merchant', 'app', 'loyalty', 'point', 'voucher', 'redeem', 'give'];
    const words = ocrResult.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2 && !excludeWords.includes(w) && /^[a-z]+$/.test(w));
    
    // Take first few meaningful words as business name (typically 2-3 words)
    capturedBusinessName = words.slice(0, 3).join(' ');
    if (!capturedBusinessName) {
      throw new Error('OCR failed: Could not identify business name from app screenshot');
    }
    console.log(`Business name from app (OCR): ${capturedBusinessName}`);
  },

  async verifyLoggedIn() {
    await I.waitForElement(MERCHANT_LOCATORS.loggedInBusinessIcon, 5);
  },

  async verifyLockScreenContent() {
    await AppPage.lockScreen();
    await I.wait(1);
    await AppPage.wakeScreen();
    await I.wait(2);
    
    const screenshotPath = await AppPage.takeScreenshot('lock_screen_qr');
    console.log(`Lock screen screenshot saved: ${screenshotPath}`);
    
    const wordsToFind = capturedBusinessName.toLowerCase().split(' ').filter(w => w.length > 2);
    console.log(`Looking for business name words: ${wordsToFind.join(', ')}`);
    
    const { found, notFound } = await verifyTextInScreenshot(screenshotPath, wordsToFind);
    
    console.log(`OCR found: ${found.join(', ') || 'none'}`);
    console.log(`OCR not found: ${notFound.join(', ') || 'none'}`);
    
    if (found.length === 0) {
      throw new Error(`Lock screen verification failed. Business name "${capturedBusinessName}" not found.`);
    }
    console.log(`Business name verification passed - found: ${found.join(', ')}`);
    
    const lockScreenQRData = await decodeQRFromImage(screenshotPath);
    if (!lockScreenQRData) {
      throw new Error('QR decode failed: Could not decode QR code from lock screen screenshot');
    }
    console.log(`Lock screen QR data: ${lockScreenQRData}`);
    
    const qrComparison = compareQRCodes(capturedQRData, lockScreenQRData);
    console.log(`QR comparison - App: ${qrComparison.qr1Data?.substring(0, 50)}`);
    console.log(`QR comparison - Lock: ${qrComparison.qr2Data?.substring(0, 50)}`);
    console.log(`QR match: ${qrComparison.match}`);
    
    if (!qrComparison.match) {
      throw new Error(`QR code mismatch! App QR: ${capturedQRData} vs Lock screen QR: ${lockScreenQRData}`);
    }
    console.log('QR code verification passed - both QR codes match!');
  }
};
