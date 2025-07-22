# Load Testing Setup - 1500 Users

Professional load testing setup for the Sports System with GitHub Actions integration.

## 🚀 Quick Start

### Option 1: GitHub Actions (Recommended)
1. Go to Actions tab in this repository
2. Click "Load Testing - 1500 Users" workflow
3. Click "Run workflow"
4. Choose test type and run

### Option 2: Local Testing
```bash
# Quick test (100 users, 4 minutes)
k6 run load-tests/quick-test.js

# Full test (1500 users, 45 minutes)
k6 run load-tests/local-1500-users.js
```

## 📁 Files Overview

### Core Test Scripts
- `load-tests/local-1500-users.js` - Local load test for 1500 users
- `load-tests/quick-test.js` - Quick verification test (100 users)

### GitHub Actions
- `.github/workflows/load-test.yml` - Complete workflow file

## ⚠️ Important Information

### 💰 Cost Considerations
- **Local Testing**: Free (uses your machine resources)
- **GitHub Actions**: Free tier includes 2000 minutes/month
- **AWS Testing**: ~$15-25 per hour for 1500 users

### 👥 User Limits
- **Local**: 1500 concurrent (depends on machine specs)
- **GitHub Actions**: 1500 concurrent (recommended)
- **AWS**: 1500+ concurrent (scalable)

### ⏱️ Test Durations
- **Quick Test**: 4 minutes (100 users)
- **Full Test**: 45 minutes (1500 users)

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
- **JSON Export**: Detailed results in `results.json`
- **GitHub Actions**: Artifacts with test results

## 🛡️ Security

- Test credentials only (shafaqs / Shafaq26112024)
- No production data used
- Secure credential management via GitHub Secrets

## 📞 Support

1. Start with quick test to verify setup
2. Check GitHub Actions logs for errors
3. Monitor system resources during local tests
4. Review performance thresholds

---

**Note**: This setup is optimized for 1500 concurrent users. Adjust parameters based on your specific requirements.