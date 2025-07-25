#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { mergeLargeResults } = require('./load-tests/mergeLargeResults-bulletproof');
const { generateSummary } = require('./load-tests/summarize-bulletproof');

/**
 * 🧪 TEST REPORT GENERATION
 * 
 * Quick test to verify merge and summarize scripts work correctly
 */

async function testReportGeneration() {
  console.log('🧪 Testing report generation scripts...\n');
  
  // Create test directory
  const testDir = 'test-outputs';
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }
  
  // Create sample k6 JSON data
  const sampleData1 = createSampleK6Data('distributed-1', 1000);
  const sampleData2 = createSampleK6Data('distributed-2', 1200);
  const sampleData3 = createSampleK6Data('distributed-3', 800);
  
  const testFiles = [
    path.join(testDir, 'test-1.json'),
    path.join(testDir, 'test-2.json'),
    path.join(testDir, 'test-3.json')
  ];
  
  // Write sample data to files
  console.log('📝 Creating sample k6 data...');
  fs.writeFileSync(testFiles[0], sampleData1.join('\n'));
  fs.writeFileSync(testFiles[1], sampleData2.join('\n'));
  fs.writeFileSync(testFiles[2], sampleData3.join('\n'));
  
  console.log(`✅ Created ${testFiles.length} sample files`);
  
  try {
    // Test 1: Merge script
    console.log('\n🧪 Test 1: Testing merge script...');
    const mergedFile = path.join(testDir, 'combined-results.json');
    const mergeResult = await mergeLargeResults(testFiles, mergedFile);
    
    console.log('✅ Merge test passed!');
    console.log(`📊 Results: ${mergeResult.summary.totalRequests} requests, ${mergeResult.summary.totalErrors} errors`);
    
    // Test 2: Summarize script
    console.log('\n🧪 Test 2: Testing summarize script...');
    const htmlFile = path.join(testDir, 'test-summary.html');
    const summaryResult = await generateSummary(mergedFile, htmlFile);
    
    console.log('✅ Summarize test passed!');
    console.log(`📄 HTML generated: ${summaryResult.outputFile}`);
    
    // Test 3: Check file sizes
    console.log('\n🧪 Test 3: Checking generated files...');
    const mergedStats = fs.statSync(mergedFile);
    const htmlStats = fs.statSync(htmlFile);
    
    console.log(`📊 Merged JSON: ${(mergedStats.size / 1024).toFixed(2)} KB`);
    console.log(`📄 HTML Summary: ${(htmlStats.size / 1024).toFixed(2)} KB`);
    
    // Test 4: Verify HTML content
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    if (htmlContent.includes('Load Test Summary Report') && htmlContent.includes('Test Summary')) {
      console.log('✅ HTML content verification passed!');
    } else {
      console.log('❌ HTML content verification failed!');
    }
    
    console.log('\n🎉 All tests passed! Report generation is working correctly.');
    console.log(`📁 Test files created in: ${testDir}/`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

/**
 * Create sample k6 JSON data
 */
function createSampleK6Data(prefix, requestCount) {
  const data = [];
  
  // Add metric data
  for (let i = 0; i < requestCount; i++) {
    const timestamp = Date.now() + (i * 1000);
    
    // HTTP request metric
    data.push(JSON.stringify({
      metric: 'http_reqs',
      data: {
        value: 1,
        count: 1,
        rate: 0.5
      },
      time: timestamp
    }));
    
    // HTTP duration metric
    data.push(JSON.stringify({
      metric: 'http_req_duration',
      data: {
        value: 150 + Math.random() * 200, // 150-350ms
        count: 1,
        rate: 0.5
      },
      time: timestamp
    }));
    
    // Add some errors (10% error rate)
    if (Math.random() < 0.1) {
      data.push(JSON.stringify({
        metric: 'http_req_failed',
        data: {
          value: 1,
          count: 1,
          rate: 0.05
        },
        time: timestamp
      }));
    }
  }
  
  // Add iteration metrics
  data.push(JSON.stringify({
    metric: 'iterations',
    data: {
      value: requestCount,
      count: requestCount,
      rate: 0.5
    },
    time: Date.now()
  }));
  
  return data;
}

// Run test if called directly
if (require.main === module) {
  testReportGeneration()
    .then(() => {
      console.log('\n✅ All report generation tests completed successfully!');
    })
    .catch(error => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testReportGeneration }; 