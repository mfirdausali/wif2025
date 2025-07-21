<template>
  <div class="quotation-pdf-example">
    <div class="container mt-4">
      <h2>Quotation PDF Generation Example</h2>
      <p class="text-muted">
        This example demonstrates how to use the QuotationPDF component with sample data.
      </p>

      <!-- Sample Data Display -->
      <div class="row mb-4">
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header">
              <h5>Quotation Data</h5>
            </div>
            <div class="card-body">
              <pre class="bg-light p-2 rounded small">{{ JSON.stringify(quotationData, null, 2) }}</pre>
            </div>
          </div>
        </div>
        
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header">
              <h5>Customer Data</h5>
            </div>
            <div class="card-body">
              <pre class="bg-light p-2 rounded small">{{ JSON.stringify(customerData, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Items Data -->
      <div class="card mb-4">
        <div class="card-header">
          <h5>Quotation Items</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in items" :key="index">
                  <td>{{ item.description }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>${{ formatCurrency(item.unit_price) }}</td>
                  <td>${{ formatCurrency(item.line_total || (item.quantity * item.unit_price)) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-info">
                  <td colspan="3"><strong>Subtotal</strong></td>
                  <td><strong>${{ formatCurrency(subtotal) }}</strong></td>
                </tr>
                <tr>
                  <td colspan="3">Sales Tax (8%)</td>
                  <td>${{ formatCurrency(tax) }}</td>
                </tr>
                <tr class="table-success">
                  <td colspan="3"><strong>Total Amount</strong></td>
                  <td><strong>${{ formatCurrency(total) }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- PDF Generation Component -->
      <div class="card">
        <div class="card-header">
          <h5>PDF Generation</h5>
        </div>
        <div class="card-body">
          <QuotationPDF
            :quotation-data="quotationData"
            :customer-data="customerData"
            :items="items"
            :company-data="companyData"
            :filename="filename"
            @generated="onPDFGenerated"
            @error="onPDFError"
          />

          <!-- Status Messages -->
          <div v-if="statusMessage" class="alert alert-info mt-3">
            {{ statusMessage }}
          </div>
        </div>
      </div>

      <!-- Code Example -->
      <div class="card mt-4">
        <div class="card-header">
          <h5>Code Example</h5>
        </div>
        <div class="card-body">
          <pre class="bg-dark text-light p-3 rounded"><code>{{ codeExample }}</code></pre>
        </div>
      </div>

      <!-- API Documentation -->
      <div class="card mt-4">
        <div class="card-header">
          <h5>API Documentation</h5>
        </div>
        <div class="card-body">
          <h6>QuotationPDF Component Props</h6>
          <div class="table-responsive">
            <table class="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>quotationData</code></td>
                  <td>Object</td>
                  <td>Yes</td>
                  <td>Quotation information (id, date, terms, etc.)</td>
                </tr>
                <tr>
                  <td><code>customerData</code></td>
                  <td>Object</td>
                  <td>Yes</td>
                  <td>Customer information (name, address, contact)</td>
                </tr>
                <tr>
                  <td><code>items</code></td>
                  <td>Array</td>
                  <td>Yes</td>
                  <td>Array of quotation items with description, qty, price</td>
                </tr>
                <tr>
                  <td><code>companyData</code></td>
                  <td>Object</td>
                  <td>No</td>
                  <td>Your company information (defaults to Serenity Studio)</td>
                </tr>
                <tr>
                  <td><code>filename</code></td>
                  <td>String</td>
                  <td>No</td>
                  <td>PDF filename (auto-generated if not provided)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h6 class="mt-4">Events</h6>
          <div class="table-responsive">
            <table class="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Payload</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>@generated</code></td>
                  <td><code>{ filename, success }</code></td>
                  <td>Fired when PDF is successfully generated</td>
                </tr>
                <tr>
                  <td><code>@error</code></td>
                  <td><code>Error object</code></td>
                  <td>Fired when PDF generation fails</td>
                </tr>
                <tr>
                  <td><code>@progress</code></td>
                  <td><code>{ progress: number }</code></td>
                  <td>Fired during PDF generation (mobile only)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import QuotationPDF from '../components/QuotationPDF.vue'
import { 
  sampleQuotationData, 
  sampleCustomerData, 
  sampleCompanyData, 
  sampleItems,
  calculateTotals,
  formatCurrency 
} from '../data/sampleQuotationData.js'

export default {
  name: 'QuotationPDFExample',
  components: {
    QuotationPDF
  },
  setup() {
    // Sample data
    const quotationData = ref(sampleQuotationData)
    const customerData = ref(sampleCustomerData)
    const companyData = ref(sampleCompanyData)
    const items = ref(sampleItems)
    const statusMessage = ref('')

    // Computed properties
    const filename = computed(() => {
      return `quotation-${customerData.value.company_name?.replace(/\s+/g, '-').toLowerCase()}-${quotationData.value.quotation_number}.pdf`
    })

    const totals = computed(() => calculateTotals(items.value))
    const subtotal = computed(() => totals.value.subtotal)
    const tax = computed(() => totals.value.tax)
    const total = computed(() => totals.value.total)

    // Event handlers
    const onPDFGenerated = (result) => {
      statusMessage.value = `PDF generated successfully: ${result.filename}`
      setTimeout(() => {
        statusMessage.value = ''
      }, 5000)
    }

    const onPDFError = (error) => {
      statusMessage.value = `PDF generation failed: ${error.message}`
      setTimeout(() => {
        statusMessage.value = ''
      }, 10000)
    }

    // Code example
    const codeExample = `<template>
  <QuotationPDF
    :quotation-data="quotationData"
    :customer-data="customerData"
    :items="items"
    :company-data="companyData"
    :filename="filename"
    @generated="onPDFGenerated"
    @error="onPDFError"
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
    
    const onPDFGenerated = (result) => {
      console.log('PDF generated:', result.filename)
    }
    
    const onPDFError = (error) => {
      console.error('PDF generation failed:', error.message)
    }
    
    return {
      quotationData,
      customerData, 
      items,
      onPDFGenerated,
      onPDFError
    }
  }
}
</script>`

    return {
      // Data
      quotationData,
      customerData,
      companyData,
      items,
      statusMessage,
      codeExample,
      
      // Computed
      filename,
      subtotal,
      tax,
      total,
      
      // Methods
      formatCurrency,
      onPDFGenerated,
      onPDFError
    }
  }
}
</script>

<style scoped>
.quotation-pdf-example {
  margin: 2rem 0;
}

pre {
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.card-header h5 {
  margin-bottom: 0;
}

code {
  background-color: #f8f9fa;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

.table-responsive {
  max-height: 400px;
  overflow-y: auto;
}

.bg-dark code {
  background-color: transparent;
  color: inherit;
}
</style>