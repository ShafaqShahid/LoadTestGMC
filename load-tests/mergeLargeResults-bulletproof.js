#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const path = require('path');

/**
 * 🔧 BULLETPROOF K6 RESULT MERGER
 * 
 * Handles massive k6 JSON files with memory efficiency and comprehensive error analysis
 */

class BulletproofResultMerger {
  constructor() {
    this.metrics = {};
    this.errors = [];
    this.checks = [];
    this.requestsByStatus = {};
    this.errorsByType = {};
    this.timelineData = [];
    this.testStartTime = null;
    this.testEndTime = null;
    this.totalFiles = 0;
    this.processedFiles = 0;
    this.totalLines = 0;
    this.validLines = 0;
    this.testConfiguration = {
      totalUsers: 3000,
      usersPerInstance: 1000,
      duration: "25 minutes",
      environment: "Sports Systems staging environment",
      thresholds: {
        p95Duration: "< 10s",
        errorRate: "< 40%"
      },
      phases: [
        { name: "Ramp up", users: "0 → 1000", description: "Gradual increase in users" },
        { name: "Sustain", users: "1000", description: "Held for sustained load" },
        { name: "Ramp down", users: "1000 → 0", description: "Gradual decrease after peak load" }
      ]
    };
  }

  /**
   * Process file line by line with memory efficiency
   */
  async processFile(filePath) {
    const fileName = path.basename(filePath);
    console.log(`📁 Processing: ${fileName}`);
    
    const stats = fs.statSync(filePath);
    console.log(`📊 File size: ${(stats.size / (1024 * 1024 * 1024)).toFixed(2)} GB`);
    
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    let lineCount = 0;
    
    for await (const line of rl) {
      lineCount++;
      this.totalLines++;
      
      if (lineCount % 100000 === 0) {
        console.log(`📈 Processed ${lineCount.toLocaleString()} lines from ${fileName}`);
      }
      
      // Skip empty lines
      if (line.trim() === '') continue;
      
      try {
        const data = JSON.parse(line);
        this.validLines++;
        this.processDataPoint(data);
      } catch (error) {
        // Silently skip malformed JSON lines
        continue;
      }
    }
    
    console.log(`✅ Completed: ${fileName} (${lineCount.toLocaleString()} lines)`);
    this.processedFiles++;
  }

  /**
   * Process individual data points from k6 output - handles ALL possible formats
   */
  processDataPoint(data) {
    // Track test timeline
    const timestamp = data.data?.time || data.time || data.timestamp;
    if (timestamp) {
      const timeMs = new Date(timestamp).getTime();
      if (!this.testStartTime || timeMs < this.testStartTime) {
        this.testStartTime = timeMs;
      }
      if (!this.testEndTime || timeMs > this.testEndTime) {
        this.testEndTime = timeMs;
      }
    }

    // Format 1: Standard k6 metric format
    if (data.metric && data.data) {
      this.processMetric(data.metric, data.data, timestamp);
    }
    
    // Format 2: Direct metric format
    else if (data.metric && data.value !== undefined) {
      this.processMetric(data.metric, { value: data.value }, timestamp);
    }
    
    // Format 3: Alternative k6 format
    else if (data.type === 'Point' && data.metric) {
      this.processMetric(data.metric, data, timestamp);
    }
    
    // Format 4: Another k6 variant
    else if (data.type === 'Metric') {
      this.processMetric(data.metric, data, timestamp);
    }
    
    // Format 5: Direct object with metric properties
    else if (data.metric) {
      this.processMetric(data.metric, data, timestamp);
    }
    
    // Format 6: Look for any property that might be a metric
    else {
      // Try to find metric-like properties
      for (const [key, value] of Object.entries(data)) {
        if (key.includes('http_req') || key.includes('iteration') || key.includes('vus') || key.includes('data_')) {
          this.processMetric(key, { value: value }, timestamp);
        }
      }
    }

    // Enhanced error handling - only count actual failures (value = 1)
    if (data.metric === 'http_req_failed') {
      const failureValue = data.data?.value || data.value || 0;
      const tags = data.data?.tags || data.tags || {};
      
      // Track ALL requests by status code (both successful and failed)
      const status = tags.status || 'unknown';
      if (!this.requestsByStatus[status]) {
        this.requestsByStatus[status] = 0;
      }
      this.requestsByStatus[status]++;
      
      if (failureValue === 1) {
        // Categorize error by type
        const errorType = this.categorizeError(tags);
        
        this.errors.push({
          timestamp: timestamp || Date.now(),
          value: failureValue,
          tags: tags,
          errorType: errorType,
          statusCode: tags.status,
          errorCode: tags.error_code,
          method: tags.method,
          url: tags.url || tags.name,
          error: tags.error
        });

        // Track errors by type
        if (!this.errorsByType[errorType]) {
          this.errorsByType[errorType] = 0;
        }
        this.errorsByType[errorType]++;
      }
    }
    
    // Also track status codes from http_reqs metric
    if (data.metric === 'http_reqs') {
      const tags = data.data?.tags || data.tags || {};
      const status = tags.status || 'unknown';
      if (!this.requestsByStatus[status]) {
        this.requestsByStatus[status] = 0;
      }
      this.requestsByStatus[status]++;
    }
    
    // Handle checks data
    if (data.metric === 'checks') {
      const checkValue = data.data?.value || data.value || 0;
      const tags = data.data?.tags || data.tags || {};
      
      this.checks.push({
        timestamp: timestamp || Date.now(),
        passed: checkValue === 1,
        checkName: tags.check,
        tags: tags
      });
    }

    // Handle other error formats
    if (data.error || data.failed) {
      this.errors.push({
        timestamp: timestamp || Date.now(),
        value: data.data?.value || data.value || 1,
        tags: data.data?.tags || data.tags || {},
        errorType: 'generic_error'
      });
    }
  }

  /**
   * Categorize errors based on tags and status codes
   */
  categorizeError(tags) {
    if (tags.error && tags.error.includes('timeout')) {
      return 'timeout';
    }
    if (tags.error_code === '1050' || tags.error === 'request timeout') {
      return 'request_timeout';
    }
    if (tags.error_code === '1502') {
      return 'bad_gateway';
    }
    if (tags.status === '502') {
      return 'server_error_502';
    }
    if (tags.status === '500') {
      return 'server_error_500';
    }
    if (tags.status === '404') {
      return 'not_found_404';
    }
    if (tags.status === '0') {
      return 'connection_failed';
    }
    if (tags.expected_response === 'false') {
      return 'unexpected_response';
    }
    return 'other_error';
  }

  /**
   * Process a metric with any data format
   */
  processMetric(metricName, metricData, timestamp) {
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
   * Analyze checks performance
   */
  analyzeChecks() {
    const checksByName = {};
    
    this.checks.forEach(check => {
      if (!checksByName[check.checkName]) {
        checksByName[check.checkName] = { total: 0, passed: 0 };
      }
      checksByName[check.checkName].total++;
      if (check.passed) {
        checksByName[check.checkName].passed++;
      }
    });

    const checkResults = Object.entries(checksByName).map(([name, stats]) => ({
      name: name || 'unnamed_check',
      total: stats.total,
      passed: stats.passed,
      failed: stats.total - stats.passed,
      successRate: stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0.0'
    }));

    return checkResults.sort((a, b) => parseFloat(a.successRate) - parseFloat(b.successRate));
  }

  /**
   * Calculate request rate and timeline data
   */
  calculateRequestRate() {
    const totalRequests = this.metrics.http_reqs?.count || 0;
    const testDurationMs = this.testEndTime - this.testStartTime;
    const testDurationSec = testDurationMs / 1000;
    
    return {
      totalRequests,
      testDurationSec: testDurationSec.toFixed(1),
      requestsPerSecond: testDurationSec > 0 ? (totalRequests / testDurationSec).toFixed(2) : '0.00',
      testDurationMin: (testDurationSec / 60).toFixed(1)
    };
  }

  /**
   * Generate comprehensive summary
   */
  generateSummary() {
    // Calculate basic metrics
    const calculatedMetrics = {};
    
    for (const [metricName, metricData] of Object.entries(this.metrics)) {
      if (metricData.values && metricData.values.length > 0) {
        const stats = this.calculateStats(metricData.values);
        calculatedMetrics[metricName] = {
          count: metricData.count,
          rate: metricData.rate,
          ...stats
        };
      } else {
        calculatedMetrics[metricName] = {
          count: metricData.count || 0,
          rate: metricData.rate || 0,
          avg: 0, min: 0, max: 0, p90: 0, p95: 0, p99: 0
        };
      }
    }
    
    // Ensure we have at least some data
    const totalRequests = calculatedMetrics.http_reqs?.count || 0;
    const totalErrors = this.errors.length; // Count of actual failures (where value = 1)
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    
    // Calculate performance metrics
    const rateData = this.calculateRequestRate();
    const checkResults = this.analyzeChecks();
    
    // Get top error types
    const topErrors = Object.entries(this.errorsByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type, count]) => ({
        type: type,
        count: count,
        percentage: totalErrors > 0 ? ((count / totalErrors) * 100).toFixed(1) : '0.0'
      }));

    // Create a comprehensive summary
    const comprehensiveSummary = {
      metadata: {
        totalFiles: this.totalFiles,
        processedFiles: this.processedFiles,
        totalLines: this.totalLines,
        validLines: this.validLines,
        totalErrors: this.errors.length,
        mergeTimestamp: new Date().toISOString(),
        testStartTime: new Date(this.testStartTime).toISOString(),
        testEndTime: new Date(this.testEndTime).toISOString()
      },
      testConfiguration: this.testConfiguration,
      summary: {
        totalRequests: totalRequests,
        totalErrors: totalErrors,
        errorRate: errorRate.toFixed(2) + '%',
        avgResponseTime: (calculatedMetrics.http_req_duration?.avg || 0).toFixed(2) + 'ms',
        p95ResponseTime: (calculatedMetrics.http_req_duration?.p95 || 0).toFixed(2) + 'ms',
        p99ResponseTime: (calculatedMetrics.http_req_duration?.p99 || 0).toFixed(2) + 'ms',
        requestsPerSecond: rateData.requestsPerSecond,
        testDuration: rateData.testDurationMin + ' minutes',
        totalIterations: calculatedMetrics.iterations?.count || 0,
        totalChecks: this.checks.length,
        dataReceived: this.formatBytes(calculatedMetrics.data_received?.count || 0),
        dataSent: this.formatBytes(calculatedMetrics.data_sent?.count || 0)
      },
      performance: {
        httpReqDuration: {
          avg: (calculatedMetrics.http_req_duration?.avg || 0).toFixed(2),
          min: (calculatedMetrics.http_req_duration?.min || 0).toFixed(2),
          max: (calculatedMetrics.http_req_duration?.max || 0).toFixed(2),
          p90: (calculatedMetrics.http_req_duration?.p90 || 0).toFixed(2),
          p95: (calculatedMetrics.http_req_duration?.p95 || 0).toFixed(2),
          p99: (calculatedMetrics.http_req_duration?.p99 || 0).toFixed(2)
        },
        iterationDuration: {
          avg: (calculatedMetrics.iteration_duration?.avg || 0).toFixed(2),
          p95: (calculatedMetrics.iteration_duration?.p95 || 0).toFixed(2)
        },
        thresholdResults: [
          {
            name: "http_req_duration p(95)",
            condition: "< 10000 ms",
            value: (calculatedMetrics.http_req_duration?.p95 || 0).toFixed(2) + " ms",
            status: (calculatedMetrics.http_req_duration?.p95 || 0) < 10000 ? "✅ Pass" : "❌ Fail"
          },
          {
            name: "http_req_failed rate",
            condition: "< 40%",
            value: errorRate.toFixed(2) + "%",
            status: errorRate < 40 ? "✅ Pass" : "❌ Fail"
          }
        ]
      },
      checks: {
        total: this.checks.length,
        results: checkResults,
        summary: {
          totalPassed: checkResults.reduce((sum, check) => sum + check.passed, 0),
          totalFailed: checkResults.reduce((sum, check) => sum + check.failed, 0),
          overallSuccessRate: checkResults.length > 0 ? 
            (checkResults.reduce((sum, check) => sum + parseFloat(check.successRate) * check.total, 0) / 
             checkResults.reduce((sum, check) => sum + check.total, 0)).toFixed(1) : '0.0'
        }
      },
      errors: {
        total: this.errors.length,
        byType: topErrors,
        byStatus: this.requestsByStatus,
        samples: this.errors.slice(0, 20).map(error => ({
          timestamp: error.timestamp,
          type: error.errorType,
          status: error.statusCode,
          method: error.method,
          url: error.url ? error.url.substring(0, 100) : 'unknown',
          error: error.error
        }))
      },
      metrics: calculatedMetrics
    };
    
    return comprehensiveSummary;
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    
    return {
      success: true,
      outputFile: outputFile,
      summary: summary.summary,
      metadata: summary.metadata
    };
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
    .then((result) => {
      console.log('\n📊 Final Summary:');
      console.log(`- Total Requests: ${result.summary.totalRequests.toLocaleString()}`);
      console.log(`- Total Errors: ${result.summary.totalErrors.toLocaleString()}`);
      console.log(`- Error Rate: ${result.summary.errorRate}`);
      console.log(`- Avg Response Time: ${result.summary.avgResponseTime}`);
      console.log(`- P95 Response Time: ${result.summary.p95ResponseTime}`);
      console.log(`- Requests/Second: ${result.summary.requestsPerSecond}`);
      console.log(`- Test Duration: ${result.summary.testDuration}`);
      console.log('\n✅ Merge completed successfully!');
    })
    .catch((error) => {
      console.error('❌ Merge failed:', error);
      process.exit(1);
    });
}

module.exports = { mergeLargeResults }; 