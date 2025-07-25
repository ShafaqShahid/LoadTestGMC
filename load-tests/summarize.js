const fs = require('fs');
const path = require('path');

/**
 * 📊 COMPREHENSIVE LOAD TEST SUMMARY GENERATOR
 * 
 * Creates detailed HTML reports with error analysis
 * Handles large datasets efficiently
 */

class LoadTestSummarizer {
  constructor() {
    this.template = this.getHTMLTemplate();
  }

  /**
   * Generate comprehensive summary from merged results
   */
  async generateSummary(inputFile, outputFile) {
    console.log(`📊 Generating summary from: ${inputFile}`);
    
    if (!fs.existsSync(inputFile)) {
      throw new Error(`Input file not found: ${inputFile}`);
    }

    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const html = this.generateHTML(data);
    
    fs.writeFileSync(outputFile, html);
    console.log(`✅ Summary generated: ${outputFile}`);
    
    return {
      inputFile,
      outputFile,
      summary: data.summary
    };
  }

  /**
   * Generate HTML report
   */
  generateHTML(data) {
    const summary = data.summary;
    const errors = data.errors;
    const performance = data.performance;
    const metadata = data.metadata;

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
   * Generate metadata HTML
   */
  generateMetadataHTML(metadata) {
    return `
      <div class="metadata-section">
        <h3>📋 Test Metadata</h3>
        <div class="metadata-grid">
          <div class="metadata-item">
            <span class="label">Files Processed:</span>
            <span class="value">${metadata.processedFiles}/${metadata.totalFiles}</span>
          </div>
          <div class="metadata-item">
            <span class="label">Total Data Points:</span>
            <span class="value">${metadata.totalDataPoints.toLocaleString()}</span>
          </div>
          <div class="metadata-item">
            <span class="label">Merge Timestamp:</span>
            <span class="value">${new Date(metadata.mergeTimestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate summary HTML
   */
  generateSummaryHTML(summary) {
    const errorRateClass = parseFloat(summary.errorRate) > 5 ? 'error-high' : 
                          parseFloat(summary.errorRate) > 1 ? 'error-medium' : 'error-low';

    return `
      <div class="summary-section">
        <h3>📈 Test Summary</h3>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="card-header">Total Requests</div>
            <div class="card-value">${summary.totalRequests.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">Total Errors</div>
            <div class="card-value error">${summary.totalErrors.toLocaleString()}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">Error Rate</div>
            <div class="card-value ${errorRateClass}">${summary.errorRate}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">Avg Response Time</div>
            <div class="card-value">${summary.avgResponseTime}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">P95 Response Time</div>
            <div class="card-value">${summary.p95ResponseTime}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">P99 Response Time</div>
            <div class="card-value">${summary.p99ResponseTime}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">Requests/Second</div>
            <div class="card-value">${summary.requestsPerSecond}</div>
          </div>
          <div class="summary-card">
            <div class="card-header">Total Iterations</div>
            <div class="card-value">${summary.totalIterations.toLocaleString()}</div>
          </div>
        </div>
        
        <div class="data-transfer">
          <h4>📊 Data Transfer</h4>
          <div class="transfer-grid">
            <div class="transfer-item">
              <span class="label">Data Received:</span>
              <span class="value">${summary.dataTransferred.received}</span>
            </div>
            <div class="transfer-item">
              <span class="label">Data Sent:</span>
              <span class="value">${summary.dataTransferred.sent}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate errors HTML
   */
  generateErrorsHTML(errors) {
    // Handle both old and new error formats
    const errorCount = errors?.total || errors?.totalErrors || 0;
    
    if (!errors || errorCount === 0) {
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
    } else if (errors.topErrors && errors.topErrors.length > 0) {
      // Handle old format
      topErrorsHTML = errors.topErrors.map(error => `
        <div class="error-item">
          <div class="error-type">${error.type}</div>
          <div class="error-count">${error.count.toLocaleString()}</div>
          <div class="error-percentage">${error.percentage}</div>
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
   * Generate performance HTML
   */
  generatePerformanceHTML(performance) {
    if (!performance || Object.keys(performance).length === 0) {
      return `
        <div class="performance-section">
          <h3>⚠️ No Performance Data Available</h3>
        </div>
      `;
    }

    return `
      <div class="performance-section">
        <h3>⚡ Performance Statistics</h3>
        <div class="performance-grid">
          <div class="performance-card">
            <div class="card-header">Minimum</div>
            <div class="card-value">${performance.min.toFixed(2)}ms</div>
          </div>
          <div class="performance-card">
            <div class="card-header">Maximum</div>
            <div class="card-value">${performance.max.toFixed(2)}ms</div>
          </div>
          <div class="performance-card">
            <div class="card-header">Median</div>
            <div class="card-value">${performance.median.toFixed(2)}ms</div>
          </div>
          <div class="performance-card">
            <div class="card-header">P90</div>
            <div class="card-value">${performance.p90.toFixed(2)}ms</div>
          </div>
          <div class="performance-card">
            <div class="card-header">P95</div>
            <div class="card-value">${performance.p95.toFixed(2)}ms</div>
          </div>
          <div class="performance-card">
            <div class="card-header">P99</div>
            <div class="card-value">${performance.p99.toFixed(2)}ms</div>
          </div>
          <div class="performance-card">
            <div class="card-header">Average</div>
            <div class="card-value">${performance.avg.toFixed(2)}ms</div>
          </div>
        </div>
        
        <div class="performance-chart">
          <canvas id="performanceChart"></canvas>
        </div>
      </div>
    `;
  }

  /**
   * Generate error chart data
   */
  generateErrorChartData(errors) {
    const errorCount = errors?.total || errors?.totalErrors || 0;
    if (!errors || errorCount === 0) return { labels: [], data: [] };

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
    
    // Handle old format
    if (errors.topErrors && errors.topErrors.length > 0) {
      const topErrors = errors.topErrors.slice(0, 10);
      return {
        labels: topErrors.map(e => e.type),
        data: topErrors.map(e => e.count),
        percentages: topErrors.map(e => parseFloat(e.percentage))
      };
    }
    
    return { labels: [], data: [] };
  }

  /**
   * Generate performance chart data
   */
  generatePerformanceChartData(performance) {
    if (!performance || Object.keys(performance).length === 0) return {};

    return {
      labels: ['Min', 'P25', 'Median', 'P75', 'P90', 'P95', 'P99', 'Max'],
      data: [
        performance.min,
        performance.p25 || performance.min,
        performance.median,
        performance.p75 || performance.max,
        performance.p90,
        performance.p95,
        performance.p99,
        performance.max
      ]
    };
  }

  /**
   * Generate timeline data
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
    
    // Handle old format
    if (errors?.errorTimeline) {
      const timeline = Object.entries(errors.errorTimeline)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .slice(0, 20); // Show last 20 minutes

      return {
        labels: timeline.map(([minute]) => `Min ${minute}`),
        data: timeline.map(([, count]) => count)
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
        
        .header .timestamp {
            opacity: 0.9;
            font-size: 1.1em;
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
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }
        
        .metadata-grid, .summary-grid, .performance-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .metadata-item, .transfer-item {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        
        .summary-card, .performance-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            transition: transform 0.2s;
        }
        
        .summary-card:hover, .performance-card:hover {
            transform: translateY(-2px);
        }
        
        .card-header {
            font-size: 0.9em;
            opacity: 0.9;
            margin-bottom: 8px;
        }
        
        .card-value {
            font-size: 1.5em;
            font-weight: bold;
        }
        
        .error-high { color: #e74c3c; }
        .error-medium { color: #f39c12; }
        .error-low { color: #27ae60; }
        
        .error-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 10px;
        }
        
        .error-item {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 10px;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
            align-items: center;
        }
        
        .error-type {
            font-weight: bold;
            color: #e74c3c;
        }
        
        .error-count {
            text-align: center;
            font-weight: bold;
        }
        
        .error-percentage {
            text-align: center;
            color: #7f8c8d;
        }
        
        .chart-container {
            margin: 20px 0;
            height: 300px;
        }
        
        .data-transfer {
            background: #ecf0f1;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .transfer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .label {
            font-weight: bold;
            color: #2c3e50;
        }
        
        .value {
            color: #34495e;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
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
            <div class="timestamp">Generated on {{TIMESTAMP}}</div>
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
            new Chart(errorCtx, {
                type: 'doughnut',
                data: {
                    labels: errorData.labels,
                    datasets: [{
                        data: errorData.data,
                        backgroundColor: [
                            '#e74c3c', '#f39c12', '#f1c40f', '#2ecc71',
                            '#3498db', '#9b59b6', '#e67e22', '#1abc9c',
                            '#34495e', '#95a5a6'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Error Distribution'
                        }
                    }
                }
            });
        }

        // Timeline Chart
        const timelineCtx = document.getElementById('timelineChart');
        if (timelineCtx) {
            const timelineData = {{TIMELINE_DATA}};
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
                        title: {
                            display: true,
                            text: 'Error Timeline'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Performance Chart
        const perfCtx = document.getElementById('performanceChart');
        if (perfCtx) {
            const perfData = {{PERFORMANCE_CHART_DATA}};
            new Chart(perfCtx, {
                type: 'bar',
                data: {
                    labels: perfData.labels,
                    datasets: [{
                        label: 'Response Time (ms)',
                        data: perfData.data,
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Response Time Distribution'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
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
  const summarizer = new LoadTestSummarizer();
  return await summarizer.generateSummary(inputFile, outputFile);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.log('Usage: node summarize.js <input-file> <output-file>');
    process.exit(1);
  }
  
  const [inputFile, outputFile] = args;
  
  generateSummary(inputFile, outputFile)
    .then(result => {
      console.log('📊 Summary generated successfully!');
      console.log(`📁 Output: ${result.outputFile}`);
      console.log(`📈 Total Requests: ${result.summary.totalRequests.toLocaleString()}`);
      console.log(`❌ Total Errors: ${result.summary.totalErrors.toLocaleString()}`);
      console.log(`📊 Error Rate: ${result.summary.errorRate}`);
    })
    .catch(error => {
      console.error('❌ Summary generation failed:', error.message);
      process.exit(1);
    });
}

module.exports = { generateSummary, LoadTestSummarizer }; 