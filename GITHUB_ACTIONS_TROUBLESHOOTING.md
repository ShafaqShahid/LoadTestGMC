# GitHub Actions Load Testing Troubleshooting Guide

## 🚨 Common Error: Exit Code 99

### What Exit Code 99 Means
- **Resource Exhaustion**: GitHub Actions runner ran out of memory or CPU
- **Timeout**: Test exceeded GitHub Actions time limits
- **Memory Issues**: Too many concurrent users for the runner

### 🔧 Solutions

#### 1. Use Safe 1000 Users Test (Recommended)
```bash
# Instead of 1500 users, use the safe 1000 users test
# This is specifically optimized for GitHub Actions
```

**Steps:**
1. Go to Actions tab
2. Click "Load Testing - Complete"
3. Select "safe-1000" test type
4. Run the workflow

#### 2. Optimized 1500 Users Test
The 1500 users test has been optimized with:
- **Reduced duration**: 30 minutes (from 45)
- **Memory optimization**: `discardResponseBodies: true`
- **Conservative ramp-up**: More gradual user increase
- **Increased sleep intervals**: 2 seconds between requests

#### 3. Quick Test First (Always Recommended)
```bash
# Always run quick test first to verify setup
# This helps identify issues before running larger tests
```

## 📊 Test Options Comparison

| Test Type | Users | Duration | GitHub Actions Safe | Use Case |
|-----------|-------|----------|-------------------|----------|
| **Quick** | 100 | 4 min | ✅ Yes | Setup verification |
| **Safe 1000** | 1000 | 25 min | ✅ Yes | Conservative testing |
| **Single 1500** | 1500 | 30 min | ⚠️ Optimized | Production testing |
| **Distributed** | 3000 | 135 min | ⚠️ Sequential | Enterprise testing |

## 🔍 Debugging Steps

### Step 1: Check GitHub Actions Logs
1. Go to the failed workflow run
2. Click on the failed job
3. Look for error messages in the logs
4. Check memory usage warnings

### Step 2: Monitor Resource Usage
Look for these indicators in logs:
```
Memory usage: 95%+
CPU usage: 100%
Timeout after 6 hours
```

### Step 3: Reduce Load
If you see resource issues:
1. **Use Safe 1000** instead of 1500
2. **Run Quick Test** first
3. **Check target environment** availability
4. **Reduce concurrent users** in test scripts

## 🛠️ Manual Fixes

### Option 1: Reduce Users in Test Script
```javascript
// In your test script, reduce the target users
export const options = {
  stages: [
    { duration: '2m', target: 50 },    // Reduced from 100
    { duration: '3m', target: 200 },   // Reduced from 300
    { duration: '5m', target: 500 },   // Reduced from 800
    { duration: '5m', target: 1000 },  // Reduced from 1500
    { duration: '10m', target: 1000 }, // Stay at 1000
    { duration: '5m', target: 0 },
  ],
};
```

### Option 2: Increase Sleep Intervals
```javascript
// Add more sleep between requests
sleep(3); // Increased from 2 seconds
```

### Option 3: Memory Optimization
```javascript
export const options = {
  // ... existing options
  noConnectionReuse: true,
  noVUConnectionReuse: true,
  discardResponseBodies: true,
};
```

## 🎯 Recommended Testing Sequence

### For New Users:
1. **Quick Test** (100 users, 4 minutes)
2. **Safe 1000** (1000 users, 25 minutes)
3. **Single 1500** (1500 users, 30 minutes) - if safe 1000 passes
4. **Distributed** (3000 users, 135 minutes) - if all above pass

### For Experienced Users:
1. **Quick Test** (always first)
2. **Safe 1000** (if quick passes)
3. **Single 1500** (if safe 1000 passes)
4. **Distributed** (if single 1500 passes)

## 📈 Performance Expectations

### Quick Test (100 users)
- **Expected Duration**: 4 minutes
- **Success Rate**: 100%
- **Memory Usage**: Low
- **Risk Level**: Very Low

### Safe 1000 Users
- **Expected Duration**: 25 minutes
- **Success Rate**: 95%+
- **Memory Usage**: Medium
- **Risk Level**: Low

### Single 1500 Users (Optimized)
- **Expected Duration**: 30 minutes
- **Success Rate**: 90%+
- **Memory Usage**: High
- **Risk Level**: Medium

### Distributed 3000 Users
- **Expected Duration**: 135 minutes
- **Success Rate**: 85%+
- **Memory Usage**: Very High
- **Risk Level**: High

## 🚨 Emergency Solutions

### If All Tests Fail:
1. **Check target environment**: Is staging.sportssystems.com accessible?
2. **Verify credentials**: Are test credentials still valid?
3. **Reduce to Quick Test**: Start with 100 users only
4. **Check GitHub Actions status**: Are there any platform issues?

### If Memory Issues Persist:
1. **Use local testing** instead of GitHub Actions
2. **Split tests** into smaller chunks
3. **Reduce concurrent users** to 500
4. **Increase delays** between requests

## 📞 Support

### Before Asking for Help:
1. ✅ Run Quick Test first
2. ✅ Check GitHub Actions logs
3. ✅ Try Safe 1000 test
4. ✅ Verify target environment

### Information to Provide:
- Test type that failed
- Error message from logs
- GitHub Actions run ID
- Target environment status

## 🎉 Success Indicators

Your setup is working correctly when:
- ✅ Quick test completes in 4 minutes
- ✅ Safe 1000 test completes in 25 minutes
- ✅ No exit code 99 errors
- ✅ All checks pass (100% success rate)
- ✅ Response times are acceptable (< 3 seconds)

---

**Remember**: Always start with the Quick Test to verify your setup before running larger tests! 