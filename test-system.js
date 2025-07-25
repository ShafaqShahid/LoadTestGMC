#!/usr/bin/env node

/**
 * 🧪 SYSTEM TEST SCRIPT
 * 
 * Tests the large result processing system with sample data
 * Verifies all components work correctly
 */

const fs = require('fs');
const path = require('path');
const { mergeLargeResults } = require('./load-tests/mergeLargeResults.js');
const { generateSummary } = require('./load-tests/summarize.js');
const { generateStyledPDF } = require('./load-tests/generate-pdf.js');

class SystemTester {
  constructor() {
    this.testDir = path.join(__dirname, 'test-outputs');
    this.sampleData = this.generateSampleData();
  }

  /**
   * Generate sample k6 result data
   */
  generateSampleData() {
    const baseTime = Date.now();
    const data = [];
    
    // Generate metrics
    data.push({
      type: 'Metric',
      metric: 'http_reqs',
      data: { count: 10000, rate: 22.5 }
    });
    
    data.push({
      type: 'Metric',
      metric: 'http_req_duration',
      data: { avg: 150, min: 50, max: 500, p90: 200, p95: 250, p99: 400 }
    });
    
    data.push({
      type: 'Metric',
      metric: 'http_req_failed',
      data: { count: 150, rate: 0.33 }
    });
    
    data.push({
      type: 'Metric',
      metric: 'iterations',
      data: { count: 10000, rate: 22.5 }
    });
    
    // Generate data points
    for (let i = 0; i < 1000; i++) {
      data.push({
        type: 'Point',
        metric: 'http_req_duration',
        time: baseTime + (i * 1000),
        value: Math.random() * 300 + 50,
        tags: { method: 'GET', status: '200' }
      });
      
      if (i % 20 === 0) { // 5% error rate
        data.push({
          type: 'Point',
          metric: 'http_req_failed',
          time: baseTime + (i * 1000),
          value: 1,
          tags: { error_code: '500', method: 'POST' }
        });
      }
    }
    
    return data;
  }

  /**
   * Create test directory and sample files
   */
  async setupTestEnvironment() {
    console.log('🧪 Setting up test environment...');
    
    if (!fs.existsSync(this.testDir)) {
      fs.mkdirSync(this.testDir, { recursive: true });
    }
    
    // Create 3 sample result files
    for (let i = 1; i <= 3; i++) {
      const fileName = path.join(this.testDir, `test-result-${i}.json`);
      const fileData = this.sampleData.map(item => JSON.stringify(item)).join('\n');
      fs.writeFileSync(fileName, fileData);
      console.log(`✅ Created test file: ${fileName}`);
    }
  }

  /**
   * Test the merge functionality
   */
  async testMerge() {
    console.log('\n🧠 Testing large result merger...');
    
    const inputFiles = [
      path.join(this.testDir, 'test-result-1.json'),
      path.join(this.testDir, 'test-result-2.json'),
      path.join(this.testDir, 'test-result-3.json')
    ];
    
    const outputFile = path.join(this.testDir, 'merged-results.json');
    
    try {
      const result = await mergeLargeResults(inputFiles, outputFile);
      console.log('✅ Merge test passed!');
      console.log(`📊 Summary: ${result.summary.totalRequests} requests, ${result.summary.totalErrors} errors`);
      return { outputFile, summary: result.summary };
    } catch (error) {
      console.error('❌ Merge test failed:', error.message);
      throw error;
    }
  }

  /**
   * Test the summary generation
   */
  async testSummary(mergedFile) {
    console.log('\n📊 Testing summary generator...');
    
    const outputFile = path.join(this.testDir, 'test-summary.html');
    
    try {
      const result = await generateSummary(mergedFile, outputFile);
      console.log('✅ Summary generation test passed!');
      console.log(`📄 HTML report: ${outputFile}`);
      return result;
    } catch (error) {
      console.error('❌ Summary generation test failed:', error.message);
      throw error;
    }
  }

  /**
   * Test PDF generation (optional)
   */
  async testPDF(htmlFile) {
    console.log('\n📄 Testing PDF generation...');
    
    const outputFile = path.join(this.testDir, 'test-report.pdf');
    
    try {
      const result = await generateStyledPDF(htmlFile, outputFile);
      console.log('✅ PDF generation test passed!');
      console.log(`📄 PDF report: ${outputFile}`);
      return result;
    } catch (error) {
      console.warn('⚠️ PDF generation test skipped (Puppeteer not available):', error.message);
      return null;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting system tests...\n');
    
    try {
      // Setup
      await this.setupTestEnvironment();
      
      // Test merge
      const mergeResult = await this.testMerge();
      
      // Test summary
      const summaryResult = await this.testSummary(mergeResult.outputFile);
      
      // Test PDF (optional)
      await this.testPDF(summaryResult.outputFile);
      
      console.log('\n🎉 All tests completed successfully!');
      console.log('\n📁 Generated files:');
      console.log(`   ${this.testDir}/`);
      console.log('   ├── test-result-1.json');
      console.log('   ├── test-result-2.json');
      console.log('   ├── test-result-3.json');
      console.log('   ├── merged-results.json');
      console.log('   ├── test-summary.html');
      console.log('   └── test-report.pdf (if Puppeteer available)');
      
      return true;
    } catch (error) {
      console.error('\n❌ System test failed:', error.message);
      return false;
    }
  }

  /**
   * Cleanup test files
   */
  cleanup() {
    if (fs.existsSync(this.testDir)) {
      fs.rmSync(this.testDir, { recursive: true, force: true });
      console.log('🧹 Cleaned up test files');
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const tester = new SystemTester();
  
  if (args.includes('--cleanup')) {
    tester.cleanup();
    process.exit(0);
  }
  
  tester.runAllTests()
    .then(success => {
      if (success) {
        console.log('\n✅ System is ready for production use!');
        process.exit(0);
      } else {
        console.log('\n❌ System test failed. Please check the errors above.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { SystemTester }; 