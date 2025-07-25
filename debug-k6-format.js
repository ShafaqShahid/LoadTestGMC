#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 🔍 DEBUG K6 JSON FORMAT
 * 
 * Examine the actual k6 output format to fix parsing issues
 */

function debugK6Format(filePath) {
  console.log(`🔍 Debugging k6 format: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return;
  }
  
  const fileSize = fs.statSync(filePath).size;
  console.log(`📊 File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
  
  // Read first few lines to understand format
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  console.log(`📈 Total lines: ${lines.length}`);
  
  // Examine first 5 non-empty lines
  console.log('\n📋 First 5 lines:');
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    try {
      const data = JSON.parse(lines[i]);
      console.log(`Line ${i + 1}:`, JSON.stringify(data, null, 2));
    } catch (error) {
      console.log(`Line ${i + 1}: [Invalid JSON] ${lines[i].substring(0, 100)}...`);
    }
  }
  
  // Look for specific metric types
  console.log('\n🔍 Looking for metric patterns...');
  let metricCount = 0;
  let httpReqCount = 0;
  let httpDurationCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < Math.min(1000, lines.length); i++) {
    try {
      const data = JSON.parse(lines[i]);
      
      if (data.metric) {
        metricCount++;
        
        if (data.metric === 'http_reqs') {
          httpReqCount++;
          if (httpReqCount <= 3) {
            console.log(`HTTP Request metric:`, JSON.stringify(data, null, 2));
          }
        }
        
        if (data.metric === 'http_req_duration') {
          httpDurationCount++;
          if (httpDurationCount <= 3) {
            console.log(`HTTP Duration metric:`, JSON.stringify(data, null, 2));
          }
        }
        
        if (data.metric === 'http_req_failed') {
          errorCount++;
          if (errorCount <= 3) {
            console.log(`HTTP Error metric:`, JSON.stringify(data, null, 2));
          }
        }
      }
    } catch (error) {
      // Skip invalid JSON
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Total metrics found: ${metricCount}`);
  console.log(`- HTTP requests: ${httpReqCount}`);
  console.log(`- HTTP durations: ${httpDurationCount}`);
  console.log(`- HTTP errors: ${errorCount}`);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node debug-k6-format.js <k6-result-file>');
    console.log('');
    console.log('Example:');
    console.log('  node debug-k6-format.js outputs/distributed-1-results/distributed-1-results.json');
    process.exit(1);
  }
  
  const filePath = args[0];
  debugK6Format(filePath);
}

module.exports = { debugK6Format }; 