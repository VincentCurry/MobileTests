export const LOCK_SCREEN_LOCATORS = {
  aodContainer: { id: 'com.samsung.android.app.aodservice:id/keyguard_container' },
  qrCode: '//android.widget.ImageView[contains(@resource-id, "aodservice")]',
  businessName: '//android.widget.TextView[contains(@text, "Company") or contains(@text, "Tom")]'
};

export const MERCHANT_LOCATORS = {
  loginContainer: '//android.view.ViewGroup[@resource-id="com.receiptsandrewards.merchant.dev:id/container"]',
  emailField: '//android.widget.EditText[@text="Email"]',
  passwordField: '//android.widget.EditText[@text="Password"]',
  loginButton: '//android.widget.Button[@resource-id="com.receiptsandrewards.merchant.dev:id/login"]',
  loggedInBusinessIcon: '//android.widget.ImageView[@content-desc="Logged in business icon"]',
  moreOptionsButton: '//android.widget.ImageView[@content-desc="More options"]',
  instructionsContainer: { id: 'com.receiptsandrewards.merchant.dev:id/instructions' },
  numberOfStampsField: '//android.widget.EditText[@text="Number of Stamps"]',
  generateScanCodeButton: { id: 'com.receiptsandrewards.merchant.dev:id/btnGenerateScanCode' },
  // QR code screen elements
  qrCodeImage: { id: 'com.receiptsandrewards.merchant.dev:id/qrCodeView' },
  businessNameText: { id: 'com.receiptsandrewards.merchant.dev:id/businessIcon' },
  settingsMenuItem: '//android.widget.TextView[@resource-id="com.receiptsandrewards.merchant.dev:id/title" and @text="Settings"]',
  settingsTitle: '//android.widget.TextView[@text="Settings"]',
  qrLockScreenSwitch: { id: 'com.receiptsandrewards.merchant.dev:id/switch_qr_lock_screen' },
  closeSettingsButton: { id: 'com.receiptsandrewards.merchant.dev:id/btn_close' },
  samsungPassCancel: '//android.widget.Button[@text="Cancel"]',
  samsungPassDontAsk: '//*[contains(@text,"Don\'t ask again")]'
};
