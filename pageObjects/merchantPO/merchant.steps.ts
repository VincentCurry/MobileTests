/// <reference path="../../global.d.ts" />
import { MerchantPage } from './merchant.page';
import { AppPage } from '../common/app.page';

const { I } = inject();

Given('the {string} app is installed on device', async (appName: string) => {
  await AppPage.setupApp(appName);
});

When('I launch the app', async () => {
  await AppPage.launchApp();
});

Then('the app should be visible', async () => {
  await AppPage.verifyAppVisible();
});

Then('I wait for {int} seconds', async (seconds: number) => {
  await I.wait(seconds);
});

Given('I am a merchant logged into the merchant app', async () => {
  await MerchantPage.login();
});

Given('I have switched on updating scan codes in the settings', async () => {
  await MerchantPage.enableQrLockScreen();
});

When('I generate a scan code in the app', async () => {
  await MerchantPage.generateScanCode();
});

Then('this scan code and the business icon is written to the lock screen', async () => {
  await MerchantPage.verifyLockScreenContent();
});
