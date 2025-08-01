import http from 'k6/http';
import { check, sleep } from 'k6';

/*
🚀 QUICK LOAD TEST - OPTIMIZED FOR LOCAL & GITHUB ACTIONS

👥 USERS: 50 concurrent (quick validation)
⏱️ DURATION: 5 minutes total
🎯 PURPOSE: Quick validation and smoke testing
💰 COST: FREE (GitHub Actions) / Minimal (Local)

🔧 OPTIMIZED FOR:
   - Local machine testing
   - GitHub Actions runners
   - Quick feedback
   - Resource efficiency
*/

export const options = {
  stages: [
    { duration: '1m', target: 10 },    // Quick start
    { duration: '2m', target: 50 },    // Ramp to target
    { duration: '1m', target: 50 },    // Stay at target
    { duration: '1m', target: 0 },     // Quick ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 5 seconds max
    http_req_failed: ['rate<0.20'],    // 20% error tolerance
  },
  // Optimizations for both local and GitHub Actions
  noConnectionReuse: true,
  noVUConnectionReuse: true,
  discardResponseBodies: true,
  batch: 10,
  batchPerHost: 5,
  timeout: '10m',
  gracefulStop: '15s',
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
      timeout: '30s'
    });
    
    check(loginPageResponse, {
      'login page loaded': (r) => r.status === 200 || r.status === 302,
    });

    sleep(1);

    // Step 2: Login
    const loginData = {
      Username: user.username,
      Password: user.password,
      storeUserName: 'on'
    };

    const loginResponse = http.post(`${baseUrl}/CONTROL3/login.cfm`, loginData, { 
      headers,
      timeout: '30s'
    });

    check(loginResponse, {
      'login successful': (r) => r.status === 200 || r.status === 302,
    });

    sleep(1);

    // Step 3: Dashboard
    const dashboardResponse = http.get(`${baseUrl}/CONTROL3/index.cfm`, { 
      headers,
      timeout: '30s'
    });
    
    check(dashboardResponse, {
      'dashboard loaded': (r) => r.status === 200 || r.status === 302,
    });

    sleep(1);

    // Step 4: Search event
    const searchData = {
      SelectedID: user.eventId,
    };

    const searchResponse = http.post(`${baseUrl}/CONTROL3/index.cfm`, searchData, { 
      headers,
      timeout: '30s'
    });

    check(searchResponse, {
      'search successful': (r) => r.status === 200 || r.status === 302,
    });

    sleep(1);
  } catch (error) {
    console.log(`Quick test error: ${error.message}`);
  }
}

export function setup() {
  console.log('🚀 Starting Quick Load Test (50 users, 5 minutes)');
  console.log('💻 Optimized for Local & GitHub Actions');
  console.log('👤 Test User: shafaqs');
  console.log('🎯 Target Event: 16289');
}

export function teardown(data) {
  console.log('✅ Quick test completed');
} 