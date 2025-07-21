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
        <p class="text-gray-600">Loading quotation...</p>
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
    <div v-else-if="quotation">
      <!-- Page Header -->
      <header class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center py-6">
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
                  Edit Quotation #{{ quotation.id }}
                </h1>
                <p class="mt-1 text-sm text-gray-600">
                  Update quotation details and line items
                </p>
              </div>
            </div>
            
            <!-- Status Badge -->
            <span :class="getStatusBadgeClass(quotation.status)">
              {{ quotation.status }}
            </span>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Edit Restriction Notice -->
        <div 
          v-if="!canEdit" 
          class="mb-6 rounded-md bg-yellow-50 p-4 border border-yellow-200"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">
                Editing Restricted
              </h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>This quotation cannot be edited because it has been {{ quotation.status.toLowerCase() }}. Only draft quotations can be modified.</p>
              </div>
              <div class="mt-4">
                <button
                  @click="navigateToView"
                  class="text-sm font-medium text-yellow-800 hover:text-yellow-600 focus:outline-none focus:underline transition-colors"
                >
                  View quotation details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quotation Builder Component -->
        <QuotationBuilder
          v-if="canEdit"
          :quotation="quotation"
          @quotation-saved="handleQuotationSaved"
          @cancel="handleCancel"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import QuotationBuilder from '@/components/quotations/QuotationBuilder.vue'
import { quotationAPI } from '@/services/apiClient'

const router = useRouter()
const route = useRoute()

// Reactive state
const quotation = ref(null)
const isLoading = ref(false)
const error = ref('')

// Computed properties
const canEdit = computed(() => {
  return quotation.value && (
    quotation.value.status === 'Draft' || 
    quotation.value.status === 'Expired'
  )
})

// Methods
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

const handleQuotationSaved = (updatedQuotation) => {
  // Navigate to the quotation detail page
  router.push(`/quotations/${updatedQuotation.id}`)
}

const handleCancel = () => {
  navigateBack()
}

const navigateBack = () => {
  if (quotation.value) {
    router.push(`/quotations/${quotation.value.id}`)
  } else {
    router.push('/quotations')
  }
}

const navigateToView = () => {
  router.push(`/quotations/${quotation.value.id}`)
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
</style>