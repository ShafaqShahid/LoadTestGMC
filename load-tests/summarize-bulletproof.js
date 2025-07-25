#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 🛡️ BULLETPROOF LOAD TEST SUMMARY GENERATOR
 * 
 * Creates detailed HTML reports with error analysis
 * Never fails, always produces valid output
 */

class BulletproofLoadTestSummarizer {
  constructor() {
    this.template = this.getHTMLTemplate();
  }

  /**
   * Generate comprehensive summary from merged results - bulletproof
   */
  async generateSummary(inputFile, outputFile) {
    console.log(`📊 Generating bulletproof summary from: ${inputFile}`);
    
    if (!fs.existsSync(inputFile)) {
      throw new Error(`Input file not found: ${inputFile}`);
    }

    try {
      const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
      const html = this.generateHTML(data);
      
      fs.writeFileSync(outputFile, html);
      console.log(`✅ Summary generated: ${outputFile}`);
      
      return {
        inputFile,
        outputFile,
        summary: data.summary || {}
      };
    } catch (error) {
      console.error('❌ Error reading input file, creating fallback summary:', error.message);
      
      // Create a fallback summary if the input file is corrupted
      const fallbackData = this.createFallbackData();
      const html = this.generateHTML(fallbackData);
      
      fs.writeFileSync(outputFile, html);
      console.log(`✅ Fallback summary generated: ${outputFile}`);
      
      return {
        inputFile,
        outputFile,
        summary: fallbackData.summary
      };
    }
  }

  /**
   * Create fallback data if input file is corrupted
   */
  createFallbackData() {
    return {
      metadata: {
        totalFiles: 0,
        processedFiles: 0,
        totalLines: 0,
        validLines: 0,
        totalErrors: 0,
        mergeTimestamp: new Date().toISOString(),
        note: "Fallback data - input file was corrupted"
      },
      summary: {
        totalRequests: 0,
        totalErrors: 0,
        errorRate: "0.00%",
        avgResponseTime: "0.00ms",
        p95ResponseTime: "0.00ms",
        p99ResponseTime: "0.00ms",
        requestsPerSecond: "0.00",
        totalIterations: 0
      },
      metrics: {},
      errors: {
        total: 0,
        samples: []
      }
    };
  }

  /**
   * Generate HTML report - bulletproof
   */
  generateHTML(data) {
    // Ensure all required properties exist with safe defaults
    const summary = data.summary || {};
    const errors = data.errors || { total: 0, samples: [] };
    const performance = data.performance || {};
    const metadata = data.metadata || {};

    const errorChartData = this.generateErrorChartData(errors);
    const performanceChartData = this.generatePerformanceChartData(performance);
    const timelineData = this.generateTimelineData(errors);

    return this.template
      .replace('{{TITLE}}', 'Load Test Summary Report')
      .replace('{{TIMESTAMP}}', new Date().toLocaleString())
      .replace('{{METADATA}}', this.generateMetadataHTML(metadata))
      .replace('{{SUMMARY}}', this.generateSummaryHTML(summary))
      .replace('{{ERRORS}}', this.generateErrorsHTML(errors))
      .replace('{{PERFORMANCE}}', this.generatePerformanceHTML(performance))
      .replace('{{ERROR_CHART_DATA}}', JSON.stringify(errorChartData))
      .replace('{{PERFORMANCE_CHART_DATA}}', JSON.stringify(performanceChartData))
      .replace('{{TIMELINE_DATA}}', JSON.stringify(timelineData));
  }

  /**
   * Generate metadata HTML - bulletproof
   */
  generateMetadataHTML(metadata) {
    const processedFiles = metadata.processedFiles || 0;
    const totalFiles = metadata.totalFiles || 0;
    const totalLines = metadata.totalLines || 0;
    const validLines = metadata.validLines || 0;
    const mergeTimestamp = metadata.mergeTimestamp || new Date().toISOString();
    const note = metadata.note || '';

    return `
      <div class="metadata-section">
        <h3>📋 Test Metadata</h3>
        <div class="metadata-grid">
          <div class="metadata-item">
            <span class="label">Files Processed:</span>
            <span class="value">${processedFiles}/${totalFiles}</span>
          </div>
          <div class="metadata-item">
            <span class="label">Total Lines:</span>
            <span class="value">${totalLines.toLocaleString()}</span>
          </div>
          <div class="metadata-item">
            <span class="label">Valid Lines:</span>
            <span class="value">${validLines.toLocaleString()}</span>
          </div>
          <div class="metadata-item">
            <span class="label">Merge Timestamp:</span>
            <span class="value">${new Date(mergeTimestamp).toLocaleString()}</span>
          </div>
          ${note ? `<div class="metadata-item"><span class="label">Note:</span><span class="value">${note}</span></div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Generate summary HTML - bulletproof
   */
  generateSummaryHTML(summary) {
    const totalRequests = summary.totalRequests || 0;
    const totalErrors = summary.totalErrors || 0;
    const errorRate = summary.errorRate || "0.00%";
    const avgResponseTime = summary.avgResponseTime || "0.00ms";
    const p95ResponseTime = summary.p95ResponseTime || "0.00ms";
    const p99ResponseTime = summary.p99ResponseTime || "0.00ms";
    const requestsPerSecond = summary.requestsPerSecond || "0.00";
    const totalIterations = summary.totalIterations || 0;

    const errorRateClass = parseFloat(errorRate) > 5 ? 'error-high' : 
                          parseFloat(errorRate) > 1 ? 'error-medium' : 'error-low';

    return `
      <div class="summary-section">
        <h3>📈 Test Summary</h3>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="card-header">Total Requests</div>
            <div class="card-value">${totalRequests.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">Total Errors</div>
            <div class="card-value">${totalErrors.toLocaleString()}</div>
          </div>
          <div class="summary-card ${errorRateClass}">
            <div class="card-header">Error Rate</div>
            <div class="card-value">${errorRate}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">Avg Response Time</div>
            <div class="card-value">${avgResponseTime}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">P95 Response Time</div>
            <div class="card-value">${p95ResponseTime}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">P99 Response Time</div>
            <div class="card-value">${p99ResponseTime}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">Requests/Second</div>
            <div class="card-value">${requestsPerSecond}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">Total Iterations</div>
            <div class="card-value">${totalIterations.toLocaleString()}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate errors HTML - bulletproof
   */
  generateErrorsHTML(errors) {
    const errorCount = errors?.total || 0;
    
    if (errorCount === 0) {
      return `
        <div class="errors-section">
          <h3>✅ No Errors Detected</h3>
          <p>Excellent! No errors were found during the load test.</p>
        </div>
      `;
    }

    // Handle new format from robust merge
    let topErrorsHTML = '';
    if (errors.samples && errors.samples.length > 0) {
      topErrorsHTML = errors.samples.map(error => `
        <div class="error-item">
          <div class="error-type">${error.tags?.error_code || error.tags?.status || 'timeout'}</div>
          <div class="error-count">1</div>
          <div class="error-percentage">${((1 / errorCount) * 100).toFixed(2)}%</div>
        </div>
      `).join('');
    }

    return `
      <div class="errors-section">
        <h3>❌ Error Analysis</h3>
        <div class="error-summary">
          <div class="error-total">
            <span class="label">Total Errors:</span>
            <span class="value">${errorCount.toLocaleString()}</span>
          </div>
        </div>
        
        <div class="error-breakdown">
          <h4>Error Samples</h4>
          <div class="error-list">
            ${topErrorsHTML}
          </div>
        </div>
        
        <div class="error-charts">
          <div class="chart-container">
            <canvas id="errorChart"></canvas>
          </div>
          <div class="chart-container">
            <canvas id="timelineChart"></canvas>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate performance HTML - bulletproof
   */
  generatePerformanceHTML(performance) {
    if (!performance || Object.keys(performance).length === 0) {
      return `
        <div class="performance-section">
          <h3>⚠️ No Performance Data Available</h3>
          <p>Performance data could not be extracted from the test results.</p>
        </div>
      `;
    }

    const safeFormat = (value) => {
      if (value === undefined || value === null || isNaN(value)) return "0.00";
      return typeof value === 'number' ? value.toFixed(2) : value.toString();
    };

    return `
      <div class="performance-section">
        <h3>⚡ Performance Statistics</h3>
        <div class="performance-grid">
          <div class="performance-card">
            <div class="card-header">Minimum</div>
            <div class="card-value">${safeFormat(performance.min)}ms</div>
          </div>
          <div class="performance-card">
            <div class="card-header">Maximum</div>
            <div class="card-value">${safeFormat(performance.max)}ms</div>
          </div>
          <div class="performance-card">
            <div class="card-header">Median</div>
            <div class="card-value">${safeFormat(performance.median)}ms</div>
          </div>
          <div class="performance-card">
            <div class="card-header">P90</div>
            <div class="card-value">${safeFormat(performance.p90)}ms</div>
          </div>
          <div class="performance-card">
            <div class="card-header">P95</div>
            <div class="card-value">${safeFormat(performance.p95)}ms</div>
          </div>
          <div class="performance-card">
            <div class="card-header">P99</div>
            <div class="card-value">${safeFormat(performance.p99)}ms</div>
          </div>
          <div class="performance-card">
            <div class="card-header">Average</div>
            <div class="card-value">${safeFormat(performance.avg)}ms</div>
          </div>
        </div>
        
        <div class="performance-chart">
          <canvas id="performanceChart"></canvas>
        </div>
      </div>
    `;
  }

  /**
   * Generate error chart data - bulletproof
   */
  generateErrorChartData(errors) {
    const errorCount = errors?.total || 0;
    if (errorCount === 0) return { labels: [], data: [] };

    // Handle new format from robust merge
    if (errors.samples && errors.samples.length > 0) {
      const errorTypes = {};
      errors.samples.forEach(error => {
        const type = error.tags?.error_code || error.tags?.status || 'timeout';
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      });
      
      const topErrors = Object.entries(errorTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
      
      return {
        labels: topErrors.map(([type]) => type),
        data: topErrors.map(([, count]) => count),
        percentages: topErrors.map(([, count]) => ((count / errorCount) * 100).toFixed(2))
      };
    }
    
    return { labels: [], data: [] };
  }

  /**
   * Generate performance chart data - bulletproof
   */
  generatePerformanceChartData(performance) {
    if (!performance || Object.keys(performance).length === 0) return {};

    const safeValue = (value) => value !== undefined && !isNaN(value) ? value : 0;

    return {
      labels: ['Min', 'P25', 'Median', 'P75', 'P90', 'P95', 'P99', 'Max'],
      data: [
        safeValue(performance.min),
        safeValue(performance.p25 || performance.min),
        safeValue(performance.median),
        safeValue(performance.p75 || performance.max),
        safeValue(performance.p90),
        safeValue(performance.p95),
        safeValue(performance.p99),
        safeValue(performance.max)
      ]
    };
  }

  /**
   * Generate timeline data - bulletproof
   */
  generateTimelineData(errors) {
    // Handle new format from robust merge
    if (errors?.samples && errors.samples.length > 0) {
      const timeline = {};
      errors.samples.forEach(error => {
        if (error.timestamp) {
          const minute = Math.floor(error.timestamp / 60000);
          timeline[minute] = (timeline[minute] || 0) + 1;
        }
      });
      
      const sortedTimeline = Object.entries(timeline)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .slice(0, 20); // Show last 20 minutes

      return {
        labels: sortedTimeline.map(([minute]) => `Min ${minute}`),
        data: sortedTimeline.map(([, count]) => count)
      };
    }
    
    return { labels: [], data: [] };
  }

  /**
   * Get HTML template
   */
  getHTMLTemplate() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .section {
            background: white;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 25px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .section h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        
        .metadata-grid, .summary-grid, .performance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .metadata-item, .summary-card, .performance-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .card-header {
            font-weight: bold;
            color: #495057;
            margin-bottom: 8px;
        }
        
        .card-value {
            font-size: 1.2em;
            color: #2c3e50;
            font-weight: 600;
        }
        
        .label {
            font-weight: bold;
            color: #495057;
        }
        
        .value {
            color: #2c3e50;
            margin-left: 10px;
        }
        
        .error-high { border-left-color: #e74c3c; }
        .error-medium { border-left-color: #f39c12; }
        .error-low { border-left-color: #27ae60; }
        
        .error-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 10px;
            margin-top: 15px;
        }
        
        .error-item {
            background: #fff5f5;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #e74c3c;
        }
        
        .error-type {
            font-weight: bold;
            color: #c53030;
        }
        
        .error-count {
            color: #2d3748;
            margin-top: 5px;
        }
        
        .error-percentage {
            color: #718096;
            font-size: 0.9em;
        }
        
        .chart-container {
            margin-top: 20px;
            height: 300px;
        }
        
        .performance-chart {
            margin-top: 20px;
            height: 400px;
        }
        
        @media (max-width: 768px) {
            .container { padding: 10px; }
            .header h1 { font-size: 2em; }
            .metadata-grid, .summary-grid, .performance-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{TITLE}}</h1>
            <p>Generated on {{TIMESTAMP}}</p>
        </div>
        
        {{METADATA}}
        {{SUMMARY}}
        {{ERRORS}}
        {{PERFORMANCE}}
    </div>
    
    <script>
        // Error Chart
        const errorCtx = document.getElementById('errorChart');
        if (errorCtx) {
            const errorData = {{ERROR_CHART_DATA}};
            if (errorData.labels.length > 0) {
                new Chart(errorCtx, {
                    type: 'doughnut',
                    data: {
                        labels: errorData.labels,
                        datasets: [{
                            data: errorData.data,
                            backgroundColor: [
                                '#e74c3c', '#f39c12', '#f1c40f', '#27ae60',
                                '#3498db', '#9b59b6', '#e67e22', '#1abc9c',
                                '#34495e', '#95a5a6'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' },
                            title: { display: true, text: 'Error Distribution' }
                        }
                    }
                });
            }
        }
        
        // Timeline Chart
        const timelineCtx = document.getElementById('timelineChart');
        if (timelineCtx) {
            const timelineData = {{TIMELINE_DATA}};
            if (timelineData.labels.length > 0) {
                new Chart(timelineCtx, {
                    type: 'line',
                    data: {
                        labels: timelineData.labels,
                        datasets: [{
                            label: 'Errors per Minute',
                            data: timelineData.data,
                            borderColor: '#e74c3c',
                            backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: { display: true, text: 'Error Timeline' }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
        }
        
        // Performance Chart
        const perfCtx = document.getElementById('performanceChart');
        if (perfCtx) {
            const perfData = {{PERFORMANCE_CHART_DATA}};
            if (perfData.labels && perfData.labels.length > 0) {
                new Chart(perfCtx, {
                    type: 'bar',
                    data: {
                        labels: perfData.labels,
                        datasets: [{
                            label: 'Response Time (ms)',
                            data: perfData.data,
                            backgroundColor: 'rgba(102, 126, 234, 0.8)',
                            borderColor: '#667eea',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: { display: true, text: 'Response Time Percentiles' }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
        }
    </script>
</body>
</html>`;
  }
}

/**
 * Main function
 */
async function generateSummary(inputFile, outputFile) {
  const summarizer = new BulletproofLoadTestSummarizer();
  return await summarizer.generateSummary(inputFile, outputFile);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node summarize-bulletproof.js <input-file> <output-file>');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1];
  
  generateSummary(inputFile, outputFile)
    .then(result => {
      console.log('📊 Bulletproof summary generated successfully!');
      console.log(`📁 Output: ${result.outputFile}`);
      console.log(`📈 Total Requests: ${result.summary.totalRequests || 0}`);
      console.log(`❌ Total Errors: ${result.summary.totalErrors || 0}`);
      console.log(`📊 Error Rate: ${result.summary.errorRate || '0.00%'}`);
    })
    .catch(error => {
      console.error('❌ Summary generation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { generateSummary, BulletproofLoadTestSummarizer }; 