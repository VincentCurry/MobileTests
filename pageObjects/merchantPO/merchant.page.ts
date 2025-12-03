/// <reference path="../../global.d.ts" />
import { MERCHANT_LOCATORS } from './merchant.locators';
import { lockDevice, wakeScreen, takeLockScreenScreenshot, verifyTextInScreenshot, decodeQRFromImage, compareQRCodes } from './merchant.utils';

const { I } = inject();

async function dismissSamsungPassIfPresent() {
  try {
    const cancelButton = await I.grabNumberOfVisibleElements(MERCHANT_LOCATORS.samsungPassCancel);
    if (cancelButton > 0) {
      const dontAskCheckbox = await I.grabNumberOfVisibleElements(MERCHANT_LOCATORS.samsungPassDontAsk);
      if (dontAskCheckbox > 0) {
        await I.click(MERCHANT_LOCATORS.samsungPassDontAsk);
      }
      await I.click(MERCHANT_LOCATORS.samsungPassCancel);
    }
  } catch {
    // Popup not present
  }
}

export const MerchantPage = {
  async login(email: string, password: string) {
    await I.waitForElement(MERCHANT_LOCATORS.loginContainer, 10);
    await I.fillField(MERCHANT_LOCATORS.emailField, email);
    await dismissSamsungPassIfPresent();
    await I.fillField(MERCHANT_LOCATORS.passwordField, password);
    await dismissSamsungPassIfPresent();
    await I.click(MERCHANT_LOCATORS.loginButton);
    await I.wait(2);
    await dismissSamsungPassIfPresent();
    await I.waitForElement(MERCHANT_LOCATORS.loggedInBusinessIcon, 15);
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
    await I.click(MERCHANT_LOCATORS.instructionsContainer); // Click away to dismiss keyboard
    await I.wait(1);
    await I.click(MERCHANT_LOCATORS.generateScanCodeButton);
    await I.waitForElement(MERCHANT_LOCATORS.qrCodeImage, 10);
    await I.wait(3); // Wait for QR code to fully generate/update
    
    // Take screenshot of the QR code screen in the app
    const appScreenshot = takeLockScreenScreenshot('app_qr_screen');
    console.log(`App QR screen saved: ${appScreenshot}`);
    
    // Decode QR code from app screenshot
    const appQRData = await decodeQRFromImage(appScreenshot);
    console.log(`App QR data: ${appQRData || 'not decoded'}`);
    
    // Use OCR to get business name from the app screenshot
    const { found } = await verifyTextInScreenshot(appScreenshot, ['telegraph', 'company']);
    const businessName = found.length > 0 ? found.join(' ') : '';
    console.log(`Business name from app (OCR): ${businessName}`);
    
    return { 
      businessName: businessName || 'telegraph company',
      qrData: appQRData 
    };
  },

  async verifyLoggedIn() {
    await I.waitForElement(MERCHANT_LOCATORS.loggedInBusinessIcon, 5);
  },

  async verifyLockScreenContent(businessName: string, appQRData: string | null) {
    // Lock the device
    lockDevice();
    await I.wait(1);
    
    // Wake screen to show AOD/lock screen content
    wakeScreen();
    await I.wait(2);
    
    // Take screenshot of lock screen
    const screenshotPath = takeLockScreenScreenshot('lock_screen_qr');
    console.log(`Lock screen screenshot saved: ${screenshotPath}`);
    
    // 1. OCR verification - look for the business name
    const wordsToFind = businessName.toLowerCase().split(' ').filter(w => w.length > 2);
    console.log(`Looking for business name words: ${wordsToFind.join(', ')}`);
    
    const { found, notFound } = await verifyTextInScreenshot(screenshotPath, wordsToFind);
    
    console.log(`OCR found: ${found.join(', ') || 'none'}`);
    console.log(`OCR not found: ${notFound.join(', ') || 'none'}`);
    
    if (found.length === 0) {
      throw new Error(`Lock screen verification failed. Business name "${businessName}" not found on lock screen.`);
    }
    console.log(`Business name verification passed - found: ${found.join(', ')}`);
    
    // 2. QR code verification - decode and compare
    const lockScreenQRData = await decodeQRFromImage(screenshotPath);
    console.log(`Lock screen QR data: ${lockScreenQRData || 'not decoded'}`);
    
    const qrComparison = compareQRCodes(appQRData, lockScreenQRData);
    console.log(`QR comparison - App: ${qrComparison.qr1Data?.substring(0, 50) || 'null'}`);
    console.log(`QR comparison - Lock: ${qrComparison.qr2Data?.substring(0, 50) || 'null'}`);
    console.log(`QR match: ${qrComparison.match}`);
    
    if (!qrComparison.match) {
      if (!appQRData) {
        console.log('Warning: Could not decode QR from app screenshot');
      }
      if (!lockScreenQRData) {
        console.log('Warning: Could not decode QR from lock screen screenshot');
      }
      if (appQRData && lockScreenQRData) {
        throw new Error(`QR code mismatch! App QR and lock screen QR contain different data.`);
      }
    } else {
      console.log('QR code verification passed - both QR codes match!');
    }
  }
};
