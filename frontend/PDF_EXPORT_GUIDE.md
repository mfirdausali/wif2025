# PDF Export Functionality Guide

## Overview

The WIF Japan ERP system includes comprehensive PDF export functionality for quotations, allowing users to generate professional, printable documents that follow Japanese design principles and business standards.

## Features

### 🎨 Professional Design
- **Japanese Design Principles**: Clean, minimalist layout following Ma (間) principles
- **Company Branding**: Header with WIF Japan Tour Company branding
- **Status Indicators**: Color-coded status badges
- **Responsive Layout**: Optimized for A4 printing

### 📄 Document Structure
1. **Header Section**
   - Company logo area with branding
   - Document title and quotation number
   - Status badge with appropriate colors

2. **Company Information**
   - Complete contact details
   - Professional business address
   - Contact information

3. **Customer Information**
   - Customer name and contact person
   - Email and phone details
   - Complete address

4. **Quotation Details**
   - Quotation date and creation timestamp
   - Current status
   - Validity period (30 days default)

5. **Line Items Table**
   - Detailed service descriptions
   - Quantities and unit prices
   - Line totals with Japanese currency formatting

6. **Totals Section**
   - Prominent total amount display
   - Payment terms and conditions

7. **Footer**
   - Terms and conditions
   - Generation timestamp
   - Page numbering

## Usage

### From Quotation Detail Page

```javascript
// QuotationView.vue
const generatePDF = async () => {
  try {
    pdfGenerator.generateQuotationPDF(quotation.value)
    console.log('PDF generated successfully')
  } catch (err) {
    error.value = err.message
  }
}
```

### From Quotations List

```javascript
// QuotationsPage.vue
const exportQuotationPDF = async (quotation) => {
  try {
    // Fetch full details if needed
    let fullQuotation = quotation
    if (!quotation.items || !quotation.customer) {
      const response = await quotationAPI.getQuotation(quotation.id)
      fullQuotation = response.data || response
    }
    
    pdfGenerator.generateQuotationPDF(fullQuotation)
  } catch (err) {
    alert('Failed to export PDF. Please try again.')
  }
}
```

### During Quotation Creation

```javascript
// QuotationBuilder.vue
const handleSaveAndExportPDF = async () => {
  try {
    // Create quotation
    const savedQuotation = await quotationAPI.createQuotation(quotationData)
    
    // Fetch full details
    const fullQuotation = await quotationAPI.getQuotation(savedQuotation.id)
    
    // Generate PDF
    pdfGenerator.generateQuotationPDF(fullQuotation.data || fullQuotation)
    
    emit('quotation-saved', savedQuotation)
  } catch (error) {
    handleValidationErrors(error)
  }
}
```

## Technical Implementation

### Dependencies

```json
{
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.5.28"
}
```

### Installation

```bash
npm install jspdf jspdf-autotable
```

### PDF Generator Class

The `PDFGenerator` class (`src/utils/pdfGenerator.js`) handles all PDF generation logic:

```javascript
import pdfGenerator from '@/utils/pdfGenerator'

// Generate PDF for a quotation
pdfGenerator.generateQuotationPDF(quotationData)
```

### Key Methods

#### `generateQuotationPDF(quotation)`
Main method that orchestrates the entire PDF generation process.

**Parameters:**
- `quotation` (Object): Complete quotation data including customer and items

**Returns:**
- Downloads PDF file automatically
- Throws error if generation fails

#### Formatting Methods

```javascript
// Currency formatting (Japanese locale)
formatCurrency(1234.56) // Returns "1,234.56"

// Date formatting
formatDate('2024-01-15') // Returns "January 15, 2024"

// DateTime formatting
formatDateTime('2024-01-15T10:30:00Z') // Returns "Jan 15, 2024, 10:30 AM"
```

## UI Integration

### Quotation Detail Page
- **Quick Actions Sidebar**: Download PDF button
- **Loading States**: Shows generating status
- **Error Handling**: Displays error messages

### Quotations List Page
- **Action Buttons**: PDF export icon next to each quotation
- **Bulk Operations**: Export individual quotations
- **Auto-fetch**: Fetches full details if needed

### Quotation Builder
- **Save & Export PDF**: Creates quotation and generates PDF in one action
- **Visual Feedback**: Loading states and success indicators
- **Form Validation**: Ensures valid data before export

## Status Color Coding

```javascript
const statusColors = {
  'Draft': { bg: 'Gray', text: 'Dark Gray' },
  'Sent': { bg: 'Blue', text: 'Dark Blue' },
  'Accepted': { bg: 'Green', text: 'Dark Green' },
  'Declined': { bg: 'Red', text: 'Dark Red' },
  'Expired': { bg: 'Yellow', text: 'Dark Orange' }
}
```

## File Naming Convention

PDF files are automatically named using the pattern:
```
Quotation_{ID}_{Date}.pdf
Example: Quotation_123_January_15,_2024.pdf
```

## Error Handling

### Common Errors
1. **Missing Data**: Handles null/undefined customer or items
2. **Network Issues**: Graceful fallback with error messages
3. **PDF Generation Failures**: Throws descriptive error messages

### Error Messages
```javascript
try {
  pdfGenerator.generateQuotationPDF(quotation)
} catch (error) {
  // Error: "Failed to generate PDF. Please try again."
  console.error('PDF generation failed:', error)
}
```

## Testing

### Unit Tests
- PDF generator utility tests (`src/utils/__tests__/pdfGenerator.test.js`)
- Component integration tests
- Error handling scenarios

### Test Coverage
- ✅ PDF generation with valid data
- ✅ Error handling with invalid data
- ✅ Currency and date formatting
- ✅ Status color mapping
- ✅ File naming conventions

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 18+

### Features
- ✅ Automatic file download
- ✅ Print optimization
- ✅ Mobile responsive design

## Performance Considerations

### Optimization
- **Lazy Loading**: PDF library loaded on demand
- **Efficient Rendering**: Minimal DOM manipulation
- **Memory Management**: Proper cleanup after generation

### File Sizes
- Typical PDF size: 50-100KB
- Optimized fonts and graphics
- Compressed content where possible

## Accessibility

### Features
- **High Contrast**: Proper color contrast ratios
- **Readable Fonts**: Professional font selection
- **Logical Structure**: Proper document hierarchy
- **Print Friendly**: Optimized for screen readers

## Future Enhancements

### Planned Features
1. **Email Integration**: Direct email sending with PDF attachment
2. **Template Customization**: Multiple PDF templates
3. **Bulk Export**: Export multiple quotations at once
4. **Digital Signatures**: Electronic signature integration
5. **Multi-language**: Support for Japanese text

### API Integration
```javascript
// Future: Server-side PDF generation
const pdfUrl = await quotationAPI.generatePDF(quotationId)
window.open(pdfUrl, '_blank')
```

## Troubleshooting

### Common Issues

1. **PDF Not Downloading**
   ```javascript
   // Check browser popup blocker
   // Ensure user interaction triggered the action
   ```

2. **Missing Data in PDF**
   ```javascript
   // Verify quotation has complete data
   if (!quotation.customer || !quotation.items) {
     // Fetch full quotation details first
   }
   ```

3. **Formatting Issues**
   ```javascript
   // Check currency values are numbers
   const amount = parseFloat(item.unit_price) || 0
   ```

## Support

For technical support or feature requests related to PDF export functionality:

1. Check the console for error messages
2. Verify quotation data completeness
3. Test with different browsers
4. Contact development team with specific error details

---

*This PDF export functionality is part of the WIF Japan ERP system and follows Japanese business standards for professional document generation.*