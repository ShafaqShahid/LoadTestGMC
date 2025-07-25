# 🚀 Distributed Load Testing with Large Result Processing

## 📋 Overview

This enhanced load testing system handles **distributed tests with 3000 total virtual users** (3 × 1000 VUs) and processes **large result files (4.5GB+ each)** efficiently without memory issues.

## 🧠 Key Features

### ✅ Memory-Efficient Processing
- **Streaming processing** for 4.5GB+ files
- **Chunked data handling** to prevent memory crashes
- **Sequential file processing** to manage large datasets

### 📊 Comprehensive Analysis
- **Detailed error analysis** with patterns and timelines
- **Performance percentile calculations** (P50, P90, P95, P99)
- **Interactive charts** and visualizations
- **Professional PDF reports** with print optimization

### 🔄 Automated Workflow
- **3 parallel test jobs** (1000 VUs each)
- **Post-processing pipeline** with artifact handling
- **Multiple output formats** (JSON, HTML, PDF)

## 🏗️ Architecture

```
🧠 3 Parallel Jobs:
├── distributed-test-1 (1000 VUs)
├── distributed-test-2 (1000 VUs)
└── distributed-test-3 (1000 VUs)

🧩 Post-processing Job:
├── Download all artifacts
├── Merge large results (memory-efficient)
├── Generate HTML summary
├── Create PDF report
└── Upload final artifacts
```

## 🚀 Quick Start

### 1. Run Distributed Test via GitHub Actions

1. Go to **Actions** tab in your repository
2. Select **Load Testing** workflow
3. Choose **distributed** test type
4. Click **Run workflow**

### 2. Local Development

```bash
# Install dependencies
npm install

# Run individual distributed test parts
npm run test:distributed-1
npm run test:distributed-2
npm run test:distributed-3

# Process results locally
npm run process-distributed
```

## 📁 File Structure

```
LoadTestGMC/
├── load-tests/
│   ├── mergeLargeResults.js      # 🧠 Memory-efficient merger
│   ├── summarize.js              # 📊 HTML report generator
│   ├── generate-pdf.js           # 📄 PDF converter
│   ├── distributed-runner.js     # 🚀 Test runner
│   └── results-combiner.js       # 📈 Legacy combiner
├── .github/workflows/
│   └── load-test.yml            # 🔄 GitHub Actions workflow
└── package.json                 # 📦 Dependencies and scripts
```

## 🔧 Configuration

### Test Parameters

```javascript
// Environment variables for k6
VUS=1000              // Virtual users per test
DURATION=45m          // Test duration
TARGET_URL=https://your-app.com
```

### Memory Settings

```javascript
// Node.js memory allocation for large files
NODE_OPTIONS="--max-old-space-size=8192"  // 8GB heap
```

## 📊 Output Files

### Generated Reports

1. **`combined-results.json`** - Merged raw data
2. **`load-test-summary.html`** - Interactive HTML report
3. **`load-test-report.pdf`** - Professional PDF report

### Report Contents

#### 📈 Summary Metrics
- Total requests and iterations
- Error rates and patterns
- Response time percentiles
- Data transfer statistics

#### ❌ Error Analysis
- Error type distribution
- Timeline analysis
- Top error patterns
- Root cause identification

#### ⚡ Performance Statistics
- Response time distribution
- Throughput analysis
- Resource utilization
- Performance bottlenecks

## 🛠️ Advanced Usage

### Custom Result Processing

```bash
# Merge specific result files
node load-tests/mergeLargeResults.js output.json file1.json file2.json file3.json

# Generate HTML summary
node load-tests/summarize.js input.json output.html

# Create PDF report
node load-tests/generate-pdf.js --styled input.html output.pdf
```

### Batch Processing

```bash
# Process multiple HTML files to PDF
node load-tests/generate-pdf.js --batch input-dir output-dir
```

### Memory Optimization

```bash
# For very large files (>10GB)
NODE_OPTIONS="--max-old-space-size=16384" node load-tests/mergeLargeResults.js
```

## 🔍 Troubleshooting

### Common Issues

#### Memory Errors
```bash
# Increase Node.js heap size
export NODE_OPTIONS="--max-old-space-size=8192"
```

#### Large File Processing
```bash
# Use streaming mode for files >5GB
node load-tests/mergeLargeResults.js --streaming output.json file1.json file2.json
```

#### PDF Generation Issues
```bash
# Install system dependencies for Puppeteer
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

## 📈 Performance Benchmarks

### Processing Times (Typical)

| File Size | Processing Time | Memory Usage |
|-----------|----------------|--------------|
| 1GB       | ~30 seconds    | ~500MB       |
| 4.5GB     | ~2 minutes     | ~1GB         |
| 10GB      | ~5 minutes     | ~2GB         |

### Scalability

- **Up to 50GB** total data processing
- **Parallel processing** of multiple files
- **Incremental processing** for very large datasets

## 🔐 Security Considerations

### Data Handling
- **No sensitive data** in result files
- **Temporary file cleanup** after processing
- **Secure artifact storage** in GitHub Actions

### Access Control
- **Repository-level permissions** for workflow execution
- **Artifact retention** policies (30 days default)
- **Audit logging** for all operations

## 📞 Support

### Getting Help

1. **Check logs** in GitHub Actions
2. **Review error messages** in console output
3. **Verify file sizes** and memory availability
4. **Test with smaller datasets** first

### Debugging

```bash
# Enable verbose logging
DEBUG=* node load-tests/mergeLargeResults.js

# Check file integrity
ls -lh *.json
file *.json
```

## 🎯 Best Practices

### Test Execution
1. **Start with smaller tests** to validate setup
2. **Monitor system resources** during execution
3. **Use appropriate timeouts** for large tests
4. **Validate results** before processing

### Result Processing
1. **Backup original files** before processing
2. **Use sufficient memory** allocation
3. **Process during off-peak hours**
4. **Validate output files** after processing

### Report Generation
1. **Review HTML reports** before PDF generation
2. **Customize charts** for specific metrics
3. **Include executive summary** in PDF reports
4. **Archive reports** for historical analysis

## 🔄 Version History

### v2.0.0 - Large Result Processing
- ✅ Memory-efficient file processing
- ✅ Streaming data handling
- ✅ Comprehensive error analysis
- ✅ Professional PDF reports
- ✅ Automated GitHub Actions workflow

### v1.0.0 - Basic Distributed Testing
- ✅ Parallel test execution
- ✅ Basic result combination
- ✅ Simple HTML reports

---

**🎉 Ready to handle your 3000-user distributed load tests with 4.5GB+ result files!** 