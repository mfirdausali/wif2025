<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Quotations</h1>
            <p class="mt-1 text-sm text-gray-600">
              Manage quotations and proposals for your customers
            </p>
          </div>
          <button
            @click="navigateToCreate"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Quotation
          </button>
        </div>
      </div>
    </header>

    <!-- Filters Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Status Filter -->
          <div>
            <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status-filter"
              v-model="filters.status"
              @change="loadQuotations()"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <!-- Customer Filter -->
          <div>
            <label for="customer-filter" class="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <select
              id="customer-filter"
              v-model="filters.customer_id"
              @change="loadQuotations()"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Customers</option>
              <option 
                v-for="customer in customers" 
                :key="customer.id" 
                :value="customer.id"
              >
                {{ customer.name }}
              </option>
            </select>
          </div>

          <!-- Date From -->
          <div>
            <label for="date-from" class="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              id="date-from"
              v-model="filters.date_from"
              type="date"
              @change="loadQuotations()"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <!-- Date To -->
          <div>
            <label for="date-to" class="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <input
              id="date-to"
              v-model="filters.date_to"
              type="date"
              @change="loadQuotations()"
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <!-- Clear Filters -->
        <div class="mt-4 flex justify-end">
          <button
            @click="clearFilters"
            class="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none focus:underline transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <!-- Loading State -->
      <div 
        v-if="isLoading" 
        class="flex items-center justify-center py-12"
        data-testid="loading-state"
      >
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p class="text-gray-600">Loading quotations...</p>
        </div>
      </div>

      <!-- Error State -->
      <div 
        v-else-if="error" 
        class="rounded-md bg-red-50 p-6"
        data-testid="error-state"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Unable to load quotations
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
            <div class="mt-4">
              <button
                @click="loadQuotations()"
                class="text-sm font-medium text-red-800 hover:text-red-600 focus:outline-none focus:underline transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div 
        v-else-if="quotations.length === 0" 
        class="text-center py-12"
        data-testid="empty-state"
      >
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No quotations found</h3>
        <p class="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
          Start creating quotations for your customers to manage your business proposals.
        </p>
        <div class="mt-6">
          <button
            @click="navigateToCreate"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Your First Quotation
          </button>
        </div>
      </div>

      <!-- Quotations Table -->
      <div v-else data-testid="quotations-list">
        <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <!-- Table Header -->
          <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div class="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div class="col-span-2">ID & Date</div>
              <div class="col-span-3">Customer</div>
              <div class="col-span-2">Total Amount</div>
              <div class="col-span-2">Status</div>
              <div class="col-span-2">Created</div>
              <div class="col-span-1">Actions</div>
            </div>
          </div>

          <!-- Table Body -->
          <div class="divide-y divide-gray-200">
            <div
              v-for="quotation in quotations"
              :key="quotation.id"
              class="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
              data-testid="quotation-row"
              @click="navigateToDetail(quotation.id)"
            >
              <div class="grid grid-cols-12 gap-4 items-center">
                <!-- ID & Date -->
                <div class="col-span-2">
                  <div class="text-sm font-medium text-gray-900">
                    #{{ quotation.id }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ formatDate(quotation.quotation_date) }}
                  </div>
                </div>

                <!-- Customer -->
                <div class="col-span-3">
                  <div class="text-sm font-medium text-gray-900">
                    {{ quotation.customer?.name || 'Unknown Customer' }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ quotation.customer?.contact_person }}
                  </div>
                </div>

                <!-- Total Amount -->
                <div class="col-span-2">
                  <div class="text-sm font-medium text-gray-900">
                    {{ getCurrencySymbol(quotation.currency || 'MYR') }}{{ formatCurrency(quotation.total_amount, quotation.currency || 'MYR') }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ quotation.items?.length || 0 }} items
                  </div>
                </div>

                <!-- Status -->
                <div class="col-span-2">
                  <span :class="getStatusBadgeClass(quotation.status)">
                    {{ quotation.status }}
                  </span>
                </div>

                <!-- Created -->
                <div class="col-span-2">
                  <div class="text-sm text-gray-900">
                    {{ formatDateTime(quotation.created_at) }}
                  </div>
                </div>

                <!-- Actions -->
                <div class="col-span-1">
                  <div class="flex items-center space-x-2">
                    <button
                      @click.stop="navigateToDetail(quotation.id)"
                      class="text-indigo-600 hover:text-indigo-800 text-sm font-medium focus:outline-none focus:underline transition-colors"
                    >
                      View
                    </button>
                    <button
                      @click.stop="exportQuotationPDF(quotation)"
                      class="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 rounded p-1 transition-colors"
                      title="Download PDF"
                      data-testid="export-pdf-btn"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination && pagination.last_page > 1"
          class="flex items-center justify-between mt-6"
        >
          <div class="text-sm text-gray-700">
            Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} quotations
          </div>
          <div class="flex space-x-2">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="loadPage(page)"
              :disabled="page === pagination.current_page"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                page === pagination.current_page
                  ? 'bg-indigo-600 text-white cursor-default'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              ]"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { quotationAPI, customerAPI } from '@/services/apiClient'

// Router instance
const router = useRouter()

// Reactive state
const quotations = ref([])
const customers = ref([])
const pagination = ref(null)
const isLoading = ref(false)
const error = ref('')

// Filters
const filters = ref({
  status: '',
  customer_id: '',
  date_from: '',
  date_to: ''
})

// Computed properties
const visiblePages = computed(() => {
  if (!pagination.value) return []
  
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  const pages = []
  
  const start = Math.max(1, current - 2)
  const end = Math.min(last, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const formatCurrency = (amount, currency = 'MYR') => {
  const locale = currency === 'JPY' ? 'ja-JP' : 'ms-MY'
  const fractionDigits = currency === 'JPY' ? 0 : 2
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(amount)
}

const getCurrencySymbol = (currency) => {
  return currency === 'JPY' ? '¥' : 'RM'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusBadgeClass = (status) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  
  switch (status) {
    case 'Draft':
      return `${baseClasses} bg-gray-100 text-gray-800`
    case 'Sent':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'Accepted':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'Declined':
      return `${baseClasses} bg-red-100 text-red-800`
    case 'Expired':
      return `${baseClasses} bg-yellow-100 text-yellow-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
}

const loadQuotations = async (page = 1) => {
  isLoading.value = true
  error.value = ''
  
  try {
    const params = { page, ...filters.value }
    
    // Remove empty filter values
    Object.keys(params).forEach(key => {
      if (params[key] === '') {
        delete params[key]
      }
    })
    
    const response = await quotationAPI.getQuotations(params)
    quotations.value = response.data || []
    pagination.value = {
      current_page: response.current_page,
      last_page: response.last_page,
      from: response.from,
      to: response.to,
      total: response.total
    }
  } catch (err) {
    console.error('Failed to load quotations:', err)
    error.value = err.message || 'Failed to load quotations. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const loadCustomers = async () => {
  try {
    const response = await customerAPI.getCustomers()
    customers.value = response.data || []
  } catch (err) {
    console.error('Failed to load customers:', err)
  }
}

const loadPage = (page) => {
  if (page !== pagination.value?.current_page) {
    loadQuotations(page)
  }
}

const clearFilters = () => {
  filters.value = {
    status: '',
    customer_id: '',
    date_from: '',
    date_to: ''
  }
  loadQuotations()
}

const navigateToCreate = () => {
  router.push('/quotations/create')
}

const navigateToDetail = (quotationId) => {
  router.push(`/quotations/${quotationId}`)
}

const exportQuotationPDF = async (quotation) => {
  try {
    // If quotation doesn't have full details, fetch them first
    let fullQuotation = quotation
    if (!quotation.items || !quotation.customer) {
      const response = await quotationAPI.getQuotation(quotation.id)
      fullQuotation = response.data || response
    }
    
    // Generate and download PDF using new API
    await generatePDF(fullQuotation)
  } catch (err) {
    console.error('Failed to export PDF:', err)
    // Could show a toast notification here
    alert('Failed to export PDF. Please try again.')
  }
}

// PDF Generation function using new API
const generatePDF = async (quotation) => {
  try {
    // Prepare data for the new Puppeteer PDF service
    const pdfData = {
      quotation: {
        id: quotation.id,
        quotation_number: `QUO-${quotation.id}`,
        quotation_date: quotation.quotation_date || quotation.created_at,
        valid_until: quotation.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: quotation.status,
        payment_terms: quotation.payment_terms || 'Net 30 Days',
        currency: quotation.currency || 'MYR',
        conversion_rate: quotation.conversion_rate || 1,
        subtotal: parseFloat(quotation.total_amount) || 0,
        tax: (parseFloat(quotation.total_amount) || 0) * 0.08,
        total_amount: parseFloat(quotation.total_amount) || 0,
        notes: quotation.notes || [
          '• Payment is due within 30 days of invoice date',
          '• 50% deposit required to commence work',
          '• Project timeline is 6-8 weeks from deposit receipt',
          '• All prices are in specified currency and include mentioned services only'
        ]
      },
      customer: {
        company_name: quotation.customer?.name || 'Unknown Customer',
        contact_person: quotation.customer?.contact_person || '',
        email: quotation.customer?.email || '',
        phone: quotation.customer?.phone || '',
        address: quotation.customer?.address || '',
        city: '',
        state: '',
        postal_code: ''
      },
      items: quotation.items?.map(item => ({
        id: item.id,
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        unit_price: parseFloat(item.unit_price) || 0,
        line_total: parseFloat(item.line_total) || (parseFloat(item.quantity) * parseFloat(item.unit_price))
      })) || [],
      company: {
        name: 'WIF Japan Sdn Bhd',
        address: 'No 6, Lorong Kiri 10',
        city: 'Kampung Datuk Keramat, Kuala Lumpur 54000',
        phone: '(555) 123-4567',
        email: 'admin@wiftravel.com'
      }
    }

    // Call the new Puppeteer PDF API
    const response = await fetch('http://localhost:3001/api/generate-quotation-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pdfData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || errorData.error || 'Failed to generate PDF')
    }

    // Download the PDF
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quotation-${quotation.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('PDF generated successfully')
  } catch (err) {
    console.error('Failed to generate PDF:', err)
    throw err // Re-throw to be handled by the calling function
  }
}

// Load data on component mount
onMounted(() => {
  loadQuotations()
  loadCustomers()
})
</script>

<style scoped>
/* Component-specific styles following minimalist design principles */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Hover effects for better interactivity */
.hover\:bg-gray-50:hover {
  background-color: rgb(249 250 251);
}

.hover\:bg-indigo-700:hover {
  background-color: rgb(67 56 202);
}

/* Focus states for accessibility */
button:focus,
select:focus,
input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Table row hover effect */
[data-testid="quotation-row"]:hover {
  background-color: rgb(249 250 251);
}
</style>