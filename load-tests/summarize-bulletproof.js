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
        
        .url-cell {
            max-width: 300px;
            word-break: break-all;
            font-size: 0.9em;
            line-height: 1.3;
        }
        
        .error-table {
            font-size: 0.9em;
        }
        
        .error-table th {
            font-size: 0.8em;
            padding: 12px 8px;
        }
        
        .error-table td {
            padding: 10px 8px;
            vertical-align: top;
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
         </div>
        
        <div class="footer">
            <p>Report generated automatically from k6 distributed load test results</p>
            <p>Test completed: ${this.data.metadata?.testEndTime ? new Date(this.data.metadata.testEndTime).toLocaleString() : 'Unknown'}</p>
        </div>
    </div>
    
         <script>
         // Charts removed per user request
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
    const errors = this.data.errors || {};
    const statusCodes = errors.byStatus || {};
    
    // Calculate accurate rates based on proper HTTP status categorization
    const successCodes = [200, 201, 202, 204, 206];
    const redirectCodes = [301, 302, 303, 307, 308];
    const errorCodes = [400, 401, 403, 404, 405, 408, 409, 410, 422, 429, 500, 501, 502, 503, 504, 505];
    
    let totalSuccess = 0;
    let totalRedirects = 0;
    let totalActualErrors = 0;
    let totalNetworkErrors = 0;
    
    Object.entries(statusCodes).forEach(([status, count]) => {
      const statusNum = parseInt(status);
      if (successCodes.includes(statusNum)) {
        totalSuccess += count;
      } else if (redirectCodes.includes(statusNum)) {
        totalRedirects += count;
      } else if (errorCodes.includes(statusNum)) {
        totalActualErrors += count;
      } else if (status === '0') {
        totalNetworkErrors += count;
      } else if (status === 'unknown') {
        totalActualErrors += count;
      }
    });
    
    const totalRequests = totalSuccess + totalRedirects + totalActualErrors + totalNetworkErrors;
    const successfulRequests = totalSuccess + totalRedirects;
    const allErrors = totalActualErrors + totalNetworkErrors;
    
    const actualSuccessRate = totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) : '0.00';
    const actualErrorRate = totalRequests > 0 ? ((allErrors / totalRequests) * 100).toFixed(2) : '0.00';
    
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
            
            <div class="stat-card success-card">
                <div class="stat-value">${successfulRequests.toLocaleString()}</div>
                <div class="stat-label">Successful Requests</div>
                <div style="font-size: 0.8em; margin-top: 5px; opacity: 0.8;">Success + Redirects</div>
            </div>
            
            <div class="stat-card ${parseFloat(actualErrorRate) > 40 ? 'error-card' : parseFloat(actualErrorRate) > 20 ? 'warning-card' : 'success-card'}">
                <div class="stat-value">${actualSuccessRate}%</div>
                <div class="stat-label">Actual Success Rate</div>
                <div style="font-size: 0.8em; margin-top: 5px; opacity: 0.8;">Including Redirects</div>
            </div>
            
            <div class="stat-card ${parseFloat(actualErrorRate) > 40 ? 'error-card' : parseFloat(actualErrorRate) > 20 ? 'warning-card' : 'success-card'}">
                <div class="stat-value">${allErrors.toLocaleString()}</div>
                <div class="stat-label">Actual Errors</div>
                <div style="font-size: 0.8em; margin-top: 5px; opacity: 0.8;">4xx/5xx + Network</div>
            </div>
            
            <div class="stat-card ${parseFloat(actualErrorRate) > 40 ? 'error-card' : parseFloat(actualErrorRate) > 20 ? 'warning-card' : 'success-card'}">
                <div class="stat-value">${actualErrorRate}%</div>
                <div class="stat-label">Actual Error Rate</div>
                <div style="font-size: 0.8em; margin-top: 5px; opacity: 0.8;">Excludes Redirects</div>
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
        
        <div class="config-card" style="margin-top: 30px; background: #f0f8ff; border-left-color: #3498db;">
            <div class="config-title">📊 HTTP Status Code Breakdown</div>
            <div class="metric-row">
                <span class="metric-label">✅ HTTP 2xx (Success):</span>
                <span class="metric-value">${totalSuccess.toLocaleString()} (${totalRequests > 0 ? ((totalSuccess / totalRequests) * 100).toFixed(1) : '0.0'}%)</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">🔄 HTTP 3xx (Redirects):</span>
                <span class="metric-value">${totalRedirects.toLocaleString()} (${totalRequests > 0 ? ((totalRedirects / totalRequests) * 100).toFixed(1) : '0.0'}%)</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">❌ HTTP 4xx/5xx (Errors):</span>
                <span class="metric-value">${totalActualErrors.toLocaleString()} (${totalRequests > 0 ? ((totalActualErrors / totalRequests) * 100).toFixed(1) : '0.0'}%)</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">🔌 Network Failures:</span>
                <span class="metric-value">${totalNetworkErrors.toLocaleString()} (${totalRequests > 0 ? ((totalNetworkErrors / totalRequests) * 100).toFixed(1) : '0.0'}%)</span>
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
    
    // Categorize status codes properly
    const successCodes = { '200': 0, '201': 0, '202': 0, '204': 0, '206': 0 };
    const redirectCodes = { '301': 0, '302': 0, '303': 0, '307': 0, '308': 0 };
    const clientErrorCodes = { '400': 0, '401': 0, '403': 0, '404': 0, '405': 0, '408': 0, '409': 0, '410': 0, '422': 0, '429': 0 };
    const serverErrorCodes = { '500': 0, '501': 0, '502': 0, '503': 0, '504': 0, '505': 0 };
    const networkErrorCodes = { '0': 0 };
    const unknownCodes = { 'unknown': 0 };
    
    // Categorize actual status codes
    Object.entries(statusCodes).forEach(([status, count]) => {
      if (successCodes.hasOwnProperty(status)) {
        successCodes[status] = count;
      } else if (redirectCodes.hasOwnProperty(status)) {
        redirectCodes[status] = count;
      } else if (clientErrorCodes.hasOwnProperty(status)) {
        clientErrorCodes[status] = count;
      } else if (serverErrorCodes.hasOwnProperty(status)) {
        serverErrorCodes[status] = count;
      } else if (networkErrorCodes.hasOwnProperty(status)) {
        networkErrorCodes[status] = count;
      } else if (unknownCodes.hasOwnProperty(status)) {
        unknownCodes[status] = count;
      }
    });
    
    // Calculate totals
    const totalSuccess = Object.values(successCodes).reduce((sum, count) => sum + count, 0);
    const totalRedirects = Object.values(redirectCodes).reduce((sum, count) => sum + count, 0);
    const totalClientErrors = Object.values(clientErrorCodes).reduce((sum, count) => sum + count, 0);
    const totalServerErrors = Object.values(serverErrorCodes).reduce((sum, count) => sum + count, 0);
    const totalNetworkErrors = Object.values(networkErrorCodes).reduce((sum, count) => sum + count, 0);
    const totalUnknownErrors = Object.values(unknownCodes).reduce((sum, count) => sum + count, 0);
    
    const totalRequests = totalSuccess + totalRedirects + totalClientErrors + totalServerErrors + totalNetworkErrors + totalUnknownErrors;
    const actualErrors = totalClientErrors + totalServerErrors + totalNetworkErrors + totalUnknownErrors;
    const successfulRequests = totalSuccess + totalRedirects;
    
    const actualErrorRate = totalRequests > 0 ? ((actualErrors / totalRequests) * 100).toFixed(2) : '0.00';
    const successRate = totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) : '0.00';
    
    return `
    <div class="section">
        <h2 class="section-title">
            <span class="icon">📊</span>
            Accurate Response Analysis
        </h2>
        
        <div class="config-grid">
            <div class="config-card success-card" style="border-left-color: #27ae60;">
                <div class="config-title">✅ Successful Responses</div>
                <div class="metric-row">
                    <span class="metric-label">Success Rate:</span>
                    <span class="metric-value" style="color: #27ae60; font-weight: bold;">${successRate}%</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Successful:</span>
                    <span class="metric-value">${successfulRequests.toLocaleString()} requests</span>
                </div>
                <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                    <div>• HTTP 2xx (Success): ${totalSuccess.toLocaleString()}</div>
                    <div>• HTTP 3xx (Redirects): ${totalRedirects.toLocaleString()}</div>
                </div>
            </div>
            
            <div class="config-card error-card" style="border-left-color: #e74c3c;">
                <div class="config-title">❌ Actual Errors</div>
                <div class="metric-row">
                    <span class="metric-label">Error Rate:</span>
                    <span class="metric-value" style="color: #e74c3c; font-weight: bold;">${actualErrorRate}%</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">Total Errors:</span>
                    <span class="metric-value">${actualErrors.toLocaleString()} requests</span>
                </div>
                <div style="margin-top: 10px; font-size: 0.9em; color: #666;">
                    <div>• HTTP 4xx (Client): ${totalClientErrors.toLocaleString()}</div>
                    <div>• HTTP 5xx (Server): ${totalServerErrors.toLocaleString()}</div>
                    <div>• Network/Connection: ${totalNetworkErrors.toLocaleString()}</div>
                </div>
            </div>
        </div>
        
        <div class="config-grid">
            <div class="error-details">
                <div class="config-title">✅ Success + Redirects (Working Correctly)</div>
                ${Object.entries({...successCodes, ...redirectCodes})
                    .filter(([status, count]) => count > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => {
                        const percentage = totalRequests > 0 ? ((count / totalRequests) * 100).toFixed(1) : '0.0';
                        const label = status === '200' ? 'Success' :
                                     status === '301' ? 'Permanent Redirect' :
                                     status === '302' ? 'Temporary Redirect' :
                                     status === '303' ? 'See Other' :
                                     status === '307' ? 'Temporary Redirect' :
                                     status === '308' ? 'Permanent Redirect' : 'Other Success';
                        return `
                        <div class="metric-row">
                            <span class="metric-label">HTTP ${status} (${label}):</span>
                            <span class="metric-value" style="color: #27ae60;">${count.toLocaleString()} (${percentage}%)</span>
                        </div>
                    `;
                    }).join('')}
            </div>
            
            <div class="error-details">
                <div class="config-title">❌ Actual Errors (Need Investigation)</div>
                ${Object.entries({...clientErrorCodes, ...serverErrorCodes, ...networkErrorCodes, ...unknownCodes})
                    .filter(([status, count]) => count > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => {
                        const percentage = totalRequests > 0 ? ((count / totalRequests) * 100).toFixed(1) : '0.0';
                        const label = status === '400' ? 'Bad Request' :
                                     status === '401' ? 'Unauthorized' :
                                     status === '403' ? 'Forbidden' :
                                     status === '404' ? 'Not Found' :
                                     status === '500' ? 'Internal Server Error' :
                                     status === '502' ? 'Bad Gateway' :
                                     status === '503' ? 'Service Unavailable' :
                                     status === '504' ? 'Gateway Timeout' :
                                     status === '0' ? 'Connection Failed' :
                                     status === 'unknown' ? 'Unknown Error' : 'Other Error';
                        return `
                        <div class="metric-row">
                            <span class="metric-label">HTTP ${status} (${label}):</span>
                            <span class="metric-value" style="color: #e74c3c;">${count.toLocaleString()} (${percentage}%)</span>
                        </div>
                    `;
                    }).join('')}
            </div>
        </div>
        
        <div class="config-card">
            <div class="config-title">🔥 Error Type Breakdown</div>
            ${topErrors.length > 0 ? topErrors.map(error => `
                <div class="metric-row">
                    <span class="metric-label">${error.type.replace(/_/g, ' ').toUpperCase()}:</span>
                    <span class="metric-value">${error.count.toLocaleString()} (${error.percentage}%)</span>
                </div>
            `).join('') : '<p>No error type data available.</p>'}
        </div>
        
        ${errorSamples.length > 0 ? `
        <div class="config-card">
            <div class="config-title">🔍 Error Samples (First 20 Actual Errors)</div>
            <div class="table-container">
                <table class="error-table">
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
                                <td><code style="color: #e74c3c;">${error.status || 'N/A'}</code></td>
                                <td><code>${error.method || 'N/A'}</code></td>
                                <td class="url-cell"><code>${error.url || 'N/A'}</code></td>
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