/**
 * Start Appium in separate CMD window, then run tests
 */
const { execSync, spawnSync } = require('child_process');

const grepTag = process.argv[2] || '@debug';

// Start Appium in a NEW separate CMD window that stays open
console.log('Opening Appium in separate window...');
execSync('start "Appium Server" cmd /k "appium -p 4723 --base-path=/wd/hub -a 127.0.0.1"', { 
  shell: 'cmd.exe',
  stdio: 'ignore'
});

// Wait for Appium
console.log('Waiting 8 seconds for Appium to start...\n');
execSync('ping -n 9 127.0.0.1', { stdio: 'ignore' });

// Run tests in this terminal
console.log(`Running tests: ${grepTag}\n`);
const result = spawnSync('npx', ['codeceptjs', 'run', '--steps', '--grep', grepTag], {
  stdio: 'inherit',
  shell: true,
  env: { 
    ...process.env, 
    MOBILE: 'true', 
    ANDROID_HOME: process.env.LOCALAPPDATA + '\\Android\\Sdk' 
  }
});

process.exit(result.status || 0);
