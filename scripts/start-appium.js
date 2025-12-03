/**
 * Start Appium server and display Appium Inspector configuration
 */

const { spawn, execSync } = require('child_process');
const path = require('path');

// Set ANDROID_HOME
const androidHome = process.env.LOCALAPPDATA + '\\Android\\Sdk';
process.env.ANDROID_HOME = androidHome;

// Get connected device
let deviceUdid = '';
let deviceName = 'Android Device';
try {
  const devices = execSync('adb devices', { encoding: 'utf-8' });
  const lines = devices.split('\n').filter(l => l.includes('\tdevice'));
  if (lines.length > 0) {
    deviceUdid = lines[0].split('\t')[0];
    try {
      deviceName = execSync(`adb -s ${deviceUdid} shell getprop ro.product.model`, { encoding: 'utf-8' }).trim();
    } catch {}
  }
} catch {}

// App configurations
const apps = {
  'merchant': {
    package: 'com.receiptsandrewards.merchant.dev',
    apk: path.join(process.cwd(), 'apps', 'android', 'app-develop-bitrise-mechant-signed.apk')
  },
  'consumer': {
    package: 'com.receiptsandrewards.dev',
    apk: path.join(process.cwd(), 'apps', 'android', 'app-develop-bitrise-signed.apk')
  }
};

console.log('');
console.log('='.repeat(60));
console.log('  APPIUM INSPECTOR CONFIGURATION');
console.log('='.repeat(60));
console.log('');
console.log('Server Settings (Remote Server tab):');
console.log('─'.repeat(40));
console.log(JSON.stringify({
  "Remote Host": "127.0.0.1",
  "Remote Port": "4723",
  "Remote Path": ""
}, null, 2));
console.log('');

console.log('─'.repeat(60));
console.log('  MERCHANT APP - Capabilities:');
console.log('─'.repeat(60));
console.log(JSON.stringify({
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": deviceName,
  "appium:udid": deviceUdid,
  "appium:appPackage": apps.merchant.package,
  "appium:noReset": true
}, null, 2));
console.log('');

console.log('─'.repeat(60));
console.log('  CONSUMER APP - Capabilities:');
console.log('─'.repeat(60));
console.log(JSON.stringify({
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": deviceName,
  "appium:udid": deviceUdid,
  "appium:appPackage": apps.consumer.package,
  "appium:noReset": true
}, null, 2));
console.log('');
console.log('='.repeat(60));
console.log('');

// Start Appium
console.log('Starting Appium server on http://127.0.0.1:4723 ...');
console.log('');

const appium = spawn('appium', ['-a', '127.0.0.1', '-p', '4723', '--base-path=/wd/hub'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, ANDROID_HOME: androidHome }
});

appium.on('error', (err) => {
  console.error('Failed to start Appium:', err.message);
});
