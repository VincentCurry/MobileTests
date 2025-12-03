const fs = require('fs');
const path = require('path');

console.log('🧹 Cleaning old test results and videos...\n');

const dirs = [
  path.join(process.cwd(), 'output', 'allure-results'),
  path.join(process.cwd(), 'output', 'videos')
];

dirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`  ✓ Removed ${path.basename(dir)}`);
  } else {
    console.log(`  - ${path.basename(dir)} (already clean)`);
  }
});

console.log('\n✨ Ready for fresh test run!\n');
