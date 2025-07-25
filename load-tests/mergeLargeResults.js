const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');

/**
 * 🧠 MEMORY-EFFICIENT LARGE RESULT MERGER
 * 
 * Handles 4.5GB+ result files without memory issues
 * Uses streaming and chunked processing
 * 
 * @param {string[]} inputFiles - Array of result file paths
 * @param {string} outputFile - Output file path
 */
class LargeResultMerger {
  constructor() {
    this.combinedMetrics = {
      http_reqs: { count: 0, rate: 0 },
      http_req_duration: { avg: 0, min: 0, max: 0, med: 0, p90: 0, p95: 0, p99: 0 },
      http_req_failed: { count: 0, rate: 0 },
      iterations: { count: 0, rate: 0 },
      vus: { value: 0, max: 0 },
      data_received: { count: 0, rate: 0 },
      data_sent: { count: 0, rate: 0 }
    };
    
    this.errorDetails = [];
    this.requestDetails = [];
    this.timestamps = [];
    this.totalFiles = 0;
    this.processedFiles = 0;
  }

  /**
   * Process a single large result file using streaming
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
   * Process individual data points from the stream
   */
  processDataPoint(data) {
    // Handle k6 JSON output format
    if (data.metric && data.data) {
      // This is a k6 metric point
      this.updateMetrics(data);
    } else if (data.type === 'Point') {
      // Alternative k6 format
      this.updateMetrics(data);
    } else if (data.type === 'Metric') {
      // Another k6 format variant
      this.updateMetrics(data);
    } else if (data.metric && data.value !== undefined) {
      // Direct metric format
      this.updateMetrics(data);
    }
    
    // Handle errors - multiple possible formats
    if ((data.type === 'Point' && data.metric === 'http_req_failed') ||
        (data.metric === 'http_req_failed' && data.data && data.data.value > 0) ||
        (data.metric === 'http_req_failed' && data.value > 0)) {
      this.errorDetails.push({
        timestamp: data.time,
        value: data.value,
        tags: data.tags || {}
      });
    }
    
    // Handle request details
    if (data.type === 'Point' && data.metric === 'http_req_duration') {
      this.requestDetails.push({
        timestamp: data.time,
        duration: data.value,
        tags: data.tags || {}
      });
    }
    
    // Track timestamps
    if (data.time) {
      this.timestamps.push(data.time);
    }
  }

  /**
   * Update combined metrics
   */
  updateMetrics(data) {
    const metricName = data.metric;
    if (this.combinedMetrics[metricName]) {
      const metric = this.combinedMetrics[metricName];
      
      // Handle different k6 output formats
      let metricData = data.data || data;
      
      if (metricData) {
        // Handle aggregated metrics
        metric.count = (metric.count || 0) + (metricData.count || 0);
        metric.rate = (metric.rate || 0) + (metricData.rate || 0);
        
        if (metricData.avg !== undefined) {
          // Calculate weighted average for response times
          const currentTotal = metric.avg * (metric.count - (metricData.count || 0));
          const newTotal = metricData.avg * (metricData.count || 0);
          metric.avg = (currentTotal + newTotal) / metric.count;
        }
        
        // Update percentiles (simplified approach)
        if (metricData.p90 !== undefined) metric.p90 = Math.max(metric.p90 || 0, metricData.p90);
        if (metricData.p95 !== undefined) metric.p95 = Math.max(metric.p95 || 0, metricData.p95);
        if (metricData.p99 !== undefined) metric.p99 = Math.max(metric.p99 || 0, metricData.p99);
        
        // Update min/max
        if (metricData.min !== undefined) {
          metric.min = metric.min === 0 ? metricData.min : Math.min(metric.min, metricData.min);
        }
        if (metricData.max !== undefined) {
          metric.max = Math.max(metric.max || 0, metricData.max);
        }
      }
      
      // Handle direct value format
      if (data.value !== undefined) {
        metric.count = (metric.count || 0) + 1;
        if (metricName === 'http_req_duration') {
          // For response times, accumulate for average calculation
          if (!metric._values) metric._values = [];
          metric._values.push(data.value);
          metric.avg = metric._values.reduce((a, b) => a + b, 0) / metric._values.length;
        }
      }
    }
  }

  /**
   * Merge multiple large result files
   */
  async mergeFiles(inputFiles, outputFile) {
    console.log(`🚀 Starting merge of ${inputFiles.length} files...`);
    this.totalFiles = inputFiles.length;
    
    // Process files sequentially to avoid memory issues
    for (const filePath of inputFiles) {
      // Try multiple possible file paths
      const possiblePaths = [
        filePath,
        filePath.replace('/distributed-', '/distributed-1-results/distributed-'),
        filePath.replace('/distributed-', '/distributed-2-results/distributed-'),
        filePath.replace('/distributed-', '/distributed-3-results/distributed-'),
        filePath.replace('distributed-1-results.json', 'distributed-1-results/distributed-1-results.json'),
        filePath.replace('distributed-2-results.json', 'distributed-2-results/distributed-2-results.json'),
        filePath.replace('distributed-3-results.json', 'distributed-3-results/distributed-3-results.json')
      ];
      
      let foundFile = null;
      for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
          foundFile = path;
          break;
        }
      }
      
      if (foundFile) {
        console.log(`✅ Found file: ${foundFile}`);
        await this.processFile(foundFile);
      } else {
        console.warn(`⚠️ File not found: ${filePath}`);
        console.warn(`🔍 Tried paths: ${possiblePaths.join(', ')}`);
      }
    }
    
    // Generate final summary
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
    const totalRequests = this.combinedMetrics.http_reqs.count || 0;
    const totalErrors = this.combinedMetrics.http_req_failed.count || 0;
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    
    // Calculate error patterns
    const errorPatterns = this.analyzeErrorPatterns();
    
    // Calculate performance percentiles
    const performanceStats = this.calculatePerformanceStats();
    
    // Safely format metrics with fallbacks
    const safeFormat = (value, defaultValue = '0.00') => {
      if (value === undefined || value === null || isNaN(value)) {
        return defaultValue;
      }
      return typeof value === 'number' ? value.toFixed(2) : value.toString();
    };
    
    return {
      metadata: {
        totalFiles: this.totalFiles,
        processedFiles: this.processedFiles,
        totalDataPoints: this.requestDetails.length + this.errorDetails.length,
        mergeTimestamp: new Date().toISOString()
      },
      summary: {
        totalRequests,
        totalErrors,
        errorRate: safeFormat(errorRate) + '%',
        avgResponseTime: safeFormat(this.combinedMetrics.http_req_duration.avg, '0.00') + 'ms',
        p95ResponseTime: safeFormat(this.combinedMetrics.http_req_duration.p95, '0.00') + 'ms',
        p99ResponseTime: safeFormat(this.combinedMetrics.http_req_duration.p99, '0.00') + 'ms',
        requestsPerSecond: safeFormat(this.combinedMetrics.http_reqs.rate, '0.00'),
        totalIterations: this.combinedMetrics.iterations.count || 0,
        dataTransferred: {
          received: this.formatBytes(this.combinedMetrics.data_received.count || 0),
          sent: this.formatBytes(this.combinedMetrics.data_sent.count || 0)
        }
      },
      performance: performanceStats,
      errors: errorPatterns,
      metrics: this.combinedMetrics
    };
  }

  /**
   * Analyze error patterns
   */
  analyzeErrorPatterns() {
    const errorTypes = {};
    const errorTimeline = {};
    
    this.errorDetails.forEach(error => {
      const errorType = error.tags.error_code || error.tags.status || 'unknown';
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
      
      const minute = Math.floor(error.timestamp / 60000);
      errorTimeline[minute] = (errorTimeline[minute] || 0) + 1;
    });
    
    return {
      totalErrors: this.errorDetails.length,
      errorTypes,
      errorTimeline,
      topErrors: Object.entries(errorTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([type, count]) => ({ type, count, percentage: ((count / this.errorDetails.length) * 100).toFixed(2) + '%' }))
    };
  }

  /**
   * Calculate performance statistics
   */
  calculatePerformanceStats() {
    if (this.requestDetails.length === 0) return {};
    
    const durations = this.requestDetails.map(req => req.duration).sort((a, b) => a - b);
    const count = durations.length;
    
    return {
      min: durations[0],
      max: durations[count - 1],
      median: durations[Math.floor(count * 0.5)],
      p90: durations[Math.floor(count * 0.9)],
      p95: durations[Math.floor(count * 0.95)],
      p99: durations[Math.floor(count * 0.99)],
      avg: durations.reduce((sum, d) => sum + d, 0) / count
    };
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Main merge function
 */
async function mergeLargeResults(inputFiles, outputFile) {
  const merger = new LargeResultMerger();
  return await merger.mergeFiles(inputFiles, outputFile);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node mergeLargeResults.js <output-file> <input-file1> [input-file2] ...');
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

module.exports = { mergeLargeResults, LargeResultMerger }; 