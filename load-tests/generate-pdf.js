const fs = require('fs');
const path = require('path');

/**
 * 📄 PDF REPORT GENERATOR
 * 
 * Converts HTML load test reports to PDF format
 * Uses puppeteer for high-quality PDF generation
 */

class PDFGenerator {
  constructor() {
    this.puppeteer = null;
  }

  /**
   * Initialize puppeteer
   */
  async initPuppeteer() {
    if (!this.puppeteer) {
      try {
        this.puppeteer = require('puppeteer');
      } catch (error) {
        console.error('❌ Puppeteer not installed. Installing...');
        await this.installPuppeteer();
        this.puppeteer = require('puppeteer');
      }
    }
  }

  /**
   * Install puppeteer if not available
   */
  async installPuppeteer() {
    const { execSync } = require('child_process');
    try {
      console.log('📦 Installing puppeteer...');
      execSync('npm install puppeteer', { stdio: 'inherit' });
      console.log('✅ Puppeteer installed successfully');
    } catch (error) {
      console.error('❌ Failed to install puppeteer:', error.message);
      throw new Error('Puppeteer installation failed');
    }
  }

  /**
   * Generate PDF from HTML file
   */
  async generatePDF(htmlFile, outputFile, options = {}) {
    console.log(`📄 Generating PDF from: ${htmlFile}`);
    
    if (!fs.existsSync(htmlFile)) {
      throw new Error(`HTML file not found: ${htmlFile}`);
    }

    await this.initPuppeteer();
    
    const browser = await this.puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Read HTML content
      const htmlContent = fs.readFileSync(htmlFile, 'utf8');
      
      // Set content and wait for charts to render
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Wait for charts to be fully rendered
      await page.waitForTimeout(3000);
      
      // Generate PDF
      const pdfOptions = {
        path: outputFile,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        },
        ...options
      };

      await page.pdf(pdfOptions);
      
      console.log(`✅ PDF generated: ${outputFile}`);
      
      // Get file size
      const stats = fs.statSync(outputFile);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📊 PDF size: ${fileSizeInMB} MB`);
      
      return {
        inputFile: htmlFile,
        outputFile,
        fileSize: fileSizeInMB + ' MB'
      };
      
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate PDF with custom styling for better print layout
   */
  async generateStyledPDF(htmlFile, outputFile) {
    console.log(`🎨 Generating styled PDF from: ${htmlFile}`);
    
    if (!fs.existsSync(htmlFile)) {
      throw new Error(`HTML file not found: ${htmlFile}`);
    }

    await this.initPuppeteer();
    
    const browser = await this.puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      // Read HTML content
      let htmlContent = fs.readFileSync(htmlFile, 'utf8');
      
      // Add print-specific CSS
      htmlContent = this.addPrintStyles(htmlContent);
      
      // Set content
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      // Wait for charts
      await page.waitForTimeout(3000);
      
      // Generate PDF with print-optimized settings
      await page.pdf({
        path: outputFile,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm'
        },
        displayHeaderFooter: true,
        headerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">Load Test Report</div>',
        footerTemplate: '<div style="font-size: 10px; text-align: center; width: 100%; color: #666;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>'
      });
      
      console.log(`✅ Styled PDF generated: ${outputFile}`);
      
      const stats = fs.statSync(outputFile);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`📊 PDF size: ${fileSizeInMB} MB`);
      
      return {
        inputFile: htmlFile,
        outputFile,
        fileSize: fileSizeInMB + ' MB'
      };
      
    } finally {
      await browser.close();
    }
  }

  /**
   * Add print-specific CSS styles
   */
  addPrintStyles(htmlContent) {
    const printCSS = `
      <style>
        @media print {
          body {
            font-size: 12px;
            line-height: 1.4;
          }
          
          .header {
            background: #667eea !important;
            color: white !important;
            padding: 20px !important;
            margin-bottom: 20px !important;
          }
          
          .section {
            page-break-inside: avoid;
            margin-bottom: 20px !important;
            padding: 15px !important;
          }
          
          .summary-grid, .performance-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 10px !important;
          }
          
          .summary-card, .performance-card {
            padding: 15px !important;
            font-size: 11px !important;
          }
          
          .card-value {
            font-size: 1.2em !important;
          }
          
          .chart-container {
            height: 200px !important;
            page-break-inside: avoid;
          }
          
          .error-list {
            grid-template-columns: 1fr !important;
          }
          
          .metadata-grid {
            grid-template-columns: 1fr !important;
          }
        }
      </style>
    `;
    
    // Insert CSS before closing head tag
    return htmlContent.replace('</head>', printCSS + '</head>');
  }

  /**
   * Generate multiple PDFs from a directory of HTML files
   */
  async generateMultiplePDFs(inputDir, outputDir) {
    console.log(`📁 Processing directory: ${inputDir}`);
    
    if (!fs.existsSync(inputDir)) {
      throw new Error(`Input directory not found: ${inputDir}`);
    }
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const htmlFiles = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.html'))
      .map(file => path.join(inputDir, file));
    
    console.log(`📄 Found ${htmlFiles.length} HTML files to convert`);
    
    const results = [];
    
    for (const htmlFile of htmlFiles) {
      try {
        const baseName = path.basename(htmlFile, '.html');
        const pdfFile = path.join(outputDir, `${baseName}.pdf`);
        
        const result = await this.generateStyledPDF(htmlFile, pdfFile);
        results.push(result);
        
        console.log(`✅ Converted: ${baseName}.html → ${baseName}.pdf`);
      } catch (error) {
        console.error(`❌ Failed to convert ${htmlFile}:`, error.message);
        results.push({ inputFile: htmlFile, error: error.message });
      }
    }
    
    console.log(`📊 Conversion complete: ${results.length} files processed`);
    return results;
  }
}

/**
 * Main function
 */
async function generatePDF(htmlFile, outputFile, options = {}) {
  const generator = new PDFGenerator();
  return await generator.generatePDF(htmlFile, outputFile, options);
}

/**
 * Generate styled PDF
 */
async function generateStyledPDF(htmlFile, outputFile) {
  const generator = new PDFGenerator();
  return await generator.generateStyledPDF(htmlFile, outputFile);
}

/**
 * Generate multiple PDFs
 */
async function generateMultiplePDFs(inputDir, outputDir) {
  const generator = new PDFGenerator();
  return await generator.generateMultiplePDFs(inputDir, outputDir);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage:');
    console.log('  node generate-pdf.js <html-file> <pdf-file>');
    console.log('  node generate-pdf.js --styled <html-file> <pdf-file>');
    console.log('  node generate-pdf.js --batch <input-dir> <output-dir>');
    process.exit(1);
  }
  
  if (args[0] === '--styled' && args.length === 3) {
    const [, htmlFile, pdfFile] = args;
    generateStyledPDF(htmlFile, pdfFile)
      .then(result => {
        console.log('✅ PDF generated successfully!');
        console.log(`📁 Output: ${result.outputFile}`);
        console.log(`📊 Size: ${result.fileSize}`);
      })
      .catch(error => {
        console.error('❌ PDF generation failed:', error.message);
        process.exit(1);
      });
  } else if (args[0] === '--batch' && args.length === 3) {
    const [, inputDir, outputDir] = args;
    generateMultiplePDFs(inputDir, outputDir)
      .then(results => {
        console.log('✅ Batch PDF generation completed!');
        const successCount = results.filter(r => !r.error).length;
        const errorCount = results.filter(r => r.error).length;
        console.log(`📊 Success: ${successCount}, Errors: ${errorCount}`);
      })
      .catch(error => {
        console.error('❌ Batch PDF generation failed:', error.message);
        process.exit(1);
      });
  } else if (args.length === 2) {
    const [htmlFile, pdfFile] = args;
    generatePDF(htmlFile, pdfFile)
      .then(result => {
        console.log('✅ PDF generated successfully!');
        console.log(`📁 Output: ${result.outputFile}`);
        console.log(`📊 Size: ${result.fileSize}`);
      })
      .catch(error => {
        console.error('❌ PDF generation failed:', error.message);
        process.exit(1);
      });
  } else {
    console.log('❌ Invalid arguments');
    process.exit(1);
  }
}

module.exports = { 
  generatePDF, 
  generateStyledPDF, 
  generateMultiplePDFs, 
  PDFGenerator 
}; 