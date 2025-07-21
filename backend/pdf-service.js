const express = require('express')
const puppeteer = require('puppeteer')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const fs = require('fs').promises

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline styles for PDF generation
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many PDF generation requests, please try again later.'
})
app.use('/api/', limiter)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Body parser
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Browser instance management
let browserInstance = null

const getBrowser = async () => {
  if (!browserInstance) {
    console.log('Launching new browser instance...')
    
    // macOS-specific configuration
    const puppeteerOptions = {
      headless: 'new',
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      timeout: 60000,
      protocolTimeout: 60000
    }

    // For macOS, don't use --single-process and --no-zygote as they can cause issues
    if (process.platform !== 'darwin') {
      puppeteerOptions.args.push('--single-process', '--no-zygote')
    }

    browserInstance = await puppeteer.launch(puppeteerOptions)

    // Handle browser disconnect
    browserInstance.on('disconnected', () => {
      console.log('Browser disconnected')
      browserInstance = null
    })
  }
  return browserInstance
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...')
  if (browserInstance) {
    await browserInstance.close()
  }
  process.exit(0)
})

// Input validation
const validateQuotationData = (data) => {
  const errors = []
  
  if (!data.quotation?.id) {
    errors.push('Quotation ID is required')
  }
  
  if (!data.customer?.company_name) {
    errors.push('Customer company name is required')
  }
  
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('At least one item is required')
  }
  
  // Validate items
  data.items?.forEach((item, index) => {
    if (!item.description) {
      errors.push(`Item ${index + 1}: description is required`)
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: quantity must be a positive number`)
    }
    if (typeof item.unit_price !== 'number' || item.unit_price < 0) {
      errors.push(`Item ${index + 1}: unit price must be a non-negative number`)
    }
  })
  
  return errors
}

// Generate HTML template
const generateQuotationHTML = (data) => {
  const { quotation, customer, items, company } = data
  
  // Currency configuration
  const currency = quotation.currency || 'MYR'
  const conversionRate = quotation.conversion_rate || 1
  const baseCurrency = 'MYR'
  
  // Calculate totals in base currency (MYR)
  const subtotalMYR = items.reduce((sum, item) => {
    return sum + (item.line_total || (item.quantity * item.unit_price))
  }, 0)
  
  const taxMYR = quotation.tax || (subtotalMYR * 0.08)
  const totalMYR = quotation.total_amount || (subtotalMYR + taxMYR)
  
  // Convert to display currency if needed
  const subtotal = currency === 'JPY' ? subtotalMYR * conversionRate : subtotalMYR
  const tax = currency === 'JPY' ? taxMYR * conversionRate : taxMYR
  const total = currency === 'JPY' ? totalMYR * conversionRate : totalMYR
  
  // Currency symbol
  const currencySymbol = currency === 'JPY' ? '¥' : 'RM'
  
  // Format currency with appropriate locale
  const formatCurrency = (amount) => {
    const locale = currency === 'JPY' ? 'ja-JP' : 'ms-MY'
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2
    }).format(amount || 0)
  }
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // Format quantity
  const formatQuantity = (quantity) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(quantity || 0)
  }
  
  // Generate items HTML
  const itemsHTML = items.map(item => {
    const unitPrice = currency === 'JPY' ? item.unit_price * conversionRate : item.unit_price
    const lineTotal = currency === 'JPY' ? (item.line_total || (item.quantity * item.unit_price)) * conversionRate : (item.line_total || (item.quantity * item.unit_price))
    
    return `
    <tr>
      <td class="description-col">${item.description}</td>
      <td class="qty-col">${formatQuantity(item.quantity)}</td>
      <td class="price-col">${currencySymbol}${formatCurrency(unitPrice)}</td>
      <td class="amount-col">${currencySymbol}${formatCurrency(lineTotal)}</td>
    </tr>
    `
  }).join('')
  
  // Generate notes HTML
  const notesHTML = quotation.notes 
    ? (Array.isArray(quotation.notes) 
        ? quotation.notes.join('<br>') 
        : quotation.notes.replace(/\n/g, '<br>'))
    : ''

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quotation</title>
    <style>
        @page {
            size: A4;
            margin: 0.75in;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            line-height: 1.4;
            color: #000000;
            background-color: white;
            margin: 0;
            padding: 0;
            font-size: 11pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }

        .quotation-container {
            width: 100%;
            margin: 0;
            background: white;
        }

        .document-title {
            text-align: center;
            font-size: 18pt;
            font-weight: normal;
            margin-bottom: 6pt;
            letter-spacing: 4pt;
            color: #000000;
        }

        .title-underline {
            width: 100%;
            height: 2pt;
            background: #000000;
            margin-bottom: 18pt;
        }

        .header-section {
            display: table;
            width: 100%;
            margin-bottom: 18pt;
        }

        .header-left {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            padding-right: 24pt;
        }

        .header-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            text-align: right;
        }

        .header-right .date-info {
            margin-bottom: 12pt;
        }

        .header-right .date-info div {
            margin-bottom: 2pt;
        }

        .company-info {
            margin-bottom: 12pt;
        }

        .company-name {
            font-size: 14pt;
            font-weight: normal;
            margin-bottom: 3pt;
        }

        .company-details {
            font-size: 10pt;
            line-height: 1.3;
        }

        .client-info {
            text-align: left;
        }

        .amount-section {
            display: table;
            width: 100%;
            margin-bottom: 12pt;
        }

        .total-amount-box {
            display: table-cell;
            width: 50%;
            background: #e8e8e8;
            border: 1pt solid #000000;
            padding: 10pt;
            text-align: center;
            vertical-align: middle;
        }

        .amount-label {
            font-size: 11pt;
            margin-bottom: 4pt;
        }

        .amount-value {
            font-size: 20pt;
            font-weight: bold;
        }

        .payment-terms-box {
            display: table-cell;
            width: 50%;
            border: 1pt solid #000000;
            padding: 0;
        }

        .payment-terms-box table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .payment-terms-box col {
            width: 50%;
        }

        .payment-terms-box td {
            padding: 6pt 12pt;
            border-bottom: 0.5pt solid #000000;
            font-size: 10pt;
            box-sizing: border-box;
        }

        .payment-terms-box td:first-child {
            background: #e8e8e8;
            font-weight: normal;
        }

        .payment-terms-box tr:last-child td {
            border-bottom: none;
        }

        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0;
            border: 1pt solid #000000;
        }

        .items-table th {
            background: #e8e8e8;
            padding: 8pt 6pt;
            border: 0.5pt solid #000000;
            font-size: 11pt;
            font-weight: normal;
            text-align: center;
        }

        .items-table td {
            padding: 6pt;
            border: 0.5pt solid #000000;
            font-size: 10pt;
            text-align: center;
        }

        .items-table .description-col {
            text-align: left;
            width: 50%;
        }

        .items-table .qty-col {
            width: 15%;
        }

        .items-table .price-col {
            width: 17.5%;
        }

        .items-table .amount-col {
            width: 17.5%;
        }

        .totals-section {
            border-left: 1pt solid #000000;
            border-right: 1pt solid #000000;
            border-bottom: 1pt solid #000000;
        }

        .totals-section table {
            width: 100%;
            border-collapse: collapse;
        }

        .totals-section td {
            padding: 6pt 12pt;
            border-top: 0.5pt solid #000000;
            font-size: 10pt;
            text-align: right;
        }

        .totals-section td:first-child {
            background: #e8e8e8;
            text-align: center;
            width: 15%;
        }

        .totals-section .final-total {
            background: #e8e8e8;
            font-weight: bold;
            font-size: 11pt;
        }

        .notes-section {
            margin-top: 18pt;
            border: 1pt solid #000000;
        }

        .notes-header {
            background: #e8e8e8;
            padding: 6pt 12pt;
            font-size: 11pt;
            border-bottom: 0.5pt solid #000000;
        }

        .notes-content {
            padding: 10pt;
            font-size: 10pt;
            line-height: 1.4;
        }

        .text-right {
            text-align: right;
        }

        @media print {
            .items-table tbody tr:empty {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="quotation-container">
        <div class="document-title">QUOTATION</div>
        <div class="title-underline"></div>

        <div class="header-section">
            <div class="header-left">
                <div class="company-info">
                    <div class="company-name">${company?.name || 'WIF Japan Sdn Bhd'}</div>
                    <div class="company-details">
                        ${company?.address || 'No 6, Lorong Kiri 10'}<br>
                        ${company?.city || 'Kampung Datuk Keramat'}<br>
                        ${company?.state || 'Kuala Lumpur'}, ${company?.postal_code || '54000'}<br>
                        ${company?.country || 'Malaysia'}<br>
                        Email: ${company?.email || 'admin@wiftravel.com'}
                    </div>
                </div>
                
                <div class="client-info">
                    <strong>${customer.company_name}</strong><br>
                    ${customer.contact_person || ''}<br><br>
                    We are pleased to submit the following quotation.
                </div>
            </div>

            <div class="header-right">
                <div class="date-info">
                    <div>Issue Date: ${formatDate(quotation.quotation_date) || formatDate(new Date().toISOString())}</div>
                    <div>Quote No.: ${quotation.quotation_number || `QUO-${quotation.id}`}</div>
                </div>

                <div class="company-info">
                    <div class="company-name">${customer.company_name}</div>
                    <div class="company-details">
                        ${customer.address || ''}<br>
                        ${customer.city ? `${customer.city}, ${customer.state || ''} ${customer.postal_code || ''}` : ''}<br>
                        ${customer.address2 || ''}<br>
                        ${customer.phone ? `Tel: ${customer.phone}` : ''}<br>
                        ${customer.email ? `Email: ${customer.email}` : ''}
                    </div>
                </div>
            </div>
        </div>

        <div class="amount-section">
            <div class="total-amount-box">
                <div class="amount-label">Quote Amount</div>
                <div class="amount-value">${currencySymbol}${formatCurrency(subtotal)}</div>
            </div>
            <div class="payment-terms-box">
                <table>
                    <colgroup>
                        <col style="width: 50%;">
                        <col style="width: 50%;">
                    </colgroup>
                    <tr>
                        <td>Payment Terms</td>
                        <td>${quotation.payment_terms || 'Net 30 Days'}</td>
                    </tr>
                    <tr>
                        <td>Valid Until</td>
                        <td>${formatDate(quotation.valid_until) || ''}</td>
                    </tr>
                    ${currency === 'JPY' ? `
                    <tr>
                        <td>Exchange Rate</td>
                        <td>1 MYR = ${formatCurrency(conversionRate)} JPY</td>
                    </tr>` : ''}
                </table>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th class="description-col">Description</th>
                    <th class="qty-col">Qty</th>
                    <th class="price-col">Unit Price</th>
                    <th class="amount-col">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
        </table>

        <div class="totals-section">
            <table>
                <tr>
                    <td>Subtotal</td>
                    <td>${currencySymbol}${formatCurrency(subtotal)}</td>
                </tr>
                <tr>
                    <td>Sales Tax</td>
                    <td>${currencySymbol}${formatCurrency(tax)}</td>
                </tr>
                <tr class="final-total">
                    <td>Total Amount</td>
                    <td>${currencySymbol}${formatCurrency(total)}</td>
                </tr>
            </table>
        </div>

        ${notesHTML ? `
        <div class="notes-section">
            <div class="notes-header">Notes</div>
            <div class="notes-content">
                ${notesHTML}
            </div>
        </div>` : ''}
    </div>
</body>
</html>
  `
}

// PDF Generation endpoint
app.post('/api/generate-quotation-pdf', async (req, res) => {
  console.log('PDF generation request received')
  
  try {
    // Validate input
    const validationErrors = validateQuotationData(req.body)
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      })
    }

    const { filename, options = {} } = req.body
    
    // Get browser instance
    const browser = await getBrowser()
    const page = await browser.newPage()

    try {
      // Set viewport for consistent rendering
      await page.setViewport({ 
        width: 1200, 
        height: 1600,
        deviceScaleFactor: 1
      })

      // Generate HTML content
      const htmlContent = generateQuotationHTML(req.body)
      
      // Set content
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      })

      // Wait for fonts to load
      await page.evaluateHandle('document.fonts.ready')

      // Generate PDF
      const pdfOptions = {
        format: options.format || 'A4',
        margin: {
          top: options.margin || '0.75in',
          right: options.margin || '0.75in',
          bottom: options.margin || '0.75in',
          left: options.margin || '0.75in'
        },
        printBackground: options.printBackground !== false,
        preferCSSPageSize: options.preferCSSPageSize !== false,
        displayHeaderFooter: false,
        timeout: 30000
      }

      console.log('Generating PDF with options:', pdfOptions)
      const pdfBuffer = await page.pdf(pdfOptions)

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename="${filename || 'quotation.pdf'}"`)
      res.setHeader('Content-Length', pdfBuffer.length)

      // Send PDF
      res.send(pdfBuffer)
      
      console.log('PDF generated successfully')

    } finally {
      // Always close the page
      await page.close()
    }

  } catch (error) {
    console.error('PDF generation failed:', error)
    
    res.status(500).json({
      success: false,
      message: 'PDF generation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`PDF service running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})

module.exports = app