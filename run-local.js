#!/usr/bin/env node

/*
🚀 ENHANCED LOCAL LOAD TEST RUNNER

This enhanced script allows you to run load tests locally with different configurations:
- quick: 50 users, 5 minutes
- 1500: 1500 users, 25 minutes  
- distributed: 1000 users per instance (simulated)

Features:
- Enhanced reporting with interactive charts
- Automatic result analysis
- Performance recommendations
- Export capabilities
- Better error handling

Usage:
  node run-local.js quick
  node run-local.js 1500
  node run-local.js distributed
*/

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const testType = process.argv[2];

if (!testType || !['quick', '1500', 'distributed'].includes(testType)) {
  console.log(`
🚀 ENHANCED LOCAL LOAD TEST RUNNER

Usage: node run-local.js <test-type>

Available test types:
  quick       - 50 users, 5 minutes (recommended for testing)
  1500        - 1500 users, 25 minutes (requires 8GB+ RAM)
  distributed - 1000 users, 25 minutes (simulated distributed)

Examples:
  node run-local.js quick
  node run-local.js 1500
  node run-local.js distributed

Features:
  ✅ Enhanced HTML reports with interactive charts
  ✅ Performance analysis and recommendations
  ✅ Export to PDF and CSV
  ✅ Automatic result validation
`);
  process.exit(1);
}

// Check if k6 is available
function checkK6() {
  try {
    execSync('k6 version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Get k6 command
function getK6Command() {
  if (checkK6()) {
    return 'k6';
  }
  
  // Check for local k6 installation
  const localK6 = path.join(__dirname, '..', 'k6', 'k6-v0.50.0-windows-amd64', 'k6.exe');
  if (fs.existsSync(localK6)) {
    return `"${localK6}"`;
  }
  
  console.error('❌ k6 not found. Please install k6 or ensure it\'s in your PATH.');
  console.error('   Download from: https://k6.io/docs/getting-started/installation/');
  process.exit(1);
}

// Create results directory
function createResultsDir() {
  const resultsDir = path.join(__dirname, 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  return resultsDir;
}

// Validate test results
function validateResults(resultsFile) {
  try {
    const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    const metrics = results.metrics;
    
    const validation = {
      totalRequests: metrics.http_reqs?.count > 0,
      responseTime: metrics.http_req_duration?.avg > 0,
      errorRate: metrics.http_req_failed?.rate < 0.5, // Less than 50% errors
      throughput: metrics.http_reqs?.rate > 0
    };
    
    const passed = Object.values(validation).every(v => v);
    
    return {
      passed,
      validation,
      summary: {
        totalRequests: metrics.http_reqs?.count || 0,
        avgResponseTime: metrics.http_req_duration?.avg || 0,
        errorRate: metrics.http_req_failed?.rate || 0,
        throughput: metrics.http_reqs?.rate || 0
      }
    };
  } catch (error) {
    return {
      passed: false,
      validation: {},
      summary: {},
      error: error.message
    };
  }
}

// Run test
function runTest(testType) {
  const k6Command = getK6Command();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultsDir = createResultsDir();
  
  let testFile, outputFile, duration, description;
  
  switch (testType) {
    case 'quick':
      testFile = 'load-tests/quick-test.js';
      outputFile = path.join(resultsDir, `quick-results-${timestamp}.json`);
      duration = '5 minutes';
      description = 'Quick validation and smoke testing';
      console.log('🚀 Starting Quick Test (50 users, 5 minutes)...');
      console.log('💡 Purpose: Quick validation and smoke testing');
      break;
      
    case '1500':
      testFile = 'load-tests/optimized-1500-users.js';
      outputFile = path.join(resultsDir, `1500-results-${timestamp}.json`);
      duration = '25 minutes';
      description = 'High-load performance testing';
      console.log('🚀 Starting 1500 Users Test (25 minutes)...');
      console.log('💡 Purpose: High-load performance testing');
      console.log('⚠️  Requires 8GB+ RAM for optimal performance');
      break;
      
    case 'distributed':
      testFile = 'load-tests/distributed-runner.js';
      outputFile = path.join(resultsDir, `distributed-results-${timestamp}.json`);
      duration = '25 minutes';
      description = 'Distributed high-load testing';
      console.log('🚀 Starting Distributed Test (1000 users, 25 minutes)...');
      console.log('💡 Purpose: Distributed high-load testing');
      console.log('⚠️  This is a simulated distributed test');
      break;
  }
  
  try {
    console.log(`📊 Running ${testType} test for ${duration}...`);
    console.log(`📁 Results will be saved to: ${outputFile}`);
    console.log('');
    
    const command = `${k6Command} run ${testFile} --out json=${outputFile}`;
    execSync(command, { stdio: 'inherit' });
    
    console.log('');
    console.log('✅ Test completed successfully!');
    console.log(`📈 Results saved to: ${outputFile}`);
    
    // Validate results
    console.log('🔍 Validating test results...');
    const validation = validateResults(outputFile);
    
    if (validation.passed) {
      console.log('✅ Test validation passed!');
    } else {
      console.log('⚠️  Test validation issues detected:');
      Object.entries(validation.validation).forEach(([key, passed]) => {
        console.log(`   ${passed ? '✅' : '❌'} ${key}`);
      });
    }
    
    // Generate enhanced report
    const reportGenerator = 'load-tests/enhanced-report-generator.js';
    if (fs.existsSync(reportGenerator)) {
      try {
        console.log('📊 Generating enhanced report...');
        const reportFile = path.join(resultsDir, `${testType}-enhanced-report-${timestamp}.html`);
        execSync(`node ${reportGenerator} ${outputFile} ${reportFile}`, { stdio: 'inherit' });
        console.log(`📄 Enhanced report saved to: ${reportFile}`);
        
        // Open report in browser (Windows)
        try {
          execSync(`start ${reportFile}`, { stdio: 'pipe' });
          console.log('🌐 Report opened in browser');
        } catch (error) {
          console.log('💡 Open the HTML report manually to view results');
        }
      } catch (error) {
        console.log('⚠️  Could not generate enhanced report, trying basic report...');
        try {
          const basicReport = 'load-tests/report-generator.js';
          if (fs.existsSync(basicReport)) {
            const basicReportFile = path.join(resultsDir, `${testType}-basic-report-${timestamp}.html`);
            execSync(`node ${basicReport} ${outputFile} ${basicReportFile}`, { stdio: 'inherit' });
            console.log(`📄 Basic report saved to: ${basicReportFile}`);
          }
        } catch (basicError) {
          console.log('⚠️  Could not generate any report');
        }
      }
    }
    
    // Display summary
    if (validation.summary) {
      console.log('');
      console.log('📊 Test Summary:');
      console.log(`   Total Requests: ${validation.summary.totalRequests.toLocaleString()}`);
      console.log(`   Avg Response Time: ${(validation.summary.avgResponseTime / 1000).toFixed(2)}s`);
      console.log(`   Error Rate: ${(validation.summary.errorRate * 100).toFixed(2)}%`);
      console.log(`   Throughput: ${validation.summary.throughput.toFixed(2)} req/s`);
    }
    
    console.log('');
    console.log('🎉 Test execution completed!');
    console.log(`📁 All files saved in: ${resultsDir}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
runTest(testType); 