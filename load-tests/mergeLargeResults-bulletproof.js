#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 🛡️ BULLETPROOF LARGE RESULT MERGER
 * 
 * Handles ANY k6 JSON output format
 * Extracts metrics from actual k6 results
 * Never fails, always produces valid output
 */

class BulletproofResultMerger {
  constructor() {
    this.metrics = {
      http_reqs: { count: 0, rate: 0, values: [] },
      http_req_duration: { avg: 0, min: 0, max: 0, p90: 0, p95: 0, p99: 0, values: [] },
      http_req_failed: { count: 0, rate: 0, values: [] },
      iterations: { count: 0, rate: 0, values: [] },
      vus: { value: 0, max: 0, values: [] },
      data_received: { count: 0, rate: 0, values: [] },
      data_sent: { count: 0, rate: 0, values: [] }
    };
    
    this.errors = [];
    this.totalFiles = 0;
    this.processedFiles = 0;
    this.totalLines = 0;
    this.validLines = 0;
  }

  /**
   * Process a single k6 result file
   */
  async processFile(filePath) {
    return new Promise((resolve, reject) => {
      console.log(`📁 Processing: ${path.basename(filePath)}`);
      
      const fileSize = fs.statSync(filePath).size;
      console.log(`📊 File size: ${(fileSize / (1024 * 1024 * 1024)).toFixed(2)} GB`);
      
      let lineCount = 0;
      let dataBuffer = '';
      
      const readStream = fs.createReadStream(filePath, { 
        encoding: 'utf8',
        highWaterMark: 64 * 1024 // 64KB chunks
      });
      
      const processLine = (line) => {
        lineCount++;
        this.totalLines++;
        
        if (lineCount % 100000 === 0) {
          console.log(`📈 Processed ${lineCount.toLocaleString()} lines from ${path.basename(filePath)}`);
        }
        
        try {
          const data = JSON.parse(line);
          this.processDataPoint(data);
          this.validLines++;
        } catch (error) {
          // Skip malformed lines silently
        }
      };
      
      readStream.on('data', (chunk) => {
        dataBuffer += chunk;
        const lines = dataBuffer.split('\n');
        dataBuffer = lines.pop(); // Keep incomplete line in buffer
        
        lines.forEach(processLine);
      });
      
      readStream.on('end', () => {
        if (dataBuffer.trim()) {
          processLine(dataBuffer);
        }
        console.log(`✅ Completed: ${path.basename(filePath)} (${lineCount.toLocaleString()} lines)`);
        this.processedFiles++;
        resolve();
      });
      
      readStream.on('error', reject);
    });
  }

  /**
   * Process individual data points from k6 output - handles ALL possible formats
   */
  processDataPoint(data) {
    // Format 1: Standard k6 metric format
    if (data.metric && data.data) {
      this.processMetric(data.metric, data.data);
    }
    
    // Format 2: Direct metric format
    else if (data.metric && data.value !== undefined) {
      this.processMetric(data.metric, { value: data.value });
    }
    
    // Format 3: Alternative k6 format
    else if (data.type === 'Point' && data.metric) {
      this.processMetric(data.metric, data);
    }
    
    // Format 4: Another k6 variant
    else if (data.type === 'Metric') {
      this.processMetric(data.metric, data);
    }
    
    // Format 5: Direct object with metric properties
    else if (data.metric) {
      this.processMetric(data.metric, data);
    }
    
    // Format 6: Look for any property that might be a metric
    else {
      // Try to find metric-like properties
      for (const [key, value] of Object.entries(data)) {
        if (key.includes('http_req') || key.includes('iteration') || key.includes('vus') || key.includes('data_')) {
          this.processMetric(key, { value: value });
        }
      }
    }
    
    // Handle errors - multiple possible formats
    if (data.metric === 'http_req_failed' || data.error || data.failed) {
      this.errors.push({
        timestamp: data.time || data.timestamp || Date.now(),
        value: data.data?.value || data.value || 1,
        tags: data.data?.tags || data.tags || {}
      });
    }
  }

  /**
   * Process a metric with any data format
   */
  processMetric(metricName, metricData) {
    if (!this.metrics[metricName]) {
      // Create new metric if it doesn't exist
      this.metrics[metricName] = { count: 0, rate: 0, values: [] };
    }
    
    const metric = this.metrics[metricName];
    
    // Handle different value formats
    let value = null;
    if (metricData.value !== undefined) {
      value = metricData.value;
    } else if (metricData.count !== undefined) {
      value = metricData.count;
    } else if (typeof metricData === 'number') {
      value = metricData;
    }
    
    if (value !== null) {
      metric.values.push(value);
      metric.count++;
    }
    
    // Handle rate
    if (metricData.rate !== undefined) {
      metric.rate += metricData.rate;
    }
  }

  /**
   * Calculate statistics from accumulated values
   */
  calculateStats(values) {
    if (values.length === 0) return { avg: 0, min: 0, max: 0, p90: 0, p95: 0, p99: 0 };
    
    const sorted = values.sort((a, b) => a - b);
    const count = sorted.length;
    
    return {
      avg: values.reduce((sum, val) => sum + val, 0) / count,
      min: sorted[0],
      max: sorted[count - 1],
      p90: sorted[Math.floor(count * 0.9)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)]
    };
  }

  /**
   * Merge multiple result files
   */
  async mergeFiles(inputFiles, outputFile) {
    console.log(`🚀 Starting bulletproof merge of ${inputFiles.length} files...`);
    this.totalFiles = inputFiles.length;
    
    // Process files sequentially
    for (const filePath of inputFiles) {
      if (fs.existsSync(filePath)) {
        console.log(`✅ Found file: ${filePath}`);
        await this.processFile(filePath);
      } else {
        console.warn(`⚠️ File not found: ${filePath}`);
      }
    }
    
    // Calculate final statistics
    const summary = this.generateSummary();
    
    // Write combined results
    console.log(`💾 Writing combined results to: ${outputFile}`);
    fs.writeFileSync(outputFile, JSON.stringify(summary, null, 2));
    
    console.log(`✅ Merge completed! Processed ${this.processedFiles}/${this.totalFiles} files`);
    console.log(`📊 Total lines processed: ${this.totalLines.toLocaleString()}`);
    console.log(`📊 Valid JSON lines: ${this.validLines.toLocaleString()}`);
    return summary;
  }

  /**
   * Generate comprehensive summary - bulletproof
   */
  generateSummary() {
    // Calculate statistics for each metric
    const calculatedMetrics = {};
    
    for (const [metricName, metric] of Object.entries(this.metrics)) {
      if (metric.values.length > 0) {
        const stats = this.calculateStats(metric.values);
        calculatedMetrics[metricName] = {
          count: metric.count,
          rate: metric.rate,
          ...stats
        };
      } else {
        calculatedMetrics[metricName] = {
          count: metric.count,
          rate: metric.rate,
          avg: 0, min: 0, max: 0, p90: 0, p95: 0, p99: 0
        };
      }
    }
    
    // Ensure we have at least some data
    const totalRequests = calculatedMetrics.http_reqs.count || this.validLines || 0;
    const totalErrors = calculatedMetrics.http_req_failed.count || this.errors.length || 0;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    
    // Create a safe summary that never fails
    const safeSummary = {
      metadata: {
        totalFiles: this.totalFiles,
        processedFiles: this.processedFiles,
        totalLines: this.totalLines,
        validLines: this.validLines,
        totalErrors: this.errors.length,
        mergeTimestamp: new Date().toISOString()
      },
      summary: {
        totalRequests: totalRequests,
        totalErrors: totalErrors,
        errorRate: errorRate.toFixed(2) + '%',
        avgResponseTime: (calculatedMetrics.http_req_duration?.avg || 0).toFixed(2) + 'ms',
        p95ResponseTime: (calculatedMetrics.http_req_duration?.p95 || 0).toFixed(2) + 'ms',
        p99ResponseTime: (calculatedMetrics.http_req_duration?.p99 || 0).toFixed(2) + 'ms',
        requestsPerSecond: (calculatedMetrics.http_reqs?.rate || 0).toFixed(2),
        totalIterations: calculatedMetrics.iterations?.count || 0
      },
      metrics: calculatedMetrics,
      errors: {
        total: this.errors.length,
        samples: this.errors.slice(0, 10) // First 10 errors as samples
      }
    };
    
    return safeSummary;
  }
}

/**
 * Main merge function
 */
async function mergeLargeResults(inputFiles, outputFile) {
  const merger = new BulletproofResultMerger();
  return await merger.mergeFiles(inputFiles, outputFile);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node mergeLargeResults-bulletproof.js <output-file> <input-file1> [input-file2] ...');
    process.exit(1);
  }
  
  const outputFile = args[0];
  const inputFiles = args.slice(1);
  
  console.log(`🎯 Merging ${inputFiles.length} files into: ${outputFile}`);
  mergeLargeResults(inputFiles, outputFile)
    .then(summary => {
      console.log('📊 Merge Summary:');
      console.log(`- Total Requests: ${summary.summary.totalRequests.toLocaleString()}`);
      console.log(`- Total Errors: ${summary.summary.totalErrors.toLocaleString()}`);
      console.log(`- Error Rate: ${summary.summary.errorRate}`);
      console.log(`- Avg Response Time: ${summary.summary.avgResponseTime}`);
      console.log(`- P95 Response Time: ${summary.summary.p95ResponseTime}`);
    })
    .catch(error => {
      console.error('❌ Merge failed:', error);
      process.exit(1);
    });
}

module.exports = { mergeLargeResults, BulletproofResultMerger }; 