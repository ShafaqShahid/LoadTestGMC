import http from 'k6/http';
import { check, sleep } from 'k6';

/*
🚀 DISTRIBUTED LOAD TEST RUNNER - OPTIMIZED

👥 USERS: 1000 concurrent per instance (3000 total)
⏱️ DURATION: 25 minutes total
🎯 PURPOSE: Distributed testing for high load
💰 COST: FREE (GitHub Actions) / High (Local)

🔧 OPTIMIZED FOR:
   - GitHub Actions distributed execution
   - Local machine testing (if sufficient resources)
   - Resource efficiency
   - Stable performance
*/

export const options = {
  stages: [
    { duration: '3m', target: 100 },   // Gentle start
    { duration: '4m', target: 400 },   // Gradual increase
    { duration: '4m', target: 700 },   // Moderate increase
    { duration: '4m', target: 1000 },  // Final ramp to target
    { duration: '6m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 0 },     // Quick ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'], // 10 seconds max
    http_req_failed: ['rate<0.40'],     // 40% error tolerance
  },
  // Optimizations for distributed execution
  noConnectionReuse: true,
  noVUConnectionReuse: true,
  discardResponseBodies: true,
  batch: 20,
  batchPerHost: 10,
  timeout: '30m',
  gracefulStop: '30s',
};

// Test data
const testUsers = [
  { username: 'shafaqs', password: 'Shafaq26112024', eventId: '16289' }
];

function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

export default function() {
  const user = getRandomUser();
  const baseUrl = 'https://staging.sportssystems.com';
  
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Connection': 'keep-alive'
  };
  
  try {
    // Step 1: Login page
    const loginPageResponse = http.get(`${baseUrl}/CONTROL3/login.cfm`, { 
      headers,
      timeout: '90s'
    });
    
    check(loginPageResponse, {
      'login page loaded': (r) => r.status === 200 || r.status === 302,
    });

    sleep(3);

    // Step 2: Login
    const loginData = {
      Username: user.username,
      Password: user.password,
      storeUserName: 'on'
    };

    const loginResponse = http.post(`${baseUrl}/CONTROL3/login.cfm`, loginData, { 
      headers,
      timeout: '90s'
    });

    check(loginResponse, {
      'login successful': (r) => r.status === 200 || r.status === 302,
    });

    sleep(3);

    // Step 3: Dashboard
    const dashboardResponse = http.get(`${baseUrl}/CONTROL3/index.cfm`, { 
      headers,
      timeout: '90s'
    });
    
    check(dashboardResponse, {
      'dashboard loaded': (r) => r.status === 200 || r.status === 302,
    });

    sleep(3);

    // Step 4: Search event
    const searchData = {
      SelectedID: user.eventId,
    };

    const searchResponse = http.post(`${baseUrl}/CONTROL3/index.cfm`, searchData, { 
      headers,
      timeout: '90s'
    });

    check(searchResponse, {
      'search successful': (r) => r.status === 200 || r.status === 302,
    });

    sleep(3);
  } catch (error) {
    console.log(`Distributed test error: ${error.message}`);
  }
}

export function setup() {
  console.log('🚀 Starting Distributed Load Test Runner');
  console.log('💻 Optimized for GitHub Actions & Local');
  console.log('⏱️ Duration: 25 minutes');
  console.log('👥 Users: 1000 per instance (3000 total)');
  console.log('👤 Test User: shafaqs');
  console.log('🎯 Target Event: 16289');
}

export function teardown(data) {
  console.log('✅ Distributed test completed');
} 