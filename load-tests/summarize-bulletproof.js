#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 🎨 BULLETPROOF HTML SUMMARY GENERATOR
 * 
 * Creates comprehensive, professional HTML reports from k6 results
 */

class BulletproofSummarizer {
  constructor() {
    this.data = null;
  }

  /**
   * Generate comprehensive HTML summary
   */
  async generateSummary(inputFile, outputFile) {
    console.log(`📊 Generating bulletproof summary from: ${inputFile}`);
    
    try {
      // Read and parse the combined results
      const jsonData = fs.readFileSync(inputFile, 'utf8');
      this.data = JSON.parse(jsonData);
      
      // Generate the HTML content
      const htmlContent = this.generateHtmlContent();
      
      // Write HTML file
      fs.writeFileSync(outputFile, htmlContent);
      
      console.log(`✅ Summary generated: ${outputFile}`);
      return { 
        success: true, 
        outputFile: outputFile,
        summary: this.data.summary 
      };
      
    } catch (error) {
      console.error('❌ Summary generation failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate the complete HTML content
   */
  generateHtmlContent() {
    const summary = this.data.summary || {};
    const performance = this.data.performance || {};
    const checks = this.data.checks || {};
    const errors = this.data.errors || {};
    const testConfig = this.data.testConfiguration || {};
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test Summary Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .section {
            margin-bottom: 50px;
        }
        
        .section-title {
            font-size: 1.8em;
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #3498db;
            display: flex;
            align-items: center;
        }
        
        .section-title .icon {
            font-size: 1.2em;
            margin-right: 10px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .stat-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            border-left: 5px solid #3498db;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        
        .stat-value {
            font-size: 2.2em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .error-card {
            border-left-color: #e74c3c;
        }
        
        .success-card {
            border-left-color: #27ae60;
        }
        
        .warning-card {
            border-left-color: #f39c12;
        }
        
        .table-container {
            overflow-x: auto;
            margin: 20px 0;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
        }
        
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background: #34495e;
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 0.9em;
        }
        
        tr:hover {
            background: #f8f9fa;
        }
        
        .chart-container {
            position: relative;
            height: 400px;
            margin: 30px 0;
            background: white;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-pass {
            background: #d4edda;
            color: #155724;
        }
        
        .status-fail {
            background: #f8d7da;
            color: #721c24;
        }
        
        .config-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .config-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #3498db;
        }
        
        .config-title {
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .progress-bar {
            background: #ecf0f1;
            border-radius: 10px;
            overflow: hidden;
            height: 8px;
            margin: 5px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #27ae60, #2ecc71);
            transition: width 0.3s ease;
        }
        
        .error-progress {
            background: linear-gradient(90deg, #e74c3c, #c0392b);
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .error-details {
            background: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .metric-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .metric-label {
            font-weight: 600;
            color: #2c3e50;
        }
        
        .metric-value {
            font-family: 'Courier New', monospace;
            background: #f8f9fa;
            padding: 5px 10px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Load Test Summary Report</h1>
            <div class="subtitle">Distributed Load Testing Results - ${testConfig.environment || 'Unknown Environment'}</div>
            <div class="subtitle">Generated: ${new Date().toLocaleString()}</div>
        </div>
        
        <div class="content">
            ${this.generateTestConfigSection()}
            ${this.generateOverviewSection()}
            ${this.generatePerformanceSection()}
            ${this.generateThresholdsSection()}
            ${this.generateChecksSection()}
            ${this.generateErrorsSection()}
            ${this.generateChartsSection()}
        </div>
        
        <div class="footer">
            <p>Report generated automatically from k6 distributed load test results</p>
            <p>Test completed: ${this.data.metadata?.testEndTime ? new Date(this.data.metadata.testEndTime).toLocaleString() : 'Unknown'}</p>
        </div>
    </div>
    
    <script>
        ${this.generateChartScripts()}
    </script>
</body>
</html>`;
  }

  /**
   * Generate test configuration section
   */
  generateTestConfigSection() {
    const config = this.data.testConfiguration || {};
    
    return `
    <div class="section">
        <h2 class="section-title">
            <span class="icon">⚙️</span>
            Test Configuration
        </h2>
        
        <div class="config-grid">
            <div class="config-card">
                <div class="config-title">Load Configuration</div>
                <div class="metric-row">
                    <span class="metric-label">Total Users:</span>
                    <span class="metric-value">${config.totalUsers || 3000}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Users per Instance:</span>
                    <span class="metric-value">${config.usersPerInstance || 1000}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Test Duration:</span>
                    <span class="metric-value">${this.data.summary?.testDuration || config.duration}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Target Environment:</span>
                    <span class="metric-value">${config.environment || 'Staging'}</span>
                </div>
            </div>
            
            <div class="config-card">
                <div class="config-title">Performance Thresholds</div>
                <div class="metric-row">
                    <span class="metric-label">P95 Response Time:</span>
                    <span class="metric-value">${config.thresholds?.p95Duration || '< 10s'}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Error Rate:</span>
                    <span class="metric-value">${config.thresholds?.errorRate || '< 40%'}</span>
                </div>
            </div>
        </div>
        
        <div class="config-card">
            <div class="config-title">🔄 Load Pattern Phases</div>
            ${(config.phases || []).map(phase => `
                <div class="metric-row">
                    <span class="metric-label">${phase.name}:</span>
                    <span class="metric-value">${phase.users} - ${phase.description}</span>
                </div>
            `).join('')}
        </div>
    </div>`;
  }

  /**
   * Generate overview section
   */
  generateOverviewSection() {
    const summary = this.data.summary || {};
    
    return `
    <div class="section">
        <h2 class="section-title">
            <span class="icon">📈</span>
            Test Summary
        </h2>
        
        <div class="stats-grid">
            <div class="stat-card success-card">
                <div class="stat-value">${(summary.totalRequests || 0).toLocaleString()}</div>
                <div class="stat-label">Total Requests</div>
            </div>
            
            <div class="stat-card ${(parseFloat(summary.errorRate) || 0) > 40 ? 'error-card' : 'warning-card'}">
                <div class="stat-value">${(summary.totalErrors || 0).toLocaleString()}</div>
                <div class="stat-label">Total Errors</div>
            </div>
            
            <div class="stat-card ${(parseFloat(summary.errorRate) || 0) > 40 ? 'error-card' : 'success-card'}">
                <div class="stat-value">${summary.errorRate || '0.00%'}</div>
                <div class="stat-label">Error Rate</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-value">${summary.requestsPerSecond || '0'}</div>
                <div class="stat-label">Requests/Second</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-value">${(summary.totalIterations || 0).toLocaleString()}</div>
                <div class="stat-label">Total Iterations</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-value">${summary.testDuration || 'Unknown'}</div>
                <div class="stat-label">Test Duration</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-value">${summary.dataReceived || '0 B'}</div>
                <div class="stat-label">Data Received</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-value">${summary.dataSent || '0 B'}</div>
                <div class="stat-label">Data Sent</div>
            </div>
        </div>
    </div>`;
  }

  /**
   * Generate performance metrics section
   */
  generatePerformanceSection() {
    const performance = this.data.performance || {};
    const httpReq = performance.httpReqDuration || {};
    const iteration = performance.iterationDuration || {};
    
    return `
    <div class="section">
        <h2 class="section-title">
            <span class="icon">⚡</span>
            Performance Metrics
        </h2>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${httpReq.avg || '0'} ms</div>
                <div class="stat-label">Average Response Time</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-value">${httpReq.min || '0'} ms</div>
                <div class="stat-label">Min Response Time</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-value">${httpReq.max || '0'} ms</div>
                <div class="stat-label">Max Response Time</div>
            </div>
            
            <div class="stat-card warning-card">
                <div class="stat-value">${httpReq.p90 || '0'} ms</div>
                <div class="stat-label">P90 Response Time</div>
            </div>
            
            <div class="stat-card ${(parseFloat(httpReq.p95) || 0) > 10000 ? 'error-card' : 'success-card'}">
                <div class="stat-value">${httpReq.p95 || '0'} ms</div>
                <div class="stat-label">P95 Response Time</div>
            </div>
            
            <div class="stat-card error-card">
                <div class="stat-value">${httpReq.p99 || '0'} ms</div>
                <div class="stat-label">P99 Response Time</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-value">${iteration.avg || '0'} ms</div>
                <div class="stat-label">Avg Iteration Duration</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-value">${iteration.p95 || '0'} ms</div>
                <div class="stat-label">P95 Iteration Duration</div>
            </div>
        </div>
    </div>`;
  }

  /**
   * Generate thresholds section
   */
  generateThresholdsSection() {
    const performance = this.data.performance || {};
    const thresholds = performance.thresholdResults || [];
    
    return `
    <div class="section">
        <h2 class="section-title">
            <span class="icon">✅</span>
            Threshold Results
        </h2>
        
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Threshold</th>
                        <th>Condition</th>
                        <th>Actual Value</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${thresholds.map(threshold => `
                        <tr>
                            <td><strong>${threshold.name}</strong></td>
                            <td><code>${threshold.condition}</code></td>
                            <td><code>${threshold.value}</code></td>
                            <td><span class="status-badge ${threshold.status.includes('Pass') ? 'status-pass' : 'status-fail'}">${threshold.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    </div>`;
  }

  /**
   * Generate checks section
   */
  generateChecksSection() {
    const checks = this.data.checks || {};
    const checkResults = checks.results || [];
    const checkSummary = checks.summary || {};
    
    return `
    <div class="section">
        <h2 class="section-title">
            <span class="icon">🔍</span>
            Check Results
        </h2>
        
        <div class="stats-grid">
            <div class="stat-card success-card">
                <div class="stat-value">${(checkSummary.totalPassed || 0).toLocaleString()}</div>
                <div class="stat-label">Checks Passed</div>
            </div>
            
            <div class="stat-card error-card">
                <div class="stat-value">${(checkSummary.totalFailed || 0).toLocaleString()}</div>
                <div class="stat-label">Checks Failed</div>
            </div>
            
            <div class="stat-card">
                <div class="stat-value">${checkSummary.overallSuccessRate || '0.0'}%</div>
                <div class="stat-label">Overall Success Rate</div>
            </div>
        </div>
        
        ${checkResults.length > 0 ? `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Check Name</th>
                        <th>Total</th>
                        <th>Passed</th>
                        <th>Failed</th>
                        <th>Success Rate</th>
                        <th>Progress</th>
                    </tr>
                </thead>
                <tbody>
                    ${checkResults.map(check => `
                        <tr>
                            <td><strong>${check.name || 'Unnamed Check'}</strong></td>
                            <td>${check.total.toLocaleString()}</td>
                            <td style="color: #27ae60;">${check.passed.toLocaleString()}</td>
                            <td style="color: #e74c3c;">${check.failed.toLocaleString()}</td>
                            <td><strong>${check.successRate}%</strong></td>
                            <td>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${check.successRate}%"></div>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : '<p>No check data available.</p>'}
    </div>`;
  }

  /**
   * Generate errors section
   */
  generateErrorsSection() {
    const errors = this.data.errors || {};
    const topErrors = errors.byType || [];
    const statusCodes = errors.byStatus || {};
    const errorSamples = errors.samples || [];
    
    return `
    <div class="section">
        <h2 class="section-title">
            <span class="icon">❌</span>
            Error Analysis
        </h2>
        
        <div class="config-grid">
            <div class="error-details">
                <div class="config-title">🔥 Top Error Types</div>
                ${topErrors.length > 0 ? topErrors.map(error => `
                    <div class="metric-row">
                        <span class="metric-label">${error.type.replace(/_/g, ' ').toUpperCase()}:</span>
                        <span class="metric-value">${error.count.toLocaleString()} (${error.percentage}%)</span>
                    </div>
                `).join('') : '<p>No error type data available.</p>'}
            </div>
            
            <div class="error-details">
                <div class="config-title">📊 Status Code Distribution</div>
                ${Object.keys(statusCodes).length > 0 ? Object.entries(statusCodes)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([status, count]) => `
                    <div class="metric-row">
                        <span class="metric-label">HTTP ${status}:</span>
                        <span class="metric-value">${count.toLocaleString()}</span>
                    </div>
                `).join('') : '<p>No status code data available.</p>'}
            </div>
        </div>
        
        ${errorSamples.length > 0 ? `
        <div class="config-card">
            <div class="config-title">🔍 Error Samples (First 20)</div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Method</th>
                            <th>URL</th>
                            <th>Error Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${errorSamples.map(error => `
                            <tr>
                                <td>${new Date(error.timestamp).toLocaleTimeString()}</td>
                                <td><code>${error.type || 'unknown'}</code></td>
                                <td><code>${error.status || 'N/A'}</code></td>
                                <td><code>${error.method || 'N/A'}</code></td>
                                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${error.url || 'N/A'}</td>
                                <td>${error.error || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}
    </div>`;
  }

  /**
   * Generate charts section
   */
  generateChartsSection() {
    return `
    <div class="section">
        <h2 class="section-title">
            <span class="icon">📊</span>
            Performance Charts
        </h2>
        
        <div class="chart-container">
            <canvas id="responseTimeChart"></canvas>
        </div>
        
        <div class="chart-container">
            <canvas id="errorDistributionChart"></canvas>
        </div>
    </div>`;
  }

  /**
   * Generate chart scripts
   */
  generateChartScripts() {
    const performance = this.data.performance || {};
    const httpReq = performance.httpReqDuration || {};
    const errors = this.data.errors || {};
    const topErrors = (errors.byType || []).slice(0, 5);
    
    return `
    // Response Time Chart
    const responseCtx = document.getElementById('responseTimeChart').getContext('2d');
    new Chart(responseCtx, {
        type: 'bar',
        data: {
            labels: ['Average', 'P90', 'P95', 'P99', 'Max'],
            datasets: [{
                label: 'Response Time (ms)',
                data: [
                    ${httpReq.avg || 0},
                    ${httpReq.p90 || 0},
                    ${httpReq.p95 || 0},
                    ${httpReq.p99 || 0},
                    ${httpReq.max || 0}
                ],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(230, 126, 34, 0.8)',
                    'rgba(231, 76, 60, 0.8)'
                ],
                borderColor: [
                    'rgba(52, 152, 219, 1)',
                    'rgba(155, 89, 182, 1)',
                    'rgba(241, 196, 15, 1)',
                    'rgba(230, 126, 34, 1)',
                    'rgba(231, 76, 60, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Response Time Distribution',
                    font: { size: 16, weight: 'bold' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Time (ms)'
                    }
                }
            }
        }
    });
    
    // Error Distribution Chart
    const errorCtx = document.getElementById('errorDistributionChart').getContext('2d');
    new Chart(errorCtx, {
        type: 'doughnut',
        data: {
            labels: [${topErrors.map(e => `'${e.type.replace(/_/g, ' ')}'`).join(', ')}],
            datasets: [{
                data: [${topErrors.map(e => e.count).join(', ')}],
                backgroundColor: [
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(230, 126, 34, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(52, 152, 219, 0.8)'
                ],
                borderColor: [
                    'rgba(231, 76, 60, 1)',
                    'rgba(230, 126, 34, 1)',
                    'rgba(241, 196, 15, 1)',
                    'rgba(155, 89, 182, 1)',
                    'rgba(52, 152, 219, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Error Distribution by Type',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });`;
  }
}

/**
 * Main function for CLI usage
 */
async function generateSummary(inputFile, outputFile) {
  const summarizer = new BulletproofSummarizer();
  return await summarizer.generateSummary(inputFile, outputFile);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.log('Usage: node summarize-bulletproof.js <input-json> <output-html>');
    process.exit(1);
  }
  
  const [inputFile, outputFile] = args;
  
  generateSummary(inputFile, outputFile)
    .then((result) => {
      console.log('📊 Bulletproof summary generated successfully!');
      console.log(`📁 Output: ${result.outputFile}`);
      console.log(`📈 Total Requests: ${(result.summary.totalRequests || 0).toLocaleString()}`);
      console.log(`❌ Total Errors: ${(result.summary.totalErrors || 0).toLocaleString()}`);
      console.log(`📊 Error Rate: ${result.summary.errorRate || '0.00%'}`);
    })
    .catch((error) => {
      console.error('❌ Summary generation failed:', error);
      process.exit(1);
    });
}

module.exports = { generateSummary }; 