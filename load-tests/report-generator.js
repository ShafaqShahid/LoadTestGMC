import fs from 'fs';
import path from 'path';

/*
📊 K6 LOAD TEST REPORT GENERATOR

🎯 PURPOSE: Generate beautiful, readable reports from k6 test results
📈 FEATURES: 
   - Performance metrics analysis
   - Threshold pass/fail summary
   - Visual charts and graphs
   - GitHub Actions integration
   - HTML and JSON report formats

🔧 USAGE: Run after k6 test completes
*/

class LoadTestReporter {
  constructor() {
    this.results = null;
    this.reportData = {};
  }

  // Parse k6 results from JSON file
  parseResults(filePath = 'results.json') {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      this.results = JSON.parse(data);
      console.log('✅ Results parsed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error parsing results:', error.message);
      return false;
    }
  }

  // Analyze performance metrics
  analyzeMetrics() {
    if (!this.results) return false;

    const metrics = this.results.metrics;
    
    this.reportData = {
      summary: {
        testDuration: this.formatDuration(this.results.state.testRunDuration),
        totalRequests: metrics.http_reqs?.count || 0,
        totalErrors: metrics.http_req_failed?.count || 0,
        errorRate: ((metrics.http_req_failed?.rate || 0) * 100).toFixed(2) + '%',
        avgResponseTime: this.formatDuration(metrics.http_req_duration?.avg || 0),
        p95ResponseTime: this.formatDuration(metrics.http_req_duration?.['p(95)'] || 0),
        p99ResponseTime: this.formatDuration(metrics.http_req_duration?.['p(99)'] || 0),
        maxResponseTime: this.formatDuration(metrics.http_req_duration?.max || 0),
        requestsPerSecond: (metrics.http_reqs?.rate || 0).toFixed(2),
        dataReceived: this.formatBytes(metrics.data_received?.count || 0),
        dataSent: this.formatBytes(metrics.data_sent?.count || 0)
      },
      thresholds: this.analyzeThresholds(),
      checks: this.analyzeChecks(),
      stages: this.analyzeStages(),
      recommendations: this.generateRecommendations()
    };

    return true;
  }

  // Analyze threshold results
  analyzeThresholds() {
    const thresholds = [];
    
    if (this.results.thresholds) {
      Object.entries(this.results.thresholds).forEach(([name, threshold]) => {
        thresholds.push({
          name: name,
          threshold: threshold.threshold,
          actual: threshold.ok ? threshold.value : threshold.value,
          passed: threshold.ok,
          description: this.getThresholdDescription(name, threshold)
        });
      });
    }

    return thresholds;
  }

  // Analyze check results
  analyzeChecks() {
    const checks = [];
    
    if (this.results.root_group?.checks) {
      Object.entries(this.results.root_group.checks).forEach(([name, check]) => {
        checks.push({
          name: name,
          passed: check.passes,
          failed: check.fails,
          total: check.passes + check.fails,
          passRate: ((check.passes / (check.passes + check.fails)) * 100).toFixed(1) + '%'
        });
      });
    }

    return checks;
  }

  // Analyze test stages
  analyzeStages() {
    const stages = [];
    
    if (this.results.state.stages) {
      this.results.state.stages.forEach((stage, index) => {
        stages.push({
          stage: index + 1,
          duration: this.formatDuration(stage.duration),
          target: stage.target,
          type: this.getStageType(stage)
        });
      });
    }

    return stages;
  }

  // Generate performance recommendations
  generateRecommendations() {
    const recommendations = [];
    const metrics = this.results.metrics;

    // Response time recommendations
    const avgResponseTime = metrics.http_req_duration?.avg || 0;
    const p95ResponseTime = metrics.http_req_duration?.['p(95)'] || 0;
    const errorRate = metrics.http_req_failed?.rate || 0;

    if (avgResponseTime > 2000) {
      recommendations.push({
        type: 'warning',
        category: 'Performance',
        message: 'Average response time is high (>2s). Consider optimizing server performance or reducing load.'
      });
    }

    if (p95ResponseTime > 5000) {
      recommendations.push({
        type: 'critical',
        category: 'Performance',
        message: '95th percentile response time is very high (>5s). Server may be overloaded.'
      });
    }

    if (errorRate > 0.1) {
      recommendations.push({
        type: 'critical',
        category: 'Reliability',
        message: 'Error rate is high (>10%). Check server stability and error handling.'
      });
    }

    if (errorRate > 0.05 && errorRate <= 0.1) {
      recommendations.push({
        type: 'warning',
        category: 'Reliability',
        message: 'Error rate is moderate (5-10%). Monitor server performance.'
      });
    }

    // Add positive feedback for good performance
    if (avgResponseTime < 1000 && errorRate < 0.05) {
      recommendations.push({
        type: 'success',
        category: 'Performance',
        message: 'Excellent performance! Response times and error rates are within optimal ranges.'
      });
    }

    return recommendations;
  }

  // Generate HTML report
  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test Report - ${new Date().toLocaleDateString()}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric-card h3 { color: #667eea; margin-bottom: 10px; font-size: 1.1em; }
        .metric-value { font-size: 2em; font-weight: bold; color: #333; }
        .metric-label { color: #666; font-size: 0.9em; margin-top: 5px; }
        .section { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .section h2 { color: #333; margin-bottom: 20px; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .threshold-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-radius: 8px; margin-bottom: 10px; }
        .threshold-pass { background: #d4edda; border-left: 4px solid #28a745; }
        .threshold-fail { background: #f8d7da; border-left: 4px solid #dc3545; }
        .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold; }
        .status-pass { background: #28a745; color: white; }
        .status-fail { background: #dc3545; color: white; }
        .check-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; }
        .recommendation { padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid; }
        .rec-success { background: #d4edda; border-left-color: #28a745; }
        .rec-warning { background: #fff3cd; border-left-color: #ffc107; }
        .rec-critical { background: #f8d7da; border-left-color: #dc3545; }
        .stage-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; }
        .footer { text-align: center; color: #666; margin-top: 50px; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Load Test Report</h1>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <h3>⏱️ Test Duration</h3>
                <div class="metric-value">${this.reportData.summary.testDuration}</div>
                <div class="metric-label">Total test time</div>
            </div>
            <div class="metric-card">
                <h3>📊 Total Requests</h3>
                <div class="metric-value">${this.reportData.summary.totalRequests.toLocaleString()}</div>
                <div class="metric-label">HTTP requests made</div>
            </div>
            <div class="metric-card">
                <h3>❌ Error Rate</h3>
                <div class="metric-value">${this.reportData.summary.errorRate}</div>
                <div class="metric-label">Failed requests</div>
            </div>
            <div class="metric-card">
                <h3>⚡ Avg Response Time</h3>
                <div class="metric-value">${this.reportData.summary.avgResponseTime}</div>
                <div class="metric-label">Mean response time</div>
            </div>
            <div class="metric-card">
                <h3>📈 P95 Response Time</h3>
                <div class="metric-value">${this.reportData.summary.p95ResponseTime}</div>
                <div class="metric-label">95th percentile</div>
            </div>
            <div class="metric-card">
                <h3>🚀 Requests/Second</h3>
                <div class="metric-value">${this.reportData.summary.requestsPerSecond}</div>
                <div class="metric-label">Throughput</div>
            </div>
        </div>

        <div class="section">
            <h2>🎯 Threshold Results</h2>
            ${this.reportData.thresholds.map(threshold => `
                <div class="threshold-item ${threshold.passed ? 'threshold-pass' : 'threshold-fail'}">
                    <div>
                        <strong>${threshold.name}</strong>
                        <div style="color: #666; font-size: 0.9em;">${threshold.description}</div>
                    </div>
                    <div>
                        <div class="status-badge ${threshold.passed ? 'status-pass' : 'status-fail'}">
                            ${threshold.passed ? 'PASS' : 'FAIL'}
                        </div>
                        <div style="text-align: right; margin-top: 5px; font-size: 0.9em;">
                            ${threshold.actual} / ${threshold.threshold}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>✅ Check Results</h2>
            ${this.reportData.checks.map(check => `
                <div class="check-item">
                    <div>
                        <strong>${check.name}</strong>
                    </div>
                    <div style="text-align: right;">
                        <div>${check.passed} passed, ${check.failed} failed</div>
                        <div style="color: #667eea; font-weight: bold;">${check.passRate} success rate</div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>📋 Test Stages</h2>
            ${this.reportData.stages.map(stage => `
                <div class="stage-item">
                    <div>
                        <strong>Stage ${stage.stage}</strong>
                        <div style="color: #666; font-size: 0.9em;">${stage.type}</div>
                    </div>
                    <div style="text-align: right;">
                        <div>${stage.duration}</div>
                        <div style="color: #667eea;">${stage.target} users</div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>💡 Recommendations</h2>
            ${this.reportData.recommendations.map(rec => `
                <div class="recommendation ${rec.type === 'success' ? 'rec-success' : rec.type === 'warning' ? 'rec-warning' : 'rec-critical'}">
                    <strong>${rec.category}:</strong> ${rec.message}
                </div>
            `).join('')}
        </div>

        <div class="footer">
            <p>Generated by K6 Load Test Reporter | Sports System Load Testing</p>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync('load-test-report.html', html);
    console.log('✅ HTML report generated: load-test-report.html');
    return html;
  }

  // Generate GitHub Actions summary
  generateGitHubSummary() {
    const summary = [];
    
    summary.push('## 🚀 Load Test Results Summary');
    summary.push('');
    summary.push('### 📊 Performance Metrics');
    summary.push(`- **Test Duration:** ${this.reportData.summary.testDuration}`);
    summary.push(`- **Total Requests:** ${this.reportData.summary.totalRequests.toLocaleString()}`);
    summary.push(`- **Error Rate:** ${this.reportData.summary.errorRate}`);
    summary.push(`- **Avg Response Time:** ${this.reportData.summary.avgResponseTime}`);
    summary.push(`- **P95 Response Time:** ${this.reportData.summary.p95ResponseTime}`);
    summary.push(`- **Throughput:** ${this.reportData.summary.requestsPerSecond} req/s`);
    summary.push('');

    summary.push('### 🎯 Threshold Results');
    this.reportData.thresholds.forEach(threshold => {
      const status = threshold.passed ? '✅ PASS' : '❌ FAIL';
      summary.push(`- **${threshold.name}:** ${status} (${threshold.actual} / ${threshold.threshold})`);
    });
    summary.push('');

    summary.push('### ✅ Check Results');
    this.reportData.checks.forEach(check => {
      const status = check.passRate === '100.0%' ? '✅' : '⚠️';
      summary.push(`- **${check.name}:** ${status} ${check.passRate} (${check.passed}/${check.total})`);
    });
    summary.push('');

    if (this.reportData.recommendations.length > 0) {
      summary.push('### 💡 Recommendations');
      this.reportData.recommendations.forEach(rec => {
        const icon = rec.type === 'success' ? '✅' : rec.type === 'warning' ? '⚠️' : '🚨';
        summary.push(`- ${icon} **${rec.category}:** ${rec.message}`);
      });
      summary.push('');
    }

    summary.push('### 📈 Detailed Report');
    summary.push('- HTML Report: Available in artifacts');
    summary.push('- JSON Results: Available in artifacts');

    return summary.join('\n');
  }

  // Generate JSON report
  generateJSONReport() {
    const jsonReport = {
      timestamp: new Date().toISOString(),
      testInfo: {
        name: 'Sports System Load Test',
        version: '1.0.0'
      },
      summary: this.reportData.summary,
      thresholds: this.reportData.thresholds,
      checks: this.reportData.checks,
      stages: this.reportData.stages,
      recommendations: this.reportData.recommendations
    };

    fs.writeFileSync('detailed-report.json', JSON.stringify(jsonReport, null, 2));
    console.log('✅ JSON report generated: detailed-report.json');
    return jsonReport;
  }

  // Helper methods
  formatDuration(ms) {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getThresholdDescription(name, threshold) {
    const descriptions = {
      'http_req_duration': 'Response time threshold',
      'http_req_failed': 'Error rate threshold',
      'http_reqs': 'Request rate threshold'
    };
    return descriptions[name] || 'Performance threshold';
  }

  getStageType(stage) {
    if (stage.target === 0) return 'Ramp Down';
    if (stage.target > stage.target) return 'Ramp Up';
    return 'Sustained Load';
  }
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const reporter = new LoadTestReporter();
  
  if (reporter.parseResults()) {
    if (reporter.analyzeMetrics()) {
      reporter.generateHTMLReport();
      reporter.generateJSONReport();
      
      // Output GitHub summary to console
      console.log('\n' + '='.repeat(80));
      console.log('GITHUB ACTIONS SUMMARY');
      console.log('='.repeat(80));
      console.log(reporter.generateGitHubSummary());
      console.log('='.repeat(80));
    }
  }
}

export default LoadTestReporter; 