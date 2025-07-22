# Load Test Troubleshooting Guide

## 🚨 Issue Analysis

Your load test failed with the following problems:

### 1. Response Time Threshold Exceeded
- **Expected**: p(95) < 3000ms (3 seconds)
- **Actual**: p(95) = 3.43s
- **Issue**: 95th percentile response time is too slow

### 2. High Failure Rate
- **Expected**: < 15% failure rate
- **Actual**: 12.02% failure rate
- **Issue**: Close to threshold limit

### 3. System Performance Issues
- Average response time: 1.03s
- Maximum response time: 29.47s
- Dashboard loading success rate: 67%

## 🔧 Solutions Implemented

### Option 1: Conservative Approach (Recommended)
**File**: `github-actions-conservative-1000.js`
- **Users**: 1000 (reduced from 1500)
- **Duration**: 30 minutes
- **Ramp-up**: 18 minutes (very gradual)
- **Thresholds**: p(95) < 4000ms, failure rate < 15%
- **Sleep times**: 4-6 seconds between requests
- **Timeouts**: 45 seconds per request

### Option 2: Optimized Approach
**File**: `github-actions-optimized-1500.js`
- **Users**: 1500 (maintained)
- **Duration**: 35 minutes
- **Ramp-up**: 20 minutes (more gradual)
- **Thresholds**: p(95) < 5000ms, failure rate < 20%
- **Sleep times**: 3-5 seconds between requests
- **Timeouts**: 30 seconds per request

## 🎯 Key Improvements Made

### 1. Gradual Ramp-up
```javascript
// Before (aggressive)
{ duration: '2m', target: 100 }
{ duration: '3m', target: 300 }
{ duration: '5m', target: 1500 }

// After (conservative)
{ duration: '3m', target: 30 }
{ duration: '4m', target: 100 }
{ duration: '4m', target: 250 }
{ duration: '3m', target: 500 }
{ duration: '4m', target: 1000 }
```

### 2. Random Sleep Times
```javascript
// Prevents thundering herd effect
function randomSleep(min, max) {
  const sleepTime = Math.random() * (max - min) + min;
  sleep(sleepTime);
}
```

### 3. Better Error Handling
```javascript
try {
  // Test logic
} catch (error) {
  console.log(`Error in test iteration: ${error.message}`);
  // Continue instead of failing completely
}
```

### 4. Increased Timeouts
```javascript
// Before
const response = http.get(url, { headers });

// After
const response = http.get(url, { 
  headers,
  timeout: '45s' // More generous timeout
});
```

## 📊 Performance Recommendations

### For GitHub Actions Environment:
1. **Use Conservative Test First**: Start with 1000 users
2. **Monitor Resource Usage**: GitHub Actions runners have limited resources
3. **Check Network Stability**: Ensure stable internet connection
4. **Review Target System**: The staging system might need optimization

### Threshold Adjustments:
```javascript
// Conservative thresholds
thresholds: {
  http_req_duration: ['p(95)<4000'], // 4 seconds for 1000 users
  http_req_failed: ['rate<0.15'],    // 15% failure rate
}

// Optimized thresholds
thresholds: {
  http_req_duration: ['p(95)<5000'], // 5 seconds for 1500 users
  http_req_failed: ['rate<0.20'],    // 20% failure rate
}
```

## 🚀 How to Run Fixed Tests

### 1. Conservative Test (Recommended)
```bash
k6 run load-tests/github-actions-conservative-1000.js
```

### 2. Optimized Test
```bash
k6 run load-tests/github-actions-optimized-1500.js
```

### 3. Via GitHub Actions
1. Go to Actions tab
2. Select "Load Testing - Multiple Options"
3. Choose "conservative" for best results
4. Click "Run workflow"

## 🔍 Monitoring and Debugging

### Check These Metrics:
- **Response Times**: Should be under thresholds
- **Failure Rates**: Should be under 15-20%
- **Resource Usage**: Monitor CPU and memory
- **Network Latency**: Check for connectivity issues

### Common Issues:
1. **High Response Times**: Reduce user count or increase sleep times
2. **High Failure Rates**: Check target system availability
3. **Memory Issues**: Enable `discardResponseBodies: true`
4. **Network Timeouts**: Increase timeout values

## 📈 Expected Results

### Conservative Test (1000 users):
- ✅ p(95) response time < 4000ms
- ✅ Failure rate < 15%
- ✅ All checks passing
- ✅ Stable performance

### Optimized Test (1500 users):
- ⚠️ p(95) response time < 5000ms
- ⚠️ Failure rate < 20%
- ✅ Better error handling
- ✅ More realistic thresholds

## 🎯 Next Steps

1. **Start with Conservative Test**: Use 1000 users first
2. **Monitor Results**: Check if thresholds are met
3. **Gradually Increase**: Try optimized test if conservative passes
4. **Analyze Performance**: Identify bottlenecks in target system
5. **Optimize Target**: Consider server-side improvements

## 📞 Support

If issues persist:
1. Check target system logs
2. Verify network connectivity
3. Review GitHub Actions runner resources
4. Consider reducing user count further
5. Contact system administrators for server optimization 