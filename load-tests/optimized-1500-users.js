import http from 'k6/http';
import { check, sleep } from 'k6';

/*
🚀 OPTIMIZED 1500 USERS LOAD TEST

👥 USERS: 1500 concurrent (optimized)
⏱️ DURATION: 25 minutes total
🎯 PURPOSE: High-load testing for both local and GitHub Actions
💰 COST: FREE (GitHub Actions) / Moderate (Local)

🔧 OPTIMIZED FOR:
   - Local machine testing (8GB+ RAM recommended)
   - GitHub Actions runners (7GB RAM)
   - Resource efficiency
   - Stable performance
*/

export const options = {
  stages: [
    { duration: '3m', target: 100 },   // Gentle start
    { duration: '4m', target: 400 },   // Gradual increase
    { duration: '4m', target: 800 },   // Moderate increase
    { duration: '4m', target: 1200 },  // Steady increase
    { duration: '4m', target: 1500 },  // Final ramp to target
    { duration: '4m', target: 1500 },  // Stay at 1500 users
    { duration: '2m', target: 0 },     // Quick ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<8000'], // 8 seconds max
    http_req_failed: ['rate<0.30'],    // 30% error tolerance
  },
  // Optimizations for both local and GitHub Actions
  noConnectionReuse: true,
  noVUConnectionReuse: true,
  discardResponseBodies: true,
  batch: 15,
  batchPerHost: 8,
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
      timeout: '60s'
    });
    
    check(loginPageResponse, {
      'login page loaded': (r) => r.status === 200 || r.status === 302,
    });

    sleep(2);

    // Step 2: Login
    const loginData = {
      Username: user.username,
      Password: user.password,
      storeUserName: 'on'
    };

    const loginResponse = http.post(`${baseUrl}/CONTROL3/login.cfm`, loginData, { 
      headers,
      timeout: '60s'
    });

    check(loginResponse, {
      'login successful': (r) => r.status === 200 || r.status === 302,
    });

    sleep(2);

    // Step 3: Dashboard
    const dashboardResponse = http.get(`${baseUrl}/CONTROL3/index.cfm`, { 
      headers,
      timeout: '60s'
    });
    
    check(dashboardResponse, {
      'dashboard loaded': (r) => r.status === 200 || r.status === 302,
    });

    sleep(2);

    // Step 4: Search event
    const searchData = {
      SelectedID: user.eventId,
    };

    const searchResponse = http.post(`${baseUrl}/CONTROL3/index.cfm`, searchData, { 
      headers,
      timeout: '60s'
    });

    check(searchResponse, {
      'search successful': (r) => r.status === 200 || r.status === 302,
    });

    sleep(2);
  } catch (error) {
    console.log(`1500 users test error: ${error.message}`);
  }
}

export function setup() {
  console.log('🚀 Starting Optimized 1500 Users Load Test');
  console.log('💻 Optimized for Local & GitHub Actions');
  console.log('⏱️ Duration: 25 minutes');
  console.log('👤 Test User: shafaqs');
  console.log('🎯 Target Event: 16289');
}

export function teardown(data) {
  console.log('✅ 1500 users test completed');
} 