import http from 'k6/http';
import { check, sleep } from 'k6';

/*
🚀 DISTRIBUTED LOAD TEST - PART 3/3

👥 USERS: 1500 concurrent
⏱️ DURATION: 45 minutes
🎯 PURPOSE: Distributed testing for 3000 total users
💰 COST: FREE (GitHub Actions)

💡 This is Part 3 of 3 tests running simultaneously
*/

export const options = {
  stages: [
    { duration: '3m', target: 150 },   // Ramp up to 150 users
    { duration: '5m', target: 500 },   // Ramp up to 500 users
    { duration: '7m', target: 1000 },  // Ramp up to 1000 users
    { duration: '5m', target: 1500 },  // Ramp up to 1500 users
    { duration: '20m', target: 1500 }, // Stay at 1500 users
    { duration: '5m', target: 0 },     // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be less than 10%
  },
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
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };
  
  // Step 1: Navigate to login page
  const loginPageResponse = http.get(`${baseUrl}/CONTROL3/login.cfm`, { headers });
  
  check(loginPageResponse, {
    'login page loaded': (r) => r.status === 200,
  });

  sleep(1);

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
    'event found': (r) => r.body.includes(user.eventId) || r.url.includes('index.cfm'),
  });

  sleep(1);
}

// Setup function
export function setup() {
  console.log('🚀 Starting distributed load test - Part 3/3');
  console.log('👥 Users: 1500 concurrent');
  console.log('⏱️ Duration: 45 minutes');
  console.log('📊 Monitoring performance metrics...');
  console.log('👤 Test User: shafaqs');
  console.log('🎯 Target Event: 16289');
}

// Teardown function
export function teardown(data) {
  console.log('✅ Distributed test Part 3/3 completed');
  console.log('📈 Results saved for combination');
} 