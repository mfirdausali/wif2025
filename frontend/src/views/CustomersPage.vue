<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header - Clean, Professional Layout -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-6">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Customers</h1>
            <p class="mt-1 text-sm text-gray-600">
              Manage your customer relationships and contact information
            </p>
          </div>
          <button
            @click="openAddCustomerModal"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Customer
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State - Clear and Informative -->
      <div 
        v-if="isLoading" 
        class="flex items-center justify-center py-12"
        data-testid="loading-state"
      >
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p class="text-gray-600">Loading customers...</p>
        </div>
      </div>

      <!-- Error State - User-Friendly Error Display -->
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
              Unable to load customers
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
            <div class="mt-4">
              <button
                @click="loadCustomers()"
                class="text-sm font-medium text-red-800 hover:text-red-600 focus:outline-none focus:underline transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State - Encouraging and Clear -->
      <div 
        v-else-if="customers.length === 0" 
        class="text-center py-12"
        data-testid="empty-state"
      >
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 class="mt-4 text-lg font-medium text-gray-900">No customers yet</h3>
        <p class="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
          Start building your customer database by adding your first customer contact.
        </p>
        <div class="mt-6">
          <button
            @click="openAddCustomerModal"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Customer
          </button>
        </div>
      </div>

      <!-- Customer List - Clean, Scannable Design -->
      <div v-else data-testid="customer-list">
        <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <!-- Table Header -->
          <div class="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div class="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div class="col-span-3">Company</div>
              <div class="col-span-2">Contact Person</div>
              <div class="col-span-3">Email</div>
              <div class="col-span-2">Phone</div>
              <div class="col-span-2">Actions</div>
            </div>
          </div>

          <!-- Customer Rows -->
          <div class="divide-y divide-gray-200">
            <div
              v-for="customer in customers"
              :key="customer.id"
              class="px-6 py-4 hover:bg-gray-50 transition-colors"
              data-testid="customer-row"
            >
              <div class="grid grid-cols-12 gap-4 items-center">
                <!-- Company Name -->
                <div class="col-span-3">
                  <div class="text-sm font-medium text-gray-900">
                    {{ customer.name }}
                  </div>
                  <div class="text-sm text-gray-500 mt-1 truncate">
                    {{ customer.address }}
                  </div>
                </div>

                <!-- Contact Person -->
                <div class="col-span-2">
                  <div class="text-sm text-gray-900">
                    {{ customer.contact_person }}
                  </div>
                </div>

                <!-- Email -->
                <div class="col-span-3">
                  <a
                    :href="`mailto:${customer.email}`"
                    class="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {{ customer.email }}
                  </a>
                </div>

                <!-- Phone -->
                <div class="col-span-2">
                  <a
                    :href="`tel:${customer.phone}`"
                    class="text-sm text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {{ customer.phone }}
                  </a>
                </div>

                <!-- Actions -->
                <div class="col-span-2">
                  <div class="flex space-x-2">
                    <button
                      @click="editCustomer(customer)"
                      class="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors focus:outline-none focus:underline"
                    >
                      Edit
                    </button>
                    <button
                      @click="confirmDeleteCustomer(customer)"
                      class="text-red-600 hover:text-red-800 text-sm font-medium transition-colors focus:outline-none focus:underline"
                    >
                      Delete
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
            Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} customers
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

    <!-- Customer Form Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      data-testid="customer-modal"
    >
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="closeModal"
        ></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <CustomerForm
            :customer="selectedCustomer"
            @customer-saved="handleCustomerSaved"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 overflow-y-auto"
      data-testid="delete-modal"
    >
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:p-6">
          <div>
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Delete Customer
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  Are you sure you want to delete <strong>{{ customerToDelete?.name }}</strong>?
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              @click="deleteCustomer"
              :disabled="isDeletingCustomer"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm transition-colors disabled:opacity-50"
            >
              <span v-if="isDeletingCustomer" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </span>
              <span v-else>Delete</span>
            </button>
            <button
              @click="closeDeleteModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { customerAPI } from '@/services/apiClient'
import CustomerForm from '@/components/CustomerForm.vue'

// Reactive state management
const customers = ref([])
const pagination = ref(null)
const isLoading = ref(false)
const error = ref('')

// Modal state
const showModal = ref(false)
const selectedCustomer = ref(null)

// Delete confirmation state
const showDeleteModal = ref(false)
const customerToDelete = ref(null)
const isDeletingCustomer = ref(false)

// Computed properties for clean logic
const visiblePages = computed(() => {
  if (!pagination.value) return []
  
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  const pages = []
  
  // Show up to 5 pages around the current page
  const start = Math.max(1, current - 2)
  const end = Math.min(last, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

/**
 * Load customers from the API
 * Implements comprehensive error handling and loading states
 */
const loadCustomers = async (page = 1) => {
  isLoading.value = true
  error.value = ''
  
  try {
    const response = await customerAPI.getCustomers({ page })
    customers.value = response.data || []
    pagination.value = {
      current_page: response.current_page,
      last_page: response.last_page,
      from: response.from,
      to: response.to,
      total: response.total
    }
  } catch (err) {
    console.error('Failed to load customers:', err)
    error.value = err.message || 'Failed to load customers. Please try again.'
  } finally {
    isLoading.value = false
  }
}

/**
 * Load a specific page of customers
 */
const loadPage = (page) => {
  if (page !== pagination.value?.current_page) {
    loadCustomers(page)
  }
}

/**
 * Open the add customer modal
 */
const openAddCustomerModal = () => {
  selectedCustomer.value = null
  showModal.value = true
}

/**
 * Open the edit customer modal
 */
const editCustomer = (customer) => {
  selectedCustomer.value = { ...customer }
  showModal.value = true
}

/**
 * Close the customer form modal
 */
const closeModal = () => {
  showModal.value = false
  selectedCustomer.value = null
}

/**
 * Handle successful customer save
 * Updates the local list and provides immediate feedback
 */
const handleCustomerSaved = (savedCustomer) => {
  if (selectedCustomer.value?.id) {
    // Update existing customer in the list
    const index = customers.value.findIndex(c => c.id === selectedCustomer.value.id)
    if (index !== -1) {
      customers.value[index] = savedCustomer
    }
  } else {
    // Add new customer to the top of the list
    customers.value.unshift(savedCustomer)
  }
  
  closeModal()
}

/**
 * Show delete confirmation modal
 */
const confirmDeleteCustomer = (customer) => {
  customerToDelete.value = customer
  showDeleteModal.value = true
}

/**
 * Close delete confirmation modal
 */
const closeDeleteModal = () => {
  showDeleteModal.value = false
  customerToDelete.value = null
}

/**
 * Delete customer after confirmation
 */
const deleteCustomer = async () => {
  if (!customerToDelete.value) return
  
  isDeletingCustomer.value = true
  
  try {
    await customerAPI.deleteCustomer(customerToDelete.value.id)
    
    // Remove customer from local list
    customers.value = customers.value.filter(c => c.id !== customerToDelete.value.id)
    
    closeDeleteModal()
  } catch (err) {
    console.error('Failed to delete customer:', err)
    // Could show a toast notification here
    alert('Failed to delete customer. Please try again.')
  } finally {
    isDeletingCustomer.value = false
  }
}

// Load customers when component mounts
onMounted(() => {
  loadCustomers()
})
</script>

<style scoped>
/* Component-specific animations and transitions */
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
a:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

/* Modal animations */
.fixed.inset-0 {
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>