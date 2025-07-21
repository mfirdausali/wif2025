<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div 
      v-if="isLoading" 
      class="flex items-center justify-center py-24"
      data-testid="loading-state"
    >
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p class="text-gray-600">Loading quotation details...</p>
      </div>
    </div>

    <!-- Error State -->
    <div 
      v-else-if="error" 
      class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      data-testid="error-state"
    >
      <div class="rounded-md bg-red-50 p-6 border border-red-200">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Unable to load quotation
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
            <div class="mt-4">
              <button
                @click="loadQuotation"
                class="text-sm font-medium text-red-800 hover:text-red-600 focus:outline-none focus:underline transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="quotation" data-testid="quotation-detail">
      <!-- Header with Navigation and Actions -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
            <!-- Navigation and Title -->
            <div class="flex items-center space-x-4">
              <button
                @click="navigateBack"
                class="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md p-1 transition-colors"
              >
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 class="text-2xl font-semibold text-gray-900">
                  Quotation #{{ quotation.id }}
                </h1>
                <p class="mt-1 text-sm text-gray-600">
                  Created {{ formatDateTime(quotation.created_at) }}
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-3">
              <!-- Status Badge -->
              <span :class="getStatusBadgeClass(quotation.status)">
                {{ quotation.status }}
              </span>

              <!-- Edit Button -->
              <button
                @click="navigateToEdit"
                :disabled="quotation.status === 'Accepted' || quotation.status === 'Declined'"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>

              <!-- Status Update Dropdown -->
              <div class="relative" v-if="canUpdateStatus">
                <button
                  @click="showStatusDropdown = !showStatusDropdown"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Update Status
                  <svg class="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="showStatusDropdown"
                  v-click-outside="() => showStatusDropdown = false"
                  class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                >
                  <div class="py-1">
                    <button
                      v-for="status in availableStatuses"
                      :key="status.value"
                      @click="updateStatus(status.value)"
                      :disabled="isUpdatingStatus"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      <div class="flex items-center justify-between">
                        <span>{{ status.label }}</span>
                        <span v-if="status.value === quotation.status" class="text-indigo-600">
                          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                          </svg>
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Grid -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Main Content - Quotation Details -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Customer Information -->
            <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 class="text-lg font-medium text-gray-900">Customer Information</h3>
              </div>
              <div class="px-6 py-4">
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Company Name</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ quotation.customer?.name || 'Unknown Customer' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Contact Person</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ quotation.customer?.contact_person || 'N/A' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Email</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      <a 
                        v-if="quotation.customer?.email" 
                        :href="`mailto:${quotation.customer.email}`"
                        class="text-indigo-600 hover:text-indigo-800 focus:outline-none focus:underline transition-colors"
                      >
                        {{ quotation.customer.email }}
                      </a>
                      <span v-else class="text-gray-500">N/A</span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Phone</dt>
                    <dd class="mt-1 text-sm text-gray-900">
                      <a 
                        v-if="quotation.customer?.phone" 
                        :href="`tel:${quotation.customer.phone}`"
                        class="text-indigo-600 hover:text-indigo-800 focus:outline-none focus:underline transition-colors"
                      >
                        {{ quotation.customer.phone }}
                      </a>
                      <span v-else class="text-gray-500">N/A</span>
                    </dd>
                  </div>
                  <div class="md:col-span-2" v-if="quotation.customer?.address">
                    <dt class="text-sm font-medium text-gray-500">Address</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ quotation.customer.address }}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <!-- Line Items -->
            <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 class="text-lg font-medium text-gray-900">Line Items</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="item in quotation.items" :key="item.id">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ item.description }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ formatNumber(item.quantity) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {{ currencySymbol }}{{ formatCurrency(item.unit_price) }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {{ currencySymbol }}{{ formatCurrency(item.line_total || (item.quantity * item.unit_price)) }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50">
                    <tr>
                      <td colspan="3" class="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        Total Amount:
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-lg font-bold text-indigo-900">
                        {{ currencySymbol }}{{ formatCurrency(quotation.total_amount) }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- Sidebar - Quotation Details -->
          <div class="space-y-6">
            <!-- Quotation Summary -->
            <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 class="text-lg font-medium text-gray-900">Quotation Details</h3>
              </div>
              <div class="px-6 py-4">
                <dl class="space-y-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Quotation Date</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDate(quotation.quotation_date) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Status</dt>
                    <dd class="mt-1">
                      <span :class="getStatusBadgeClass(quotation.status)">
                        {{ quotation.status }}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Total Items</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ quotation.items?.length || 0 }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Total Amount</dt>
                    <dd class="mt-1 text-xl font-bold text-indigo-900">{{ currencySymbol }}{{ formatCurrency(quotation.total_amount) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Created</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDateTime(quotation.created_at) }}</dd>
                  </div>
                  <div v-if="quotation.updated_at !== quotation.created_at">
                    <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDateTime(quotation.updated_at) }}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 class="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div class="px-6 py-4 space-y-3">
                <!-- Generate PDF -->
                <button
                  @click="generatePDF"
                  :disabled="isGeneratingPDF"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                  data-testid="generate-pdf-btn"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {{ isGeneratingPDF ? 'Generating...' : 'Download PDF' }}
                </button>

                <!-- Email Quotation -->
                <button
                  @click="emailQuotation"
                  :disabled="!quotation.customer?.email || isEmailingQuotation"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ isEmailingQuotation ? 'Sending...' : 'Email Quotation' }}
                </button>

                <!-- Delete Quotation -->
                <button
                  v-if="quotation.status === 'Draft'"
                  @click="confirmDelete"
                  :disabled="isDeletingQuotation"
                  class="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                >
                  <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {{ isDeletingQuotation ? 'Deleting...' : 'Delete Quotation' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="showDeleteModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-2">Delete Quotation</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Are you sure you want to delete this quotation? This action cannot be undone.
            </p>
          </div>
          <div class="items-center px-4 py-3 space-x-3 flex justify-center">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              @click="deleteQuotation"
              :disabled="isDeletingQuotation"
              class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              {{ isDeletingQuotation ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { quotationAPI } from '@/services/apiClient'

// Router instances
const router = useRouter()
const route = useRoute()

// Reactive state
const quotation = ref(null)
const isLoading = ref(false)
const error = ref('')
const isUpdatingStatus = ref(false)
const isGeneratingPDF = ref(false)
const isEmailingQuotation = ref(false)
const isDeletingQuotation = ref(false)
const showStatusDropdown = ref(false)
const showDeleteModal = ref(false)

// Status management
const statusOptions = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Declined', label: 'Declined' },
  { value: 'Expired', label: 'Expired' }
]

// Computed properties
const canUpdateStatus = computed(() => {
  return quotation.value && quotation.value.status !== 'Accepted' && quotation.value.status !== 'Declined'
})

const availableStatuses = computed(() => {
  if (!quotation.value) return []
  
  // Filter out current status and implement business logic
  return statusOptions.filter(status => {
    if (status.value === quotation.value.status) return true
    
    // Business rules for status transitions
    switch (quotation.value.status) {
      case 'Draft':
        return ['Sent', 'Expired'].includes(status.value)
      case 'Sent':
        return ['Accepted', 'Declined', 'Expired'].includes(status.value)
      case 'Accepted':
      case 'Declined':
        return false // Final states
      case 'Expired':
        return ['Draft', 'Sent'].includes(status.value)
      default:
        return false
    }
  })
})

// Computed properties for currency
const currency = computed(() => quotation.value?.currency || 'MYR')
const currencySymbol = computed(() => currency.value === 'JPY' ? '¥' : 'RM')

// Methods
const formatCurrency = (amount) => {
  const fractionDigits = currency.value === 'JPY' ? 0 : 2
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(amount)
}

const formatNumber = (number) => {
  return new Intl.NumberFormat('ja-JP', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
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

const loadQuotation = async () => {
  const quotationId = route.params.id
  if (!quotationId) {
    error.value = 'Invalid quotation ID'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await quotationAPI.getQuotation(quotationId)
    quotation.value = response.data || response
  } catch (err) {
    console.error('Failed to load quotation:', err)
    error.value = err.message || 'Failed to load quotation. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async (newStatus) => {
  if (isUpdatingStatus.value) return

  isUpdatingStatus.value = true
  showStatusDropdown.value = false

  try {
    const response = await quotationAPI.updateQuotationStatus(quotation.value.id, newStatus)
    quotation.value = response.data || response
  } catch (err) {
    console.error('Failed to update quotation status:', err)
    error.value = err.message || 'Failed to update quotation status. Please try again.'
  } finally {
    isUpdatingStatus.value = false
  }
}

const generatePDF = async () => {
  if (isGeneratingPDF.value) return

  isGeneratingPDF.value = true
  
  try {
    // Prepare data for the new Puppeteer PDF service
    const pdfData = {
      quotation: {
        id: quotation.value.id,
        quotation_number: `QUO-${quotation.value.id}`,
        quotation_date: quotation.value.quotation_date || quotation.value.created_at,
        valid_until: quotation.value.valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: quotation.value.status,
        payment_terms: quotation.value.payment_terms || 'Net 30 Days',
        currency: quotation.value.currency || 'MYR',
        conversion_rate: quotation.value.conversion_rate || 1,
        subtotal: parseFloat(quotation.value.total_amount) || 0,
        tax: (parseFloat(quotation.value.total_amount) || 0) * 0.08,
        total_amount: parseFloat(quotation.value.total_amount) || 0,
        notes: quotation.value.notes || [
          '• Payment is due within 30 days of invoice date',
          '• 50% deposit required to commence work',
          '• Project timeline is 6-8 weeks from deposit receipt',
          '• All prices are in specified currency and include mentioned services only'
        ]
      },
      customer: {
        company_name: quotation.value.customer?.name || 'Unknown Customer',
        contact_person: quotation.value.customer?.contact_person || '',
        email: quotation.value.customer?.email || '',
        phone: quotation.value.customer?.phone || '',
        address: quotation.value.customer?.address || '',
        city: '',
        state: '',
        postal_code: ''
      },
      items: quotation.value.items?.map(item => ({
        id: item.id,
        description: item.description,
        quantity: parseFloat(item.quantity) || 0,
        unit_price: parseFloat(item.unit_price) || 0,
        line_total: parseFloat(item.line_total) || (parseFloat(item.quantity) * parseFloat(item.unit_price))
      })) || [],
      company: {
        name: 'WIF Japan Sdn Bhd',
        address: 'No 6, Lorong Kiri 10',
        city: 'Kampung Datuk Keramat',
        state: 'Kuala Lumpur',
        postal_code: '54000',
        country: 'Malaysia',
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
    link.download = `quotation-${quotation.value.id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('PDF generated successfully')
  } catch (err) {
    console.error('Failed to generate PDF:', err)
    error.value = err.message || 'Failed to generate PDF. Please try again.'
  } finally {
    isGeneratingPDF.value = false
  }
}

const emailQuotation = async () => {
  if (isEmailingQuotation.value) return

  isEmailingQuotation.value = true
  // TODO: Implement email functionality
  // This would typically call an API endpoint that sends the quotation via email
  try {
    // Placeholder for email functionality
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Email quotation would be implemented here')
  } catch (err) {
    console.error('Failed to email quotation:', err)
  } finally {
    isEmailingQuotation.value = false
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const deleteQuotation = async () => {
  if (isDeletingQuotation.value) return

  isDeletingQuotation.value = true

  try {
    await quotationAPI.deleteQuotation(quotation.value.id)
    showDeleteModal.value = false
    router.push('/quotations')
  } catch (err) {
    console.error('Failed to delete quotation:', err)
    error.value = err.message || 'Failed to delete quotation. Please try again.'
  } finally {
    isDeletingQuotation.value = false
  }
}

const navigateBack = () => {
  router.back()
}

const navigateToEdit = () => {
  router.push(`/quotations/${quotation.value.id}/edit`)
}

// Custom directive for clicking outside
const vClickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value()
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  beforeUnmount(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}

// Load quotation on component mount
onMounted(() => {
  loadQuotation()
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

.hover\:bg-red-50:hover {
  background-color: rgb(254 242 242);
}

/* Focus states for accessibility */
button:focus,
select:focus,
input:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Modal backdrop */
.fixed.inset-0 {
  backdrop-filter: blur(4px);
}

/* Table styling for better readability */
table th {
  font-weight: 500;
  letter-spacing: 0.05em;
}

table td {
  white-space: nowrap;
}

/* Responsive table on mobile */
@media (max-width: 640px) {
  .overflow-x-auto {
    -webkit-overflow-scrolling: touch;
  }
}
</style>