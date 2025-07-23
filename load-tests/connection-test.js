import http from 'k6/http';
import { check } from 'k6';

/*
🔍 CONNECTION TEST

🎯 PURPOSE: Verify target environment is accessible
⏱️ DURATION: 1 minute
👥 USERS: 1 user
💰 COST: FREE (GitHub Actions)

This test verifies basic connectivity to the target environment
*/

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.1'],
  },
};

const baseUrl = 'https://staging.sportssystems.com';

export default function() {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
  };

  // Test 1: Basic connectivity to login page
  const loginPageResponse = http.get(`${baseUrl}/CONTROL3/login.cfm`, { 
    headers,
    timeout: '30s'
  });
  
  check(loginPageResponse, {
    'login page accessible': (r) => r.status === 200,
    'response time reasonable': (r) => r.timings.duration < 5000,
  });

  console.log(`Login page response: ${loginPageResponse.status} - ${loginPageResponse.timings.duration}ms`);

  // Test 2: Basic connectivity to main page
  const mainPageResponse = http.get(`${baseUrl}/CONTROL3/index.cfm`, { 
    headers,
    timeout: '30s'
  });
  
  check(mainPageResponse, {
    'main page accessible': (r) => r.status === 200,
    'response time reasonable': (r) => r.timings.duration < 5000,
  });

  console.log(`Main page response: ${mainPageResponse.status} - ${mainPageResponse.timings.duration}ms`);
}

export function setup() {
  console.log('🔍 Starting connection test...');
  console.log(`🎯 Target: ${baseUrl}`);
  console.log('⏱️ Duration: 1 minute');
  console.log('👥 Users: 1');
}

export function teardown(data) {
  console.log('✅ Connection test completed');
  console.log('📊 Check results above for connectivity status');
} 