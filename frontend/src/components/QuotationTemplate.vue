<template>
  <div class="quotation-container" :class="{ 'preview-mode': previewMode }">
    <div class="document-title">QUOTATION</div>
    <div class="title-underline"></div>

    <div class="header-section">
      <div class="header-left">
        <div class="company-info">
          <div class="company-name">{{ companyData.name }}</div>
          <div class="company-details">
            {{ companyData.address }}<br>
            {{ companyData.city }}<br>
            Tel: {{ companyData.phone }}<br>
            Email: {{ companyData.email }}
          </div>
        </div>
        
        <div class="client-info">
          <strong>{{ customerData.company_name || 'Customer Company' }}</strong><br>
          {{ customerData.contact_person || 'Contact Person' }}<br><br>
          We are pleased to submit the following quotation.
        </div>
      </div>

      <div class="header-right">
        <div class="date-info">
          <div>Issue Date: {{ formatDate(quotationData.quotation_date) }}</div>
          <div>Quote No.: {{ quotationData.quotation_number || `QUO-${quotationData.id}` }}</div>
        </div>

        <div class="company-info">
          <div class="company-name">{{ customerData.company_name || 'Customer Company' }}</div>
          <div class="company-details">
            {{ customerData.address || 'Customer Address' }}<br>
            {{ customerData.city ? `${customerData.city}, ${customerData.state || ''} ${customerData.postal_code || ''}` : 'City, State Postal' }}<br>
            {{ customerData.address2 || 'Additional Address' }}<br>
            Tel: {{ customerData.phone || '000-0000-0000' }}<br>
            Email: {{ customerData.email || 'contact@customer.com' }}
          </div>
        </div>
      </div>
    </div>

    <div class="amount-section">
      <div class="total-amount-box">
        <div class="amount-label">Quote Amount</div>
        <div class="amount-value">${{ formatCurrency(quotationSubtotal) }}</div>
      </div>
      <div class="payment-terms-box">
        <table>
          <colgroup>
            <col style="width: 50%;">
            <col style="width: 50%;">
          </colgroup>
          <tr>
            <td>Payment Terms</td>
            <td>{{ quotationData.payment_terms || 'Net 30 Days' }}</td>
          </tr>
          <tr>
            <td>Valid Until</td>
            <td>{{ formatDate(quotationData.valid_until) || 'August 20, 2025' }}</td>
          </tr>
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
        <tr v-for="(item, index) in items" :key="index">
          <td class="description-col">{{ item.description || 'Item Description' }}</td>
          <td class="qty-col">{{ formatQuantity(item.quantity) }}</td>
          <td class="price-col">${{ formatCurrency(item.unit_price) }}</td>
          <td class="amount-col">${{ formatCurrency(item.line_total || (item.quantity * item.unit_price)) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals-section">
      <table>
        <tr>
          <td>Subtotal</td>
          <td>${{ formatCurrency(quotationSubtotal) }}</td>
        </tr>
        <tr>
          <td>Sales Tax</td>
          <td>${{ formatCurrency(quotationTax) }}</td>
        </tr>
        <tr class="final-total">
          <td>Total Amount</td>
          <td>${{ formatCurrency(quotationTotal) }}</td>
        </tr>
      </table>
    </div>

    <div class="notes-section">
      <div class="notes-header">Notes</div>
      <div class="notes-content">
        <template v-if="Array.isArray(quotationData.notes)">
          <div v-for="(note, index) in quotationData.notes" :key="index">
            {{ note }}
          </div>
        </template>
        <template v-else-if="quotationData.notes">
          <div v-html="quotationData.notes.replace(/\n/g, '<br>')"></div>
        </template>
        <template v-else>
          • Payment is due within 30 days of invoice date<br>
          • 50% deposit required to commence work<br>
          • Project timeline is 6-8 weeks from deposit receipt<br>
          • All prices are in USD and include specified services only<br>
          • Additional revisions beyond scope may incur extra charges
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'QuotationTemplate',
  props: {
    quotationData: {
      type: Object,
      required: true
    },
    customerData: {
      type: Object,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    companyData: {
      type: Object,
      default: () => ({
        name: 'Serenity Studio',
        address: '789 Innovation Drive',
        city: 'Tech City, TC 12345',
        phone: '(555) 123-4567',
        email: 'hello@serenitystudio.com'
      })
    },
    previewMode: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // Computed values for calculations
    const quotationSubtotal = computed(() => {
      return props.quotationData.subtotal || 
             props.items.reduce((sum, item) => {
               return sum + (item.line_total || (item.quantity * item.unit_price))
             }, 0)
    })

    const quotationTax = computed(() => {
      return props.quotationData.tax || (quotationSubtotal.value * 0.08)
    })

    const quotationTotal = computed(() => {
      return props.quotationData.total_amount || (quotationSubtotal.value + quotationTax.value)
    })

    // Formatting functions
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0)
    }

    const formatQuantity = (quantity) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(quantity || 0)
    }

    const formatDate = (dateString) => {
      if (!dateString) return null
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    return {
      quotationSubtotal,
      quotationTax,
      quotationTotal,
      formatCurrency,
      formatQuantity,
      formatDate
    }
  }
}
</script>

<style scoped>
/* Exact CSS from optimized-quotation.html */
.quotation-container {
  font-family: 'Helvetica', 'Arial', sans-serif;
  line-height: 1.4;
  color: #000000;
  background-color: white;
  margin: 0;
  padding: 0;
  font-size: 11pt;
  width: 100%;
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

/* Preview mode adjustments */
.preview-mode {
  transform: scale(0.8);
  transform-origin: top left;
  width: 125%;
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .preview-mode {
    transform: scale(0.6);
    width: 166.67%;
  }
  
  .header-section {
    display: block;
  }
  
  .header-left,
  .header-right {
    display: block;
    width: 100%;
    padding-right: 0;
    margin-bottom: 12pt;
  }
  
  .header-right {
    text-align: left;
  }
  
  .amount-section {
    display: block;
  }
  
  .total-amount-box,
  .payment-terms-box {
    display: block;
    width: 100%;
    margin-bottom: 12pt;
  }
}

/* Print-specific styles */
@media print {
  .quotation-container {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .items-table tbody tr:empty {
    display: none;
  }
}
</style>