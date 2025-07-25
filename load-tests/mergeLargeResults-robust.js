#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 🧠 ROBUST LARGE RESULT MERGER
 * 
 * Handles k6 JSON output format correctly
 * Extracts metrics from actual k6 results
 */

class RobustResultMerger {
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
        if (lineCount % 100000 === 0) {
          console.log(`📈 Processed ${lineCount.toLocaleString()} lines from ${path.basename(filePath)}`);
        }
        
        try {
          const data = JSON.parse(line);
          this.processDataPoint(data);
        } catch (error) {
          // Skip malformed lines
          if (line.trim()) {
            console.warn(`⚠️ Skipping malformed line ${lineCount}: ${error.message}`);
          }
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
   * Process individual data points from k6 output
   */
  processDataPoint(data) {
    // Handle k6 metric format
    if (data.metric && data.data) {
      const metricName = data.metric;
      const metricData = data.data;
      
      if (this.metrics[metricName]) {
        const metric = this.metrics[metricName];
        
        // Accumulate values for calculations
        if (metricData.value !== undefined) {
          metric.values.push(metricData.value);
        }
        
        // Update counts and rates
        if (metricData.count !== undefined) {
          metric.count += metricData.count;
        }
        
        if (metricData.rate !== undefined) {
          metric.rate += metricData.rate;
        }
      }
    }
    
    // Handle alternative k6 format
    if (data.metric && data.value !== undefined) {
      const metricName = data.metric;
      
      if (this.metrics[metricName]) {
        const metric = this.metrics[metricName];
        metric.values.push(data.value);
        metric.count++;
      }
    }
    
    // Handle errors
    if (data.metric === 'http_req_failed' && data.data && data.data.value > 0) {
      this.errors.push({
        timestamp: data.time,
        value: data.data.value,
        tags: data.data.tags || {}
      });
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
    console.log(`🚀 Starting merge of ${inputFiles.length} files...`);
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
    return summary;
  }

  /**
   * Generate comprehensive summary
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
    
    const totalRequests = calculatedMetrics.http_reqs.count || 0;
    const totalErrors = calculatedMetrics.http_req_failed.count || 0;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    
    return {
      metadata: {
        totalFiles: this.totalFiles,
        processedFiles: this.processedFiles,
        totalErrors: this.errors.length,
        mergeTimestamp: new Date().toISOString()
      },
      summary: {
        totalRequests,
        totalErrors,
        errorRate: errorRate.toFixed(2) + '%',
        avgResponseTime: (calculatedMetrics.http_req_duration.avg || 0).toFixed(2) + 'ms',
        p95ResponseTime: (calculatedMetrics.http_req_duration.p95 || 0).toFixed(2) + 'ms',
        p99ResponseTime: (calculatedMetrics.http_req_duration.p99 || 0).toFixed(2) + 'ms',
        requestsPerSecond: (calculatedMetrics.http_reqs.rate || 0).toFixed(2),
        totalIterations: calculatedMetrics.iterations.count || 0
      },
      metrics: calculatedMetrics,
      errors: {
        total: this.errors.length,
        samples: this.errors.slice(0, 10) // First 10 errors as samples
      }
    };
  }
}

/**
 * Main merge function
 */
async function mergeLargeResults(inputFiles, outputFile) {
  const merger = new RobustResultMerger();
  return await merger.mergeFiles(inputFiles, outputFile);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node mergeLargeResults-robust.js <output-file> <input-file1> [input-file2] ...');
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

module.exports = { mergeLargeResults, RobustResultMerger }; 