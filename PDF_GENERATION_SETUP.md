# Quotation PDF Generation System

A complete PDF generation system for Vue.js applications using Puppeteer, based on the `optimized-quotation.html` template.

## 🚀 Features

- **Text-selectable PDFs** (not image-based)
- **Mobile-optimized** with responsive design
- **Exact template matching** to optimized-quotation.html
- **Progress indicators** for slow networks
- **Error handling** with user-friendly messages
- **Dynamic data binding** for quotation content
- **Security measures** and input validation

## 📁 File Structure

```
wif-japan-erp/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QuotationPDF.vue          # Main PDF component
│   │   │   └── QuotationTemplate.vue     # Template component
│   │   ├── data/
│   │   │   └── sampleQuotationData.js    # Sample data & helpers
│   │   └── examples/
│   │       └── QuotationPDFExample.vue   # Usage example
├── backend/
│   ├── pdf-service.js                    # Express server with Puppeteer
│   └── package.json                      # Backend dependencies
└── optimized-quotation.html              # Reference template
```

## 🛠 Installation

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the PDF service:**
```bash
# Development
npm run dev

# Production
npm start
```

The service will run on `http://localhost:3001`

### Frontend Setup

1. **Copy components to your Vue.js project:**
```bash
# Copy components
cp frontend/src/components/* your-vue-app/src/components/

# Copy data helpers
cp frontend/src/data/* your-vue-app/src/data/

# Copy examples (optional)
cp frontend/src/examples/* your-vue-app/src/examples/
```

2. **Install required dependencies in your Vue app:**
```bash
npm install bootstrap-icons  # For icons (optional)
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Puppeteer configuration (optional)
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Server Configuration

The PDF service includes:
- **Rate limiting**: 100 requests per 15 minutes per IP
- **CORS protection**: Configurable frontend URL
- **Input validation**: Comprehensive data validation
- **Memory management**: Automatic browser cleanup
- **Security headers**: Helmet.js integration

## 📝 Usage

### Basic Usage

```vue
<template>
  <QuotationPDF
    :quotation-data="quotationData"
    :customer-data="customerData"
    :items="items"
    filename="my-quotation.pdf"
    @generated="onSuccess"
    @error="onError"
  />
</template>

<script>
import QuotationPDF from '@/components/QuotationPDF.vue'
import { sampleQuotationData, sampleCustomerData, sampleItems } from '@/data/sampleQuotationData.js'

export default {
  components: { QuotationPDF },
  setup() {
    const quotationData = ref(sampleQuotationData)
    const customerData = ref(sampleCustomerData)
    const items = ref(sampleItems)
    
    const onSuccess = (result) => {
      console.log('PDF generated:', result.filename)
    }
    
    const onError = (error) => {
      console.error('Failed:', error.message)
    }
    
    return {
      quotationData,
      customerData,
      items,
      onSuccess,
      onError
    }
  }
}
</script>
```

### Data Structure

#### Quotation Data
```javascript
const quotationData = {
  id: 1,
  quotation_number: 'QUO-2025-001',
  quotation_date: '2025-07-21T00:00:00.000Z',
  valid_until: '2025-08-20T00:00:00.000Z',
  status: 'Draft',
  payment_terms: 'Net 30 Days',
  subtotal: 9150.00,
  tax: 754.88,
  total_amount: 9904.88,
  notes: ['Payment terms...', 'Additional notes...']
}
```

#### Customer Data
```javascript
const customerData = {
  company_name: 'ABC Corporation',
  contact_person: 'Mr. John Smith',
  email: 'contact@abccorp.com',
  phone: '000-0000-0000',
  address: '123 Business Avenue',
  city: 'New York',
  state: 'NY',
  postal_code: '10001'
}
```

#### Items Data
```javascript
const items = [
  {
    id: 1,
    description: 'Website Design & Development',
    quantity: 1,
    unit_price: 5500.00,
    line_total: 5500.00  // Optional: calculated if not provided
  }
]
```

## 🎨 Customization

### Template Styling

The PDF template exactly matches `optimized-quotation.html`. To customize:

1. **Modify the template**: Edit `QuotationTemplate.vue`
2. **Update server template**: Edit `generateQuotationHTML()` in `pdf-service.js`
3. **Maintain consistency**: Ensure both templates match

### Company Information

Update default company data in `sampleQuotationData.js`:

```javascript
export const sampleCompanyData = {
  name: 'Your Company Name',
  address: 'Your Address',
  city: 'Your City, State ZIP',
  phone: 'Your Phone',
  email: 'your@email.com'
}
```

### PDF Options

Customize PDF generation options:

```javascript
const options = {
  format: 'A4',           // Page format
  margin: '0.75in',       // Page margins
  printBackground: true,  // Include background colors
  preferCSSPageSize: true // Use CSS page size
}
```

## 📱 Mobile Optimization

The system includes mobile-specific features:

- **Device detection**: Automatic mobile/desktop detection
- **Progress indicators**: Visual feedback for slow networks
- **Responsive UI**: Mobile-friendly buttons and layout
- **Error handling**: Mobile-specific error messages

## 🔒 Security

### Input Validation

All data is validated before PDF generation:

- Required field validation
- Data type checking
- SQL injection prevention
- XSS protection

### Rate Limiting

API endpoints are protected with rate limiting:
- 100 requests per 15 minutes per IP
- Configurable limits
- Error responses for exceeded limits

### CORS Protection

Cross-origin requests are controlled:
- Whitelist specific frontend URLs
- Credentials support
- Preflight request handling

## 🚨 Error Handling

### Common Errors

1. **"Invalid quotation data"**: Check required fields
2. **"PDF generation failed"**: Check server logs
3. **"Server error: 500"**: Puppeteer or server issue
4. **"Too many requests"**: Rate limit exceeded

### Debugging

Enable debug mode:

```bash
DEBUG=pdf-service:* npm run dev
```

Check server health:
```bash
curl http://localhost:3001/api/health
```

## 🧪 Testing

### Manual Testing

1. **Start the backend service**
2. **Open the example page**: `QuotationPDFExample.vue`
3. **Click "Generate PDF"**
4. **Verify PDF download**

### API Testing

Test the API endpoint directly:

```bash
curl -X POST http://localhost:3001/api/generate-quotation-pdf \
  -H "Content-Type: application/json" \
  -d @sample-request.json \
  --output test-quotation.pdf
```

## 🔧 Troubleshooting

### Common Issues

1. **Puppeteer installation fails**:
   ```bash
   npm install puppeteer --unsafe-perm=true
   ```

2. **Chrome/Chromium not found**:
   ```bash
   # Install Chromium (Ubuntu/Debian)
   sudo apt-get install chromium-browser
   
   # Set executable path
   export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
   ```

3. **Memory issues**:
   - Increase Node.js memory: `node --max-old-space-size=4096`
   - Monitor browser instances
   - Implement cleanup in production

4. **Slow PDF generation**:
   - Check network connectivity
   - Monitor server resources
   - Optimize template complexity

### Production Deployment

1. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start pdf-service.js --name "pdf-service"
   ```

2. **Configure reverse proxy** (nginx example):
   ```nginx
   location /api/ {
       proxy_pass http://localhost:3001;
       proxy_timeout 60s;
   }
   ```

3. **Monitor memory usage**:
   - Set up monitoring (Prometheus, New Relic)
   - Implement health checks
   - Configure alerts

## 📊 Performance

### Optimization Tips

- **Reuse browser instances**: The service reuses Puppeteer browser instances
- **Optimize template**: Minimize CSS complexity and DOM size
- **Use CDN**: Serve static assets from CDN
- **Cache templates**: Consider template caching for high volume

### Benchmarks

Typical performance on a standard VPS:
- **PDF generation time**: 2-5 seconds
- **Memory usage**: ~150MB per browser instance
- **Concurrent requests**: Up to 10 (depending on server resources)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section
- Review server logs
- Create an issue on the repository