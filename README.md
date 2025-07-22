# Load Testing Setup - Complete (Quick, 1500, Distributed)

Professional load testing setup for the Sports System with three testing options and GitHub Actions integration.

## 🚀 Quick Start

### Option 1: GitHub Actions (Recommended)
1. Go to Actions tab in this repository
2. Click "Load Testing - Complete" workflow
3. Click "Run workflow"
4. Choose test type and run

### Option 2: Local Testing
```bash
# Quick test (100 users, 4 minutes)
npm run test:quick

# Single 1500 users test (45 minutes)
npm run test:single-1500

# Distributed tests (3 x 1500 users, 135 minutes total)
npm run test:distributed-1
npm run test:distributed-2
npm run test:distributed-3
npm run combine-results
```

## 📁 Files Overview

### Core Test Scripts
- `load-tests/quick-test.js` - Quick verification test (100 users, 4 minutes)
- `load-tests/local-1500-users.js` - Single load test for 1500 users (45 minutes)
- `load-tests/distributed-test-1.js` - Distributed test Part 1/3 (1500 users)
- `load-tests/distributed-test-2.js` - Distributed test Part 2/3 (1500 users)
- `load-tests/distributed-test-3.js` - Distributed test Part 3/3 (1500 users)
- `load-tests/results-combiner.js` - Combine distributed test results

### GitHub Actions
- `.github/workflows/load-test-complete.yml` - Complete workflow with all 3 options

## ⚠️ Important Information

### 💰 Cost Considerations
- **All Options**: FREE (within GitHub Actions limits)
- **Quick Test**: 4 minutes execution time
- **Single 1500**: 45 minutes execution time
- **Distributed**: 135 minutes total execution time

### 👥 User Limits
- **Quick Test**: 100 concurrent users
- **Single 1500**: 1500 concurrent users
- **Distributed**: 3000 total users (3 x 1500)

### ⏱️ Test Durations
- **Quick Test**: 4 minutes (setup verification)
- **Single 1500**: 45 minutes (production testing)
- **Distributed**: 135 minutes total (enterprise testing)

## 🔧 Requirements

### Local Testing
- Node.js installed
- k6 installed (auto-installed by scripts)
- High-performance machine (16GB+ RAM, 8+ cores)

### GitHub Actions
- GitHub repository
- No additional setup required

## 📊 Test Flow

1. **Login** - Authenticate with test credentials
2. **Search** - Search for target event
3. **Validation** - Verify successful operations
4. **Repeat** - Each virtual user performs this flow

## 🎯 Performance Thresholds

- **Response Time**: 95% of requests < 2 seconds
- **Error Rate**: < 10%
- **Availability**: > 99%

## 📈 Results

- **Real-time**: Console output with live metrics
- **JSON Export**: Detailed results in JSON files
- **GitHub Actions**: Artifacts with test results
- **Combined Reports**: Aggregated metrics for distributed tests

## 🛡️ Security

- Test credentials only (shafaqs / Shafaq26112024)
- No production data used
- Secure credential management via GitHub Secrets

## 🎯 Test Options Comparison

| Test Type | Users | Duration | Purpose | Use Case |
|-----------|-------|----------|---------|----------|
| **Quick** | 100 | 4 min | Setup verification | Initial testing, CI/CD |
| **Single 1500** | 1500 | 45 min | Production testing | Performance validation |
| **Distributed** | 3000 | 135 min | Enterprise testing | Stress testing, capacity planning |

## 🚀 Usage Guide

### Quick Test (Recommended First)
```bash
# GitHub Actions
1. Select "quick" test type
2. Run workflow
3. Check results in 4 minutes

# Local
npm run test:quick
```

### Single 1500 Users
```bash
# GitHub Actions
1. Select "single-1500" test type
2. Run workflow
3. Wait 45 minutes for completion

# Local
npm run test:single-1500
```

### Distributed 3000 Users
```bash
# GitHub Actions
1. Select "distributed" test type
2. Set delay between tests (default: 2 minutes)
3. Run workflow
4. Wait for all 3 parts to complete

# Local
npm run test:distributed-1
npm run test:distributed-2
npm run test:distributed-3
npm run combine-results
```

## 📊 Expected Results

### Quick Test (100 users)
```
🚀 Starting quick load test - 100 users
⏱️ Duration: 4 minutes
🎯 Purpose: Setup verification

checks.........................: 100.00% ✓ 400       ✗ 0
http_req_duration..............: avg=234.12ms min=156.23ms med=198.45ms max=1.2s
http_req_failed................: 0.00%   ✓ 400       ✗ 0
http_reqs......................: 400     1.67/s
iterations.....................: 100     0.42/s
vus............................: 0       min=0        max=100
vus_max........................: 100     min=100      max=100

✅ Quick load test completed
```

### Single 1500 Users
```
🚀 Starting single load test - 1500 users
⏱️ Duration: 45 minutes
💻 Single test execution

checks.........................: 100.00% ✓ 6000      ✗ 0
http_req_duration..............: avg=456.78ms min=234.56ms med=398.90ms max=2.1s
http_req_failed................: 0.00%   ✓ 6000      ✗ 0
http_reqs......................: 6000    2.22/s
iterations.....................: 1500    0.56/s
vus............................: 0       min=0        max=1500
vus_max........................: 1500    min=1500     max=1500

✅ Single load test completed
```

### Distributed 3000 Users
```
## Combined Load Test Results - 3000 Users

### Test Summary:
- **Total Users**: 3000 (3 x 1500)
- **Total Duration**: ~135 minutes (3 x 45 minutes)
- **Test Parts**: 3 distributed tests
- **Delay Between Tests**: 2 minutes

### Combined Metrics:
- **Total Requests**: ~18,000 (3 x 6,000)
- **Peak Load**: 3000 concurrent users
- **Cost**: FREE (GitHub Actions)
```

## 🔧 Troubleshooting

### Common Issues

1. **Test Fails to Start**
   - Check GitHub Actions logs
   - Verify repository permissions
   - Ensure workflow file is correct

2. **High Error Rate**
   - Check target environment availability
   - Verify test credentials
   - Reduce user count
   - Increase sleep intervals

3. **Slow Response Times**
   - Check network connectivity
   - Verify server performance
   - Reduce concurrent users
   - Optimize test scripts

4. **Memory Issues**
   - Use smaller user counts
   - Optimize test scripts
   - Use GitHub-hosted runners
   - Split tests into smaller chunks

### Debug Mode
```javascript
// Add to test scripts for detailed logging
export const options = {
  // ... existing options
  debug: true,
};
```

## 📞 Support

1. Start with quick test to verify setup
2. Check GitHub Actions logs for errors
3. Monitor system resources during local tests
4. Review performance thresholds

## 🎉 Benefits

### ✅ **Three Testing Options**
- **Quick**: Fast verification (4 minutes)
- **Single**: Standard load testing (45 minutes)
- **Distributed**: High-scale testing (135 minutes)

### ✅ **Flexible Configuration**
- **Adjustable delays** between distributed tests
- **Individual result analysis** for each part
- **Combined reporting** for overall metrics

### ✅ **Cost-Effective**
- **All options FREE** within GitHub Actions limits
- **No external dependencies** required
- **Professional results** with detailed metrics

### ✅ **Team-Friendly**
- **Easy selection** via dropdown
- **Clear documentation** for each option
- **Consistent workflow** across all tests

---

**Note**: This setup is optimized for testing the Sports System with up to 3000 concurrent users. Adjust parameters based on your specific requirements.