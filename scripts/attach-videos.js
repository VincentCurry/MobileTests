const fs = require('fs');
const path = require('path');

console.log('\nAttaching videos to Allure report...\n');

const videosDir = path.join(process.cwd(), 'output', 'videos');
const allureResultsDir = path.join(process.cwd(), 'output', 'allure-results');

// Check if videos directory exists
if (!fs.existsSync(videosDir)) {
  console.log('No videos directory found - skipping');
  process.exit(0);
}

// Check if allure-results exists
if (!fs.existsSync(allureResultsDir)) {
  console.log('No allure-results directory found - skipping');
  process.exit(0);
}

// Get all video files
const videoFiles = fs.readdirSync(videosDir).filter(file => file.endsWith('.webm'));

if (videoFiles.length === 0) {
  console.log('No video files found');
  process.exit(0);
}

// Get all test result JSON files
const resultFiles = fs.readdirSync(allureResultsDir).filter(file => file.endsWith('-result.json'));

let attachedCount = 0;

// Process each test result
resultFiles.forEach((resultFile) => {
  const resultPath = path.join(allureResultsDir, resultFile);
  
  try {
    const resultData = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
    const testName = resultData.name || '';
    
    // Extract scenario name without tags and parameters for better matching
    const scenarioName = testName
      .replace(/@\w+/g, '') // Remove tags like @search @quality
      .replace(/\{[^}]+\}/g, '') // Remove parameters like {"keyword":"sunset"}
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_+/g, '_') // Collapse multiple underscores
      .replace(/^_|_$/g, '') // Trim underscores
      .toLowerCase();
    
    // Find matching video - video filename contains scenario name
    const matchingVideo = videoFiles.find(videoFile => {
      const videoName = videoFile.toLowerCase();
      // Extract the scenario part from video filename (after UUID, before .passed/.failed.webm)
      const videoScenario = videoName
        .replace(/^[a-f0-9-]+_/, '') // Remove UUID prefix
        .replace(/\.(passed|failed)\.webm$/, '') // Remove .passed.webm or .failed.webm
        .replace(/@\w+/g, '') // Remove tags
        .replace(/\{[^}]+\}/g, '') // Remove parameters
        .replace(/_+/g, '_') // Collapse underscores
        .replace(/^_|_$/g, ''); // Trim underscores
      
      // Check if the core scenario names match
      return videoScenario.includes(scenarioName) || scenarioName.includes(videoScenario);
    });
    
    if (matchingVideo) {
      // Copy video to allure-results
      const sourcePath = path.join(videosDir, matchingVideo);
      const destPath = path.join(allureResultsDir, matchingVideo);
      fs.copyFileSync(sourcePath, destPath);
      
      // Add attachment to test result (remove existing video attachments first to avoid duplicates)
      if (!resultData.attachments) {
        resultData.attachments = [];
      }
      
      // Remove any existing video attachments
      resultData.attachments = resultData.attachments.filter(att => att.type !== 'video/webm');
      
      resultData.attachments.push({
        name: 'Video Recording',
        source: matchingVideo,
        type: 'video/webm'
      });
      
      // Write updated result back
      fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 2));
      
      attachedCount++;
      const displayName = testName.length > 60 ? testName.substring(0, 60) + '...' : testName;
      console.log(`  + ${displayName}`);
    } else {
      console.log(`  - No video for: ${testName.substring(0, 50)}...`);
    }
  } catch (error) {
    console.log(`  ! Error: ${resultFile}: ${error.message}`);
  }
});

console.log(`\nAttached ${attachedCount} video(s) to Allure report`);
console.log(`   ${videoFiles.length} video(s) found, ${resultFiles.length} test(s) processed`);
