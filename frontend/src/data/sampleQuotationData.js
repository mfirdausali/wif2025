// Sample data structure for quotation PDF generation
// Based on optimized-quotation.html template

export const sampleQuotationData = {
  // Quotation basic information
  id: 1,
  quotation_number: 'QUO-2025-001',
  quotation_date: '2025-07-21T00:00:00.000Z',
  valid_until: '2025-08-20T00:00:00.000Z',
  status: 'Draft', // Draft, Sent, Approved, Rejected
  payment_terms: 'Net 30 Days',
  subtotal: 9150.00,
  tax: 754.88,
  total_amount: 9904.88,
  notes: [
    '• Payment is due within 30 days of invoice date',
    '• 50% deposit required to commence work', 
    '• Project timeline is 6-8 weeks from deposit receipt',
    '• All prices are in USD and include specified services only',
    '• Additional revisions beyond scope may incur extra charges'
  ]
}

export const sampleCustomerData = {
  // Customer company information
  company_name: 'ABC Corporation',
  contact_person: 'Mr. John Smith',
  email: 'contact@abccorp.com',
  phone: '000-0000-0000',
  address: '123 Business Avenue',
  address2: 'Suite 456',
  city: 'New York',
  state: 'NY',
  postal_code: '10001',
  country: 'USA'
}

export const sampleCompanyData = {
  // Our company information
  name: 'Serenity Studio',
  address: '789 Innovation Drive',
  city: 'Tech City, TC 12345',
  phone: '(555) 123-4567',
  email: 'hello@serenitystudio.com',
  website: 'www.serenitystudio.com',
  logo_url: null // Optional logo URL
}

export const sampleItems = [
  {
    id: 1,
    description: 'Website Design & Development',
    quantity: 1,
    unit_price: 5500.00,
    line_total: 5500.00
  },
  {
    id: 2, 
    description: 'SEO Optimization Package',
    quantity: 1,
    unit_price: 1200.00,
    line_total: 1200.00
  },
  {
    id: 3,
    description: 'Content Management System Setup', 
    quantity: 1,
    unit_price: 800.00,
    line_total: 800.00
  },
  {
    id: 4,
    description: 'Logo Design & Branding',
    quantity: 1, 
    unit_price: 750.00,
    line_total: 750.00
  },
  {
    id: 5,
    description: 'Monthly Maintenance (6 months)',
    quantity: 6,
    unit_price: 150.00,
    line_total: 900.00
  }
]

// Complete example data structure
export const completeQuotationExample = {
  quotation: sampleQuotationData,
  customer: sampleCustomerData, 
  company: sampleCompanyData,
  items: sampleItems,
  filename: 'quotation-ABC-Corp-2025-001.pdf'
}

// Data validation schemas
export const quotationDataSchema = {
  required: ['id'],
  optional: [
    'quotation_number', 
    'quotation_date',
    'valid_until', 
    'status',
    'payment_terms',
    'subtotal',
    'tax', 
    'total_amount',
    'notes'
  ]
}

export const customerDataSchema = {
  required: ['company_name'],
  optional: [
    'contact_person',
    'email',
    'phone', 
    'address',
    'address2',
    'city',
    'state',
    'postal_code',
    'country'
  ]
}

export const itemSchema = {
  required: ['description', 'quantity', 'unit_price'],
  optional: ['id', 'line_total']
}

// Helper functions for data manipulation
export const calculateTotals = (items, taxRate = 0.08) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.line_total || (item.quantity * item.unit_price))
  }, 0)
  
  const tax = subtotal * taxRate
  const total = subtotal + tax
  
  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)), 
    total: Number(total.toFixed(2))
  }
}

export const validateQuotationData = (data) => {
  const errors = []
  
  // Validate quotation
  if (!data.quotation?.id) {
    errors.push('Quotation ID is required')
  }
  
  // Validate customer
  if (!data.customer?.company_name) {
    errors.push('Customer company name is required')
  }
  
  // Validate items
  if (!Array.isArray(data.items) || data.items.length === 0) {
    errors.push('At least one item is required')
  }
  
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

// Format currency helper
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

// Format date helper
export const formatDate = (dateString) => {
  if (!dateString) return null
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  })
}

// Generate quotation number helper
export const generateQuotationNumber = (prefix = 'QUO', year = new Date().getFullYear()) => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}-${year}-${random}`
}

// Create empty quotation data
export const createEmptyQuotation = () => ({
  quotation: {
    id: Date.now(),
    quotation_number: generateQuotationNumber(),
    quotation_date: new Date().toISOString(),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    status: 'Draft',
    payment_terms: 'Net 30 Days',
    notes: [
      '• Payment is due within 30 days of invoice date',
      '• 50% deposit required to commence work',
      '• Project timeline is 6-8 weeks from deposit receipt', 
      '• All prices are in USD and include specified services only',
      '• Additional revisions beyond scope may incur extra charges'
    ]
  },
  customer: {
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: ''
  },
  company: sampleCompanyData,
  items: []
})

export default {
  sampleQuotationData,
  sampleCustomerData,
  sampleCompanyData,
  sampleItems,
  completeQuotationExample,
  calculateTotals,
  validateQuotationData,
  formatCurrency,
  formatDate,
  generateQuotationNumber,
  createEmptyQuotation
}