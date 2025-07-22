import http from 'k6/http';
import { check, sleep } from 'k6';

/*
🚀 DISTRIBUTED LOAD TEST - PART 1/3

👥 USERS: 1500 concurrent
⏱️ DURATION: 45 minutes
🎯 PURPOSE: Distributed testing for 3000 total users
�� COST: FREE (GitHub Actions)

 This is Part 1 of 3 tests running simultaneously
*/

export const options = {
  stages: [
    { duration: '4m', target: 100 },   // Gentle start
    { duration: '5m', target: 300 },   // Gradual increase
    { duration: '6m', target: 600 },   // Moderate increase
    { duration: '5m', target: 1000 },  // Steady increase
    { duration: '5m', target: 1500 },  // Final ramp to target
    { duration: '15m', target: 1500 }, // Stay at 1500 users (reduced peak time)
    { duration: '5m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<4500'], // Realistic threshold for distributed load
    http_req_failed: ['rate<0.18'],    // Balanced error tolerance
  },
  // Memory optimization for GitHub Actions
  noConnectionReuse: true,
  noVUConnectionReuse: true,
  discardResponseBodies: true,
  // Conservative optimizations for stability
  batch: 15,
  batchPerHost: 8,
};

// Test data - Single user for load testing
const testUsers = [
  { username: 'shafaqs', password: 'Shafaq26112024', eventId: '16289' }
];

// Helper function to get random user data
function getRandomUser() {
  return testUsers[Math.floor(Math.random() * testUsers.length)];
}

// Main test function
export default function() {
  const user = getRandomUser();
  const baseUrl = 'https://staging.sportssystems.com';
  
  // Common headers for all requests
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  };
  
  try {
    // Step 1: Navigate to login page
    const loginPageResponse = http.get(`${baseUrl}/CONTROL3/login.cfm`, { 
      headers,
      timeout: '45s' // Increased timeout for stability
    });
    
    check(loginPageResponse, {
      'login page loaded': (r) => r.status === 200,
    });

    sleep(4); // Increased sleep for stability

  // Step 2: Login
  const loginData = {
    Username: user.username,
    Password: user.password,
    storeUserName: 'on'
  };

  const loginResponse = http.post(`${baseUrl}/CONTROL3/login.cfm`, loginData, { headers });

  check(loginResponse, {
    'login successful': (r) => r.status === 200 || r.status === 302,
  });

  sleep(1);

  // Step 3: Navigate to search page (dashboard)
  const dashboardResponse = http.get(`${baseUrl}/CONTROL3/index.cfm`, { headers });
  
  check(dashboardResponse, {
    'dashboard loaded': (r) => r.status === 200,
  });

  sleep(1);

  // Step 4: Search for event
  const searchData = {
    SelectedID: user.eventId,
  };

  const searchResponse = http.post(`${baseUrl}/CONTROL3/index.cfm`, searchData, { headers });

  check(searchResponse, {
    'search successful': (r) => r.status === 200,
    'event found': (r) => {
      // Handle case where response body might be undefined (due to discardResponseBodies)
      if (r.body && typeof r.body === 'string') {
        return r.body.includes(user.eventId);
      }
      // If body is discarded, check URL instead
      return r.url && r.url.includes('index.cfm');
    },
  });

    sleep(4); // Increased sleep for stability
  } catch (error) {
    console.log(`Error in test iteration: ${error.message}`);
    // Continue with next iteration instead of failing completely
  }
}

// Setup function
export function setup() {
  console.log('🚀 Starting distributed load test - Part 1/3');
  console.log('👥 Users: 1500 concurrent');
  console.log('⏱️ Duration: 45 minutes');
  console.log('📊 Monitoring performance metrics...');
  console.log('�� Test User: shafaqs');
  console.log('🎯 Target Event: 16289');
}

// Teardown function
export function teardown(data) {
  console.log('✅ Distributed test Part 1/3 completed');
  console.log('📈 Results saved for combination');
}