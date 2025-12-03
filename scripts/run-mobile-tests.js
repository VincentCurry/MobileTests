/**
 * Run mobile tests with automatic Appium server management
 * Usage: node scripts/run-mobile-tests.js @merchant
 */

const { spawn, execSync } = require('child_process');
const http = require('http');

// Get grep tag from command line
const grepTag = process.argv[2] || '@mobile';

// Set environment
const androidHome = process.env.LOCALAPPDATA + '\\Android\\Sdk';
process.env.ANDROID_HOME = androidHome;
process.env.MOBILE = 'true';

// Check if Appium is responding
function isAppiumRunning() {
  return new Promise((resolve) => {
    const req = http.request({
      host: '127.0.0.1',
      port: 4723,
      path: '/wd/hub/status',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

// Start Appium server
function startAppium() {
  return new Promise((resolve, reject) => {
    console.log('Starting Appium server...');
    
    const appium = spawn('appium', ['-a', '127.0.0.1', '-p', '4723', '--base-path', '/wd/hub'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      env: { ...process.env, ANDROID_HOME: androidHome }
    });

    let started = false;
    let output = '';

    appium.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data); // Show Appium output
      if (output.includes('listener started') && !started) {
        started = true;
        console.log('\n✓ Appium server ready on http://127.0.0.1:4723/wd/hub\n');
        resolve(appium);
      }
    });

    appium.stderr.on('data', (data) => {
      output += data.toString();
      if (output.includes('EADDRINUSE')) {
        console.log('Port 4723 in use, killing and retrying...');
        appium.kill();
        resolve(null);
      }
    });

    appium.on('error', (err) => {
      reject(new Error(`Failed to start Appium: ${err.message}`));
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!started) {
        appium.kill();
        reject(new Error('Appium server failed to start within 30 seconds'));
      }
    }, 30000);
  });
}

// Run CodeceptJS tests
function runTests(grepTag) {
  return new Promise((resolve) => {
    console.log(`\nRunning tests with grep: ${grepTag}\n`);
    
    const codecept = spawn('npx', ['codeceptjs', 'run', '--steps', '--grep', grepTag], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, MOBILE: 'true', ANDROID_HOME: androidHome }
    });

    codecept.on('close', (code) => {
      resolve(code);
    });
  });
}

// Main
async function main() {
  let appiumProcess = null;
  
  try {
    // Check if Appium is already running
    const running = await isAppiumRunning();
    if (running) {
      console.log('✓ Appium already running on port 4723');
    } else {
      appiumProcess = await startAppium();
      // Give it a moment to fully initialize
      await new Promise(r => setTimeout(r, 2000));
    }

    // Run tests
    const exitCode = await runTests(grepTag);

    // Cleanup
    if (appiumProcess) {
      console.log('\nStopping Appium server...');
      appiumProcess.kill();
    }

    process.exit(exitCode);
  } catch (error) {
    console.error('Error:', error.message);
    if (appiumProcess) {
      appiumProcess.kill();
    }
    process.exit(1);
  }
}

main();
