import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * PDF Generator for WIF Japan ERP System
 * Following Japanese design principles of clarity and precision
 * Implements clean, professional quotation documents
 */

class PDFGenerator {
  constructor() {
    // RGB color values for jsPDF (0-255)
    this.primaryColor = [79, 70, 229] // Indigo-600
    this.secondaryColor = [107, 114, 128] // Gray-500
    this.textColor = [17, 24, 39] // Gray-900
    this.lightGray = [243, 244, 246] // Gray-100
    this.borderColor = [229, 231, 235] // Gray-200
    this.white = [255, 255, 255]
    this.black = [0, 0, 0]
  }

  /**
   * Generate quotation PDF document
   * @param {Object} quotation - Complete quotation data with customer and items
   * @returns {void} - Downloads the PDF file
   */
  generateQuotationPDF(quotation) {
    try {
      // Validate input data
      if (!quotation || !quotation.id) {
        throw new Error('Invalid quotation data')
      }

      // Create new PDF document
      const doc = new jsPDF('p', 'mm', 'a4')
      
      // Set document properties
      doc.setProperties({
        title: `Quotation #${quotation.id}`,
        subject: 'Quotation Document',
        author: 'WIF Japan ERP',
        creator: 'WIF Japan Tour Company',
        producer: 'jsPDF'
      })

      // Add header
      this.addHeader(doc, quotation)
      
      // Add company and customer information
      let currentY = this.addCompanyInfo(doc, 40)
      currentY = this.addCustomerInfo(doc, quotation.customer || {}, currentY)
      
      // Add quotation details
      currentY = this.addQuotationDetails(doc, quotation, currentY)
      
      // Add line items table
      currentY = this.addLineItemsTable(doc, quotation.items || [], currentY)
      
      // Add totals
      currentY = this.addTotals(doc, quotation, currentY)
      
      // Add footer
      this.addFooter(doc)
      
      // Generate safe filename
      const dateStr = quotation.quotation_date ? 
        this.formatDate(quotation.quotation_date).replace(/[^a-zA-Z0-9]/g, '_') : 
        'No_Date'
      const fileName = `Quotation_${quotation.id}_${dateStr}.pdf`
      
      // Save and download the PDF
      doc.save(fileName)
      
      return true
    } catch (error) {
      console.error('PDF generation failed:', error)
      throw new Error('Failed to generate PDF. Please try again.')
    }
  }

  /**
   * Add document header with company branding
   */
  addHeader(doc, quotation) {
    try {
      // Company name and logo area
      doc.setFillColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2])
      doc.rect(0, 0, 210, 25, 'F')
      
      // Company name
      doc.setTextColor(this.white[0], this.white[1], this.white[2])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(20)
      doc.text('WIF JAPAN TOUR COMPANY', 20, 12)
      
      // Subtitle
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Professional Travel Services & Tour Management', 20, 18)
      
      // Document title
      doc.setTextColor(this.textColor[0], this.textColor[1], this.textColor[2])
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('QUOTATION', 150, 12)
      
      // Quotation number and status
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`#${quotation.id || 'N/A'}`, 150, 18)
      
      // Status badge (only if status exists)
      if (quotation.status) {
        const statusColor = this.getStatusColor(quotation.status)
        doc.setFillColor(statusColor.bg[0], statusColor.bg[1], statusColor.bg[2])
        doc.setTextColor(statusColor.text[0], statusColor.text[1], statusColor.text[2])
        doc.rect(170, 8, 25, 6, 'F') // Use rect instead of roundedRect for better compatibility
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.text(quotation.status, 172, 12)
      }
    } catch (error) {
      console.error('Error in addHeader:', error)
      // Continue with basic header if advanced features fail
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('QUOTATION', 20, 20)
    }
  }

  /**
   * Add company information section
   */
  addCompanyInfo(doc, startY) {
    doc.setTextColor(this.textColor[0], this.textColor[1], this.textColor[2])
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('FROM:', 20, startY)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    
    const companyInfo = [
      'WIF Japan Tour Company',
      'Tokyo Business Center',
      '1-2-3 Shibuya, Shibuya-ku',
      'Tokyo 150-0002, Japan',
      'Tel: +81-3-1234-5678',
      'Email: info@wifjapan.com',
      'Website: www.wifjapan.com'
    ]
    
    companyInfo.forEach((line, index) => {
      doc.text(line, 20, startY + 6 + (index * 4))
    })
    
    return startY + 35
  }

  /**
   * Add customer information section
   */
  addCustomerInfo(doc, customer, startY) {
    doc.setTextColor(...this.textColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('TO:', 20, startY)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    
    const customerInfo = [
      customer.name || 'N/A',
      customer.contact_person ? `Attn: ${customer.contact_person}` : '',
      customer.email || '',
      customer.phone || '',
      customer.address || ''
    ].filter(Boolean)
    
    customerInfo.forEach((line, index) => {
      doc.text(line, 20, startY + 6 + (index * 4))
    })
    
    return startY + Math.max(25, customerInfo.length * 4 + 10)
  }

  /**
   * Add quotation details section
   */
  addQuotationDetails(doc, quotation, startY) {
    // Section background
    doc.setFillColor(...this.lightGray)
    doc.rect(20, startY, 170, 20, 'F')
    
    // Section border
    doc.setDrawColor(...this.borderColor)
    doc.setLineWidth(0.5)
    doc.rect(20, startY, 170, 20)
    
    doc.setTextColor(...this.textColor)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('QUOTATION DETAILS', 25, startY + 7)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    
    // Details in two columns
    const details = [
      { label: 'Quotation Date:', value: this.formatDate(quotation.quotation_date) },
      { label: 'Created:', value: this.formatDateTime(quotation.created_at) },
      { label: 'Status:', value: quotation.status },
      { label: 'Valid Until:', value: this.calculateValidUntil(quotation.quotation_date) }
    ]
    
    details.forEach((detail, index) => {
      const x = index % 2 === 0 ? 25 : 120
      const y = startY + 12 + Math.floor(index / 2) * 4
      
      doc.setFont('helvetica', 'bold')
      doc.text(detail.label, x, y)
      doc.setFont('helvetica', 'normal')
      doc.text(detail.value, x + 25, y)
    })
    
    return startY + 25
  }

  /**
   * Add line items table
   */
  addLineItemsTable(doc, items, startY) {
    const tableColumns = [
      { header: 'Description', dataKey: 'description' },
      { header: 'Qty', dataKey: 'quantity' },
      { header: 'Unit Price (¥)', dataKey: 'unit_price' },
      { header: 'Total (¥)', dataKey: 'line_total' }
    ]
    
    const tableRows = items.map(item => ({
      description: item.description || 'N/A',
      quantity: this.formatNumber(item.quantity),
      unit_price: this.formatCurrency(item.unit_price),
      line_total: this.formatCurrency(item.line_total || (item.quantity * item.unit_price))
    }))
    
    doc.autoTable({
      startY: startY + 5,
      head: [tableColumns.map(col => col.header)],
      body: tableRows.map(row => tableColumns.map(col => row[col.dataKey])),
      theme: 'grid',
      headStyles: {
        fillColor: this.primaryColor,
        textColor: this.white,
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: this.textColor
      },
      columnStyles: {
        0: { cellWidth: 80, halign: 'left' },   // Description
        1: { cellWidth: 25, halign: 'center' }, // Quantity
        2: { cellWidth: 35, halign: 'right' },  // Unit Price
        3: { cellWidth: 35, halign: 'right' }   // Total
      },
      alternateRowStyles: {
        fillColor: this.lightGray
      },
      tableLineColor: this.borderColor,
      tableLineWidth: 0.5,
      margin: { left: 20, right: 20 }
    })
    
    return doc.lastAutoTable.finalY || startY + 40
  }

  /**
   * Add totals section
   */
  addTotals(doc, quotation, startY) {
    const totalY = startY + 10
    
    // Totals box
    doc.setFillColor(...this.primaryColor)
    doc.rect(140, totalY, 50, 20, 'F')
    
    doc.setTextColor(...this.white)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('TOTAL AMOUNT', 145, totalY + 7)
    
    doc.setFontSize(14)
    doc.text(`¥${this.formatCurrency(quotation.total_amount)}`, 145, totalY + 15)
    
    // Payment terms
    doc.setTextColor(...this.textColor)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    
    const paymentTerms = [
      'Payment Terms:',
      '• 50% deposit required upon acceptance',
      '• Balance due 7 days before service date',
      '• Payment accepted via bank transfer or credit card',
      '• Late payments subject to 1.5% monthly interest'
    ]
    
    paymentTerms.forEach((term, index) => {
      const font = index === 0 ? 'bold' : 'normal'
      doc.setFont('helvetica', font)
      doc.text(term, 20, totalY + 25 + (index * 4))
    })
    
    return totalY + 50
  }

  /**
   * Add document footer
   */
  addFooter(doc) {
    const pageHeight = doc.internal.pageSize.height
    const footerY = pageHeight - 25
    
    // Footer background
    doc.setFillColor(...this.lightGray)
    doc.rect(0, footerY, 210, 25, 'F')
    
    doc.setTextColor(...this.secondaryColor)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    
    // Footer content
    doc.text('This quotation is valid for 30 days from the date of issue.', 20, footerY + 8)
    doc.text('Subject to terms and conditions. Prices may vary based on final requirements.', 20, footerY + 12)
    
    // Company footer
    doc.text('WIF Japan Tour Company - Your Gateway to Japan', 20, footerY + 18)
    
    // Page number
    const pageCount = doc.internal.getNumberOfPages()
    doc.text(`Page 1 of ${pageCount}`, 170, footerY + 18)
    
    // Generation timestamp
    doc.setFontSize(7)
    doc.text(`Generated on ${this.formatDateTime(new Date().toISOString())}`, 170, footerY + 8)
  }

  /**
   * Get status color configuration
   */
  getStatusColor(status) {
    const colors = {
      'Draft': { bg: [156, 163, 175], text: [31, 41, 55] },      // Gray
      'Sent': { bg: [147, 197, 253], text: [30, 64, 175] },      // Blue
      'Accepted': { bg: [134, 239, 172], text: [21, 128, 61] },  // Green
      'Declined': { bg: [252, 165, 165], text: [153, 27, 27] },  // Red
      'Expired': { bg: [253, 230, 138], text: [146, 64, 14] }    // Yellow
    }
    
    return colors[status] || colors['Draft']
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('ja-JP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0)
  }

  /**
   * Format number for display
   */
  formatNumber(number) {
    return new Intl.NumberFormat('ja-JP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number || 0)
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Format datetime for display
   */
  formatDateTime(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Calculate quotation validity period
   */
  calculateValidUntil(quotationDate) {
    const date = new Date(quotationDate)
    date.setDate(date.getDate() + 30) // 30 days validity
    return this.formatDate(date.toISOString())
  }
}

// Export singleton instance
export default new PDFGenerator()