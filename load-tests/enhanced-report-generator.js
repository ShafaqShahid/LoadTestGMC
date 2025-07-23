#!/usr/bin/env node

/*
🚀 ENHANCED LOAD TEST REPORT GENERATOR

This enhanced report generator creates comprehensive HTML reports with:
- Interactive charts and graphs
- Performance metrics analysis
- Threshold validation
- Recommendations
- Export capabilities
*/

const fs = require('fs');
const path = require('path');

// Get command line arguments
const inputFile = process.argv[2];
const outputFile = process.argv[3] || 'load-test-report.html';

if (!inputFile) {
  console.error('Usage: node enhanced-report-generator.js <results.json> [output.html]');
  process.exit(1);
}

// Read and parse results
function loadResults(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Calculate metrics
function calculateMetrics(data) {
  const metrics = data.metrics;
  
  return {
    // Basic metrics
    totalRequests: metrics.http_reqs?.count || 0,
    totalErrors: metrics.http_req_failed?.rate || 0,
    avgResponseTime: metrics.http_req_duration?.avg || 0,
    p95ResponseTime: metrics.http_req_duration?.['p(95)'] || 0,
    p99ResponseTime: metrics.http_req_duration?.['p(99)'] || 0,
    minResponseTime: metrics.http_req_duration?.min || 0,
    maxResponseTime: metrics.http_req_duration?.max || 0,
    
    // Throughput
    requestsPerSecond: metrics.http_reqs?.rate || 0,
    
    // Duration
    testDuration: data.state.testRunDuration || 0,
    
    // Virtual users
    maxVUs: data.state.vus || 0,
    
    // Checks
    checks: data.root_group?.checks || {},
    
    // Thresholds
    thresholds: data.root_group?.thresholds || {}
  };
}

// Generate recommendations
function generateRecommendations(metrics) {
  const recommendations = [];
  
  // Performance recommendations
  if (metrics.p95ResponseTime > 5000) {
    recommendations.push({
      type: 'warning',
      category: 'Performance',
      message: 'P95 response time is high. Consider optimizing server performance or reducing load.'
    });
  }
  
  if (metrics.totalErrors > 0.1) {
    recommendations.push({
      type: 'error',
      category: 'Reliability',
      message: 'Error rate is high. Investigate server issues or network problems.'
    });
  }
  
  if (metrics.requestsPerSecond < 10) {
    recommendations.push({
      type: 'info',
      category: 'Throughput',
      message: 'Throughput is low. Consider increasing concurrent users or optimizing requests.'
    });
  }
  
  // Success recommendations
  if (metrics.p95ResponseTime < 2000 && metrics.totalErrors < 0.05) {
    recommendations.push({
      type: 'success',
      category: 'Performance',
      message: 'Excellent performance! System is handling load well.'
    });
  }
  
  return recommendations;
}

// Generate HTML report
function generateHTMLReport(metrics, recommendations) {
  const timestamp = new Date().toLocaleString();
  const testType = metrics.maxVUs <= 100 ? 'Quick Test' : 
                   metrics.maxVUs <= 1500 ? '1500 Users Test' : 'Distributed Test';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test Report - ${testType}</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        
        .header h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            color: #7f8c8d;
            font-size: 1.2em;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
        }
        
        .metric-card h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 10px;
        }
        
        .metric-label {
            color: #7f8c8d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .charts-section {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .charts-section h2 {
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .chart-container {
            position: relative;
            height: 400px;
            margin-bottom: 30px;
        }
        
        .recommendations {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .recommendations h2 {
            color: #2c3e50;
            margin-bottom: 20px;
        }
        
        .recommendation {
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 10px;
            border-left: 5px solid;
        }
        
        .recommendation.success {
            background: #d4edda;
            border-color: #28a745;
            color: #155724;
        }
        
        .recommendation.warning {
            background: #fff3cd;
            border-color: #ffc107;
            color: #856404;
        }
        
        .recommendation.error {
            background: #f8d7da;
            border-color: #dc3545;
            color: #721c24;
        }
        
        .recommendation.info {
            background: #d1ecf1;
            border-color: #17a2b8;
            color: #0c5460;
        }
        
        .footer {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            padding: 20px;
        }
        
        .export-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1em;
            margin: 10px;
            transition: background 0.3s ease;
        }
        
        .export-btn:hover {
            background: #2980b9;
        }
        
        @media (max-width: 768px) {
            .metrics-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Load Test Report</h1>
            <div class="subtitle">${testType} - Generated on ${timestamp}</div>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <h3>📊 Total Requests</h3>
                <div class="metric-value">${metrics.totalRequests.toLocaleString()}</div>
                <div class="metric-label">Requests</div>
            </div>
            
            <div class="metric-card">
                <h3>⚡ Throughput</h3>
                <div class="metric-value">${metrics.requestsPerSecond.toFixed(2)}</div>
                <div class="metric-label">Requests/Second</div>
            </div>
            
            <div class="metric-card">
                <h3>⏱️ Avg Response Time</h3>
                <div class="metric-value">${(metrics.avgResponseTime / 1000).toFixed(2)}s</div>
                <div class="metric-label">Average</div>
            </div>
            
            <div class="metric-card">
                <h3>🎯 P95 Response Time</h3>
                <div class="metric-value">${(metrics.p95ResponseTime / 1000).toFixed(2)}s</div>
                <div class="metric-label">95th Percentile</div>
            </div>
            
            <div class="metric-card">
                <h3>❌ Error Rate</h3>
                <div class="metric-value">${(metrics.totalErrors * 100).toFixed(2)}%</div>
                <div class="metric-label">Failed Requests</div>
            </div>
            
            <div class="metric-card">
                <h3>👥 Virtual Users</h3>
                <div class="metric-value">${metrics.maxVUs}</div>
                <div class="metric-label">Max Concurrent</div>
            </div>
        </div>
        
        <div class="charts-section">
            <h2>📈 Performance Charts</h2>
            <div class="chart-container">
                <canvas id="responseTimeChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="throughputChart"></canvas>
            </div>
        </div>
        
        <div class="recommendations">
            <h2>💡 Recommendations</h2>
            ${recommendations.map(rec => `
                <div class="recommendation ${rec.type}">
                    <strong>${rec.category}:</strong> ${rec.message}
                </div>
            `).join('')}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <button class="export-btn" onclick="exportToPDF()">📄 Export to PDF</button>
            <button class="export-btn" onclick="exportToCSV()">📊 Export to CSV</button>
        </div>
    </div>
    
    <div class="footer">
        <p>Generated by Enhanced Load Test Report Generator</p>
    </div>
    
    <script>
        // Response Time Chart
        const responseTimeCtx = document.getElementById('responseTimeChart').getContext('2d');
        new Chart(responseTimeCtx, {
            type: 'bar',
            data: {
                labels: ['Min', 'Average', 'P95', 'P99', 'Max'],
                datasets: [{
                    label: 'Response Time (seconds)',
                    data: [
                        ${(metrics.minResponseTime / 1000).toFixed(2)},
                        ${(metrics.avgResponseTime / 1000).toFixed(2)},
                        ${(metrics.p95ResponseTime / 1000).toFixed(2)},
                        ${(metrics.p99ResponseTime / 1000).toFixed(2)},
                        ${(metrics.maxResponseTime / 1000).toFixed(2)}
                    ],
                    backgroundColor: [
                        '#2ecc71',
                        '#3498db',
                        '#f39c12',
                        '#e74c3c',
                        '#9b59b6'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Response Time Distribution',
                        font: { size: 16 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Response Time (seconds)'
                        }
                    }
                }
            }
        });
        
        // Throughput Chart
        const throughputCtx = document.getElementById('throughputChart').getContext('2d');
        new Chart(throughputCtx, {
            type: 'doughnut',
            data: {
                labels: ['Successful Requests', 'Failed Requests'],
                datasets: [{
                    data: [
                        ${metrics.totalRequests * (1 - metrics.totalErrors)},
                        ${metrics.totalRequests * metrics.totalErrors}
                    ],
                    backgroundColor: ['#2ecc71', '#e74c3c'],
                    borderWidth: 3,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Request Success Rate',
                        font: { size: 16 }
                    }
                }
            }
        });
        
        // Export functions
        function exportToPDF() {
            window.print();
        }
        
        function exportToCSV() {
            const csvContent = "data:text/csv;charset=utf-8," +
                "Metric,Value\\n" +
                "Total Requests," + ${metrics.totalRequests} + "\\n" +
                "Throughput," + ${metrics.requestsPerSecond.toFixed(2)} + "\\n" +
                "Avg Response Time," + ${(metrics.avgResponseTime / 1000).toFixed(2)} + "\\n" +
                "P95 Response Time," + ${(metrics.p95ResponseTime / 1000).toFixed(2)} + "\\n" +
                "Error Rate," + ${(metrics.totalErrors * 100).toFixed(2)} + "%\\n" +
                "Virtual Users," + ${metrics.maxVUs} + "\\n";
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "load-test-results.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    </script>
</body>
</html>`;
}

// Main execution
function main() {
  console.log('🚀 Generating enhanced load test report...');
  
  // Load results
  const results = loadResults(inputFile);
  
  // Calculate metrics
  const metrics = calculateMetrics(results);
  
  // Generate recommendations
  const recommendations = generateRecommendations(metrics);
  
  // Generate HTML report
  const htmlReport = generateHTMLReport(metrics, recommendations);
  
  // Write report
  fs.writeFileSync(outputFile, htmlReport);
  
  console.log(`✅ Enhanced report generated: ${outputFile}`);
  console.log(`📊 Metrics Summary:`);
  console.log(`   - Total Requests: ${metrics.totalRequests.toLocaleString()}`);
  console.log(`   - Throughput: ${metrics.requestsPerSecond.toFixed(2)} req/s`);
  console.log(`   - Avg Response Time: ${(metrics.avgResponseTime / 1000).toFixed(2)}s`);
  console.log(`   - P95 Response Time: ${(metrics.p95ResponseTime / 1000).toFixed(2)}s`);
  console.log(`   - Error Rate: ${(metrics.totalErrors * 100).toFixed(2)}%`);
  console.log(`   - Virtual Users: ${metrics.maxVUs}`);
  console.log(`💡 Recommendations: ${recommendations.length}`);
}

main(); 