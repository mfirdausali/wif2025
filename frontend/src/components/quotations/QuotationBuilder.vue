<template>
  <div class="max-w-4xl mx-auto bg-white shadow-sm rounded-lg border border-gray-200">
    <form @submit.prevent="handleSubmit" class="p-6 space-y-8">
      <!-- Header Section -->
      <div class="border-b border-gray-200 pb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-2">
          {{ isEditing ? 'Edit Quotation' : 'Create New Quotation' }}
        </h2>
        <p class="text-sm text-gray-600">
          {{ isEditing ? 'Update quotation details and line items below.' : 'Fill in the details to create a new quotation for your customer.' }}
        </p>
      </div>

      <!-- Customer Selection & Date -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Customer Selection -->
        <div>
          <label for="customer" class="block text-sm font-medium text-gray-700 mb-2">
            Customer
            <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <select
              id="customer"
              v-model="form.customer_id"
              data-testid="customer-select"
              :class="[
                'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                errors.customer_id 
                  ? 'border-red-300 bg-red-50 text-red-900' 
                  : 'border-gray-300 text-gray-900'
              ]"
              :disabled="isSubmitting || isLoadingCustomers"
              required
            >
              <option value="">
                {{ isLoadingCustomers ? 'Loading customers...' : 'Select a customer' }}
              </option>
              <option 
                v-for="customer in customers" 
                :key="customer.id" 
                :value="customer.id"
              >
                {{ customer.name }} - {{ customer.contact_person }}
              </option>
            </select>
            
            <!-- Loading indicator -->
            <div 
              v-if="isLoadingCustomers" 
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <svg class="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <div v-if="errors.customer_id" class="mt-1 text-sm text-red-600">
            {{ errors.customer_id[0] }}
          </div>
        </div>

        <!-- Quotation Date -->
        <div>
          <label for="quotation_date" class="block text-sm font-medium text-gray-700 mb-2">
            Quotation Date
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            id="quotation_date"
            v-model="form.quotation_date"
            type="date"
            data-testid="quotation-date"
            :min="today"
            :class="[
              'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              errors.quotation_date 
                ? 'border-red-300 bg-red-50 text-red-900' 
                : 'border-gray-300 text-gray-900'
            ]"
            :disabled="isSubmitting"
            required
          />
          <div v-if="errors.quotation_date" class="mt-1 text-sm text-red-600">
            {{ errors.quotation_date[0] }}
          </div>
        </div>

        <!-- Currency Selection -->
        <div>
          <label for="currency" class="block text-sm font-medium text-gray-700 mb-2">
            Currency
            <span class="text-red-500 ml-1">*</span>
          </label>
          <select
            id="currency"
            v-model="form.currency"
            data-testid="currency-select"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            :disabled="isSubmitting"
            required
          >
            <option value="MYR">MYR (Malaysian Ringgit)</option>
            <option value="JPY">JPY (Japanese Yen)</option>
          </select>
        </div>

        <!-- Conversion Rate (only for JPY) -->
        <div v-if="form.currency === 'JPY'">
          <label for="conversion_rate" class="block text-sm font-medium text-gray-700 mb-2">
            Exchange Rate (1 MYR = ? JPY)
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            id="conversion_rate"
            v-model.number="form.conversion_rate"
            type="number"
            step="0.01"
            min="0.01"
            data-testid="conversion-rate"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            :disabled="isSubmitting"
            placeholder="e.g. 34.50"
            required
          />
          <p class="mt-1 text-xs text-gray-500">Enter current exchange rate from MYR to JPY</p>
        </div>

        <!-- Payment Terms -->
        <div>
          <label for="payment_terms" class="block text-sm font-medium text-gray-700 mb-2">
            Payment Terms
          </label>
          <select
            id="payment_terms"
            v-model="form.payment_terms"
            data-testid="payment-terms-select"
            class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            :disabled="isSubmitting"
          >
            <option value="Net 30 Days">Net 30 Days</option>
            <option value="Net 15 Days">Net 15 Days</option>
            <option value="Net 7 Days">Net 7 Days</option>
            <option value="Due on Receipt">Due on Receipt</option>
            <option value="50% Deposit, Balance on Completion">50% Deposit, Balance on Completion</option>
          </select>
        </div>
      </div>

      <!-- Line Items Section -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Line Items</h3>
          <button
            type="button"
            @click="addLineItem"
            :disabled="isSubmitting"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            data-testid="add-item-btn"
          >
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Item
          </button>
        </div>

        <!-- Items Error -->
        <div v-if="errors.items" class="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <p class="text-sm text-red-600">{{ errors.items[0] }}</p>
        </div>

        <!-- Line Items List -->
        <div class="space-y-4" data-testid="line-items">
          <div
            v-for="(item, index) in form.items"
            :key="item.id"
            class="p-4 border border-gray-200 rounded-lg bg-gray-50"
            data-testid="line-item"
          >
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              <!-- Description -->
              <div class="md:col-span-5">
                <label :for="`description-${index}`" class="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  :id="`description-${index}`"
                  v-model="item.description"
                  type="text"
                  placeholder="Enter service description"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                    errors[`items.${index}.description`] 
                      ? 'border-red-300 bg-red-50 text-red-900' 
                      : 'border-gray-300 text-gray-900'
                  ]"
                  :disabled="isSubmitting"
                  @input="calculateTotal"
                />
                <div v-if="errors[`items.${index}.description`]" class="mt-1 text-sm text-red-600">
                  {{ errors[`items.${index}.description`][0] }}
                </div>
              </div>

              <!-- Quantity -->
              <div class="md:col-span-2">
                <label :for="`quantity-${index}`" class="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  :id="`quantity-${index}`"
                  v-model.number="item.quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1.00"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                    errors[`items.${index}.quantity`] 
                      ? 'border-red-300 bg-red-50 text-red-900' 
                      : 'border-gray-300 text-gray-900'
                  ]"
                  :disabled="isSubmitting"
                  @input="calculateTotal"
                />
                <div v-if="errors[`items.${index}.quantity`]" class="mt-1 text-sm text-red-600">
                  {{ errors[`items.${index}.quantity`][0] }}
                </div>
              </div>

              <!-- Unit Price -->
              <div class="md:col-span-2">
                <label :for="`unit_price-${index}`" class="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price
                </label>
                <input
                  :id="`unit_price-${index}`"
                  v-model.number="item.unit_price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="100.00"
                  :class="[
                    'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                    errors[`items.${index}.unit_price`] 
                      ? 'border-red-300 bg-red-50 text-red-900' 
                      : 'border-gray-300 text-gray-900'
                  ]"
                  :disabled="isSubmitting"
                  @input="calculateTotal"
                />
                <div v-if="errors[`items.${index}.unit_price`]" class="mt-1 text-sm text-red-600">
                  {{ errors[`items.${index}.unit_price`][0] }}
                </div>
              </div>

              <!-- Line Total -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Line Total
                </label>
                <div class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-900 font-medium">
                  {{ currencySymbol }}{{ formatCurrency(getLineTotal(item)) }}
                </div>
              </div>

              <!-- Remove Button -->
              <div class="md:col-span-1 flex items-end">
                <button
                  type="button"
                  @click="removeLineItem(index)"
                  :disabled="isSubmitting || form.items.length === 1"
                  class="p-2 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :title="form.items.length === 1 ? 'At least one item is required' : 'Remove this item'"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Amount Display -->
        <div class="mt-6 flex justify-end">
          <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div class="flex items-center space-x-4">
              <span class="text-sm font-medium text-indigo-900">Total Amount:</span>
              <span class="text-xl font-bold text-indigo-900">{{ currencySymbol }}{{ formatCurrency(totalAmount) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- General Error Message -->
      <div v-if="generalError" class="rounded-md bg-red-50 p-4 border border-red-200">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              {{ generalError }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          :disabled="isSubmitting"
        >
          Cancel
        </button>
        
        <!-- Save & Export PDF Button (only for new quotations) -->
        <button
          v-if="!isEditing"
          type="button"
          @click="handleSaveAndExportPDF"
          :disabled="isSubmitting || !isFormValid"
          :class="[
            'px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-all',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500',
            (isSubmitting || !isFormValid)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          ]"
        >
          <span v-if="isSubmitting" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating & Exporting...
          </span>
          <span v-else class="flex items-center">
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Save & Export PDF
          </span>
        </button>
        
        <button
          type="submit"
          :disabled="isSubmitting || !isFormValid"
          :class="[
            'px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm transition-all',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            (isSubmitting || !isFormValid)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          ]"
        >
          <span v-if="isSubmitting" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isEditing ? 'Updating...' : 'Creating...' }}
          </span>
          <span v-else>
            {{ isEditing ? 'Update Quotation' : 'Create Quotation' }}
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { customerAPI, quotationAPI } from '@/services/apiClient'

// Component props
const props = defineProps({
  quotation: {
    type: Object,
    default: null
  }
})

// Component events
const emit = defineEmits(['quotation-saved', 'cancel'])

// Reactive state
const isSubmitting = ref(false)
const isLoadingCustomers = ref(false)
const errors = ref({})
const generalError = ref('')
const customers = ref([])

// Generate unique ID for line items
let nextItemId = 1

// Form data
const form = ref({
  customer_id: '',
  quotation_date: '',
  currency: 'MYR',
  conversion_rate: 1,
  payment_terms: 'Net 30 Days',
  notes: [],
  items: [
    {
      id: nextItemId++,
      description: '',
      quantity: 1,
      unit_price: 0
    }
  ]
})

// Get today's date in YYYY-MM-DD format
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Set default quotation date to today
onMounted(() => {
  form.value.quotation_date = today.value
})

// Computed properties
const isEditing = computed(() => !!props.quotation?.id)

const isFormValid = computed(() => {
  return form.value.customer_id &&
         form.value.quotation_date &&
         form.value.items.length > 0 &&
         form.value.items.every(item => 
           item.description.trim() &&
           item.quantity > 0 &&
           item.unit_price > 0
         )
})

const totalAmount = computed(() => {
  return form.value.items.reduce((total, item) => {
    return total + getLineTotal(item)
  }, 0)
})

// Currency computed properties
const currencySymbol = computed(() => {
  return form.value.currency === 'JPY' ? '¥' : 'RM'
})

// Methods
const getLineTotal = (item) => {
  const quantity = parseFloat(item.quantity) || 0
  const unitPrice = parseFloat(item.unit_price) || 0
  return quantity * unitPrice
}

const formatCurrency = (amount) => {
  const fractionDigits = form.value.currency === 'JPY' ? 0 : 2
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  }).format(amount)
}

const calculateTotal = () => {
  // Trigger reactivity for totalAmount
  // The computed property will handle the calculation
}

const addLineItem = () => {
  form.value.items.push({
    id: nextItemId++,
    description: '',
    quantity: 1,
    unit_price: 0
  })
}

const removeLineItem = (index) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1)
  }
}

const loadCustomers = async () => {
  isLoadingCustomers.value = true
  try {
    const response = await customerAPI.getCustomers()
    customers.value = response.data || []
  } catch (error) {
    console.error('Failed to load customers:', error)
    generalError.value = 'Failed to load customers. Please refresh the page.'
  } finally {
    isLoadingCustomers.value = false
  }
}

const clearErrors = () => {
  errors.value = {}
  generalError.value = ''
}

const handleValidationErrors = (errorResponse) => {
  if (errorResponse.response?.status === 422) {
    errors.value = errorResponse.response.data.errors || {}
  } else {
    generalError.value = errorResponse.message || 'An unexpected error occurred'
  }
}

const handleSubmit = async () => {
  if (isSubmitting.value) return

  clearErrors()
  isSubmitting.value = true

  try {
    const quotationData = {
      customer_id: form.value.customer_id,
      quotation_date: form.value.quotation_date,
      currency: form.value.currency,
      conversion_rate: form.value.conversion_rate,
      payment_terms: form.value.payment_terms,
      notes: form.value.notes,
      items: form.value.items.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price)
      }))
    }

    let savedQuotation

    if (isEditing.value) {
      savedQuotation = await quotationAPI.updateQuotation(props.quotation.id, quotationData)
    } else {
      savedQuotation = await quotationAPI.createQuotation(quotationData)
    }

    emit('quotation-saved', savedQuotation)

    // Reset form if creating new quotation
    if (!isEditing.value) {
      form.value = {
        customer_id: '',
        quotation_date: today.value,
        currency: 'MYR',
        conversion_rate: 1,
        payment_terms: 'Net 30 Days',
        notes: [],
        items: [
          {
            id: nextItemId++,
            description: '',
            quantity: 1,
            unit_price: 0
          }
        ]
      }
    }

  } catch (error) {
    console.error('Quotation save error:', error)
    handleValidationErrors(error)
  } finally {
    isSubmitting.value = false
  }
}

const handleSaveAndExportPDF = async () => {
  if (isSubmitting.value) return

  clearErrors()
  isSubmitting.value = true

  try {
    const quotationData = {
      customer_id: form.value.customer_id,
      quotation_date: form.value.quotation_date,
      currency: form.value.currency,
      conversion_rate: form.value.conversion_rate,
      payment_terms: form.value.payment_terms,
      notes: form.value.notes,
      items: form.value.items.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price)
      }))
    }

    // Create the quotation first
    const savedQuotation = await quotationAPI.createQuotation(quotationData)
    
    // Fetch full quotation details with customer and items for PDF
    const fullQuotation = await quotationAPI.getQuotation(savedQuotation.id)
    
    // Generate and download PDF using new API
    await generatePDF(fullQuotation.data || fullQuotation)
    
    // Emit the saved quotation event
    emit('quotation-saved', savedQuotation)

    // Reset form
    form.value = {
      customer_id: '',
      quotation_date: today.value,
      currency: 'MYR',
      conversion_rate: 1,
      payment_terms: 'Net 30 Days',
      notes: [],
      items: [
        {
          id: nextItemId++,
          description: '',
          quantity: 1,
          unit_price: 0
        }
      ]
    }

  } catch (error) {
    console.error('Quotation save and export error:', error)
    handleValidationErrors(error)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize form with quotation data if editing
watch(() => props.quotation, (quotation) => {
  if (quotation) {
    form.value = {
      customer_id: quotation.customer_id,
      quotation_date: quotation.quotation_date,
      currency: quotation.currency || 'MYR',
      conversion_rate: quotation.conversion_rate || 1,
      payment_terms: quotation.payment_terms || 'Net 30 Days',
      notes: quotation.notes || [],
      items: quotation.items.map(item => ({
        id: nextItemId++,
        description: item.description,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price)
      }))
    }
  }
}, { immediate: true })

// Load customers on mount
onMounted(() => {
  loadCustomers()
})

// Public methods for parent components
const resetForm = () => {
  form.value = {
    customer_id: '',
    quotation_date: today.value,
    currency: 'MYR',
    conversion_rate: 1,
    payment_terms: 'Net 30 Days',
    notes: [],
    items: [
      {
        id: nextItemId++,
        description: '',
        quantity: 1,
        unit_price: 0
      }
    ]
  }
  clearErrors()
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
        address2: quotation.customer?.address2 || '',
        city: quotation.customer?.city || '',
        state: quotation.customer?.state || '',
        postal_code: quotation.customer?.postal_code || ''
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
    // You might want to show a toast notification here
  }
}

defineExpose({
  resetForm
})
</script>

<style scoped>
/* Component-specific styles following minimalist design principles */
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Focus states for accessibility */
input:focus,
select:focus,
button:focus {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Loading animation optimization */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Custom number input styling */
input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>