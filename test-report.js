#!/usr/bin/env node

/*
🧪 TEST REPORT GENERATOR

This script tests the report generator with sample data
*/

import LoadTestReporter from './load-tests/report-generator.js';

// Sample k6 results data for testing
const sampleResults = {
  state: {
    testRunDuration: 1800000, // 30 minutes
    stages: [
      { duration: 300000, target: 100 },
      { duration: 600000, target: 500 },
      { duration: 900000, target: 1500 }
    ]
  },
  metrics: {
    http_reqs: {
      count: 50000,
      rate: 27.78
    },
    http_req_failed: {
      count: 2500,
      rate: 0.05
    },
    http_req_duration: {
      avg: 1500,
      'p(95)': 3500,
      'p(99)': 8000,
      max: 15000
    },
    data_received: {
      count: 52428800 // 50MB
    },
    data_sent: {
      count: 10485760 // 10MB
    }
  },
  thresholds: {
    'http_req_duration': {
      threshold: 'p(95)<4500',
      ok: true,
      value: 3500
    },
    'http_req_failed': {
      threshold: 'rate<0.18',
      ok: true,
      value: 0.05
    }
  },
  root_group: {
    checks: {
      'login page loaded': {
        passes: 50000,
        fails: 0
      },
      'login successful': {
        passes: 47500,
        fails: 2500
      },
      'dashboard loaded': {
        passes: 47000,
        fails: 3000
      },
      'search successful': {
        passes: 48000,
        fails: 2000
      }
    }
  }
};

// Write sample data to file
import fs from 'fs';
fs.writeFileSync('test-results.json', JSON.stringify(sampleResults, null, 2));

console.log('🧪 Testing Report Generator...');
console.log('📝 Sample data written to test-results.json');

// Test the reporter
const reporter = new LoadTestReporter();

if (reporter.parseResults('test-results.json')) {
  if (reporter.analyzeMetrics()) {
    console.log('✅ Analysis completed successfully');
    
    // Generate reports
    reporter.generateHTMLReport();
    reporter.generateJSONReport();
    
    // Display summary
    console.log('\n' + '='.repeat(80));
    console.log('SAMPLE REPORT SUMMARY');
    console.log('='.repeat(80));
    console.log(reporter.generateGitHubSummary());
    console.log('='.repeat(80));
    
    console.log('\n📊 Reports generated:');
    console.log('- load-test-report.html (Beautiful HTML report)');
    console.log('- detailed-report.json (Structured data)');
    console.log('- test-results.json (Sample data)');
  }
} else {
  console.log('❌ Analysis failed');
} 