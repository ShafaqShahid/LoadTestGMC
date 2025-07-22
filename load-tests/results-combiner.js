const fs = require('fs');
const path = require('path');

/*
📊 RESULTS COMBINER FOR DISTRIBUTED LOAD TESTS

🎯 PURPOSE: Combine results from 3 separate 1500-user tests
📈 OUTPUT: Combined metrics for 3000 total users
*/

function combineResults() {
  const results = {
    total_users: 3000,
    parts: 3,
    users_per_part: 1500,
    combined_metrics: {
      total_requests: 0,
      total_iterations: 0,
      total_errors: 0,
      avg_response_time: 0,
      p95_response_time: 0,
      p99_response_time: 0,
      requests_per_second: 0
    },
    individual_results: []
  };

  // Read individual result files
  for (let i = 1; i <= 3; i++) {
    const resultFile = path.join(__dirname, `../results-part${i}.json`);
    
    if (fs.existsSync(resultFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(resultFile, 'utf8'));
        results.individual_results.push({
          part: i,
          users: 1500,
          metrics: data.metrics
        });
        
        // Accumulate combined metrics
        if (data.metrics && data.metrics.http_reqs) {
          results.combined_metrics.total_requests += data.metrics.http_reqs.count || 0;
        }
        
        if (data.metrics && data.metrics.iterations) {
          results.combined_metrics.total_iterations += data.metrics.iterations.count || 0;
        }
        
        if (data.metrics && data.metrics.http_req_failed) {
          results.combined_metrics.total_errors += data.metrics.http_req_failed.count || 0;
        }
        
      } catch (error) {
        console.error(`Error reading results-part${i}.json:`, error.message);
      }
    }
  }

  // Calculate combined averages
  if (results.individual_results.length > 0) {
    const totalResponseTime = results.individual_results.reduce((sum, result) => {
      return sum + (result.metrics?.http_req_duration?.avg || 0);
    }, 0);
    
    results.combined_metrics.avg_response_time = totalResponseTime / results.individual_results.length;
    results.combined_metrics.requests_per_second = results.combined_metrics.total_requests / (45 * 60); // 45 minutes
  }

  // Write combined results
  const outputFile = path.join(__dirname, '../combined-results.json');
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  
  console.log('📊 Combined Results Summary:');
  console.log(`👥 Total Users: ${results.total_users}`);
  console.log(`📈 Total Requests: ${results.combined_metrics.total_requests}`);
  console.log(`⏱️ Avg Response Time: ${results.combined_metrics.avg_response_time.toFixed(2)}ms`);
  console.log(`🚀 Requests/Second: ${results.combined_metrics.requests_per_second.toFixed(2)}`);
  console.log(`❌ Total Errors: ${results.combined_metrics.total_errors}`);
  
  return results;
}

// Run if called directly
if (require.main === module) {
  combineResults();
}

module.exports = { combineResults }; 