<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Form Header - Clean, Clear Purpose -->
    <div class="border-b border-gray-200 pb-4">
      <h3 class="text-lg font-medium text-gray-900">
        {{ isEditing ? 'Edit Customer' : 'Add New Customer' }}
      </h3>
      <p class="mt-1 text-sm text-gray-600">
        {{ isEditing ? 'Update customer information below.' : 'Enter customer details to create a new record.' }}
      </p>
    </div>

    <!-- Customer Name Field -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        Company Name
        <span class="text-red-500 ml-1">*</span>
      </label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        :class="[
          'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          errors.name 
            ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
            : 'border-gray-300 text-gray-900 placeholder-gray-400'
        ]"
        placeholder="Enter company name"
        :disabled="isSubmitting"
        required
      />
      <div v-if="errors.name" class="mt-1 text-sm text-red-600">
        {{ errors.name[0] }}
      </div>
    </div>

    <!-- Contact Person Field -->
    <div>
      <label for="contact_person" class="block text-sm font-medium text-gray-700 mb-1">
        Contact Person
        <span class="text-red-500 ml-1">*</span>
      </label>
      <input
        id="contact_person"
        v-model="form.contact_person"
        type="text"
        :class="[
          'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          errors.contact_person 
            ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
            : 'border-gray-300 text-gray-900 placeholder-gray-400'
        ]"
        placeholder="Enter contact person name"
        :disabled="isSubmitting"
        required
      />
      <div v-if="errors.contact_person" class="mt-1 text-sm text-red-600">
        {{ errors.contact_person[0] }}
      </div>
    </div>

    <!-- Email Field -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
        Email Address
        <span class="text-red-500 ml-1">*</span>
      </label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        :class="[
          'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          errors.email 
            ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
            : 'border-gray-300 text-gray-900 placeholder-gray-400'
        ]"
        placeholder="Enter email address"
        :disabled="isSubmitting"
        required
      />
      <div v-if="errors.email" class="mt-1 text-sm text-red-600">
        {{ errors.email[0] }}
      </div>
    </div>

    <!-- Phone Field -->
    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
        Phone Number
        <span class="text-red-500 ml-1">*</span>
      </label>
      <input
        id="phone"
        v-model="form.phone"
        type="tel"
        :class="[
          'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
          errors.phone 
            ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
            : 'border-gray-300 text-gray-900 placeholder-gray-400'
        ]"
        placeholder="Enter phone number"
        :disabled="isSubmitting"
        required
      />
      <div v-if="errors.phone" class="mt-1 text-sm text-red-600">
        {{ errors.phone[0] }}
      </div>
    </div>

    <!-- Address Fields Section -->
    <div class="space-y-4">
      <h4 class="text-md font-medium text-gray-900 border-b border-gray-200 pb-2">Address Information</h4>
      
      <!-- Primary Address Field -->
      <div>
        <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
          Street Address
          <span class="text-red-500 ml-1">*</span>
        </label>
        <input
          id="address"
          v-model="form.address"
          type="text"
          :class="[
            'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            errors.address 
              ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
              : 'border-gray-300 text-gray-900 placeholder-gray-400'
          ]"
          placeholder="Enter street address"
          :disabled="isSubmitting"
          required
        />
        <div v-if="errors.address" class="mt-1 text-sm text-red-600">
          {{ errors.address[0] }}
        </div>
      </div>

      <!-- Secondary Address Field -->
      <div>
        <label for="address2" class="block text-sm font-medium text-gray-700 mb-1">
          Address Line 2
          <span class="text-gray-400 text-xs">(Optional)</span>
        </label>
        <input
          id="address2"
          v-model="form.address2"
          type="text"
          :class="[
            'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            errors.address2 
              ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
              : 'border-gray-300 text-gray-900 placeholder-gray-400'
          ]"
          placeholder="Apartment, suite, unit, building, floor, etc."
          :disabled="isSubmitting"
        />
        <div v-if="errors.address2" class="mt-1 text-sm text-red-600">
          {{ errors.address2[0] }}
        </div>
      </div>

      <!-- City, State, Postal Code Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- City Field -->
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700 mb-1">
            City
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            id="city"
            v-model="form.city"
            type="text"
            :class="[
              'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              errors.city 
                ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
                : 'border-gray-300 text-gray-900 placeholder-gray-400'
            ]"
            placeholder="Enter city"
            :disabled="isSubmitting"
            required
          />
          <div v-if="errors.city" class="mt-1 text-sm text-red-600">
            {{ errors.city[0] }}
          </div>
        </div>

        <!-- State Field -->
        <div>
          <label for="state" class="block text-sm font-medium text-gray-700 mb-1">
            State/Province
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            id="state"
            v-model="form.state"
            type="text"
            :class="[
              'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              errors.state 
                ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
                : 'border-gray-300 text-gray-900 placeholder-gray-400'
            ]"
            placeholder="Enter state/province"
            :disabled="isSubmitting"
            required
          />
          <div v-if="errors.state" class="mt-1 text-sm text-red-600">
            {{ errors.state[0] }}
          </div>
        </div>

        <!-- Postal Code Field -->
        <div>
          <label for="postal_code" class="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            id="postal_code"
            v-model="form.postal_code"
            type="text"
            :class="[
              'block w-full px-3 py-2 border rounded-md shadow-sm text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
              errors.postal_code 
                ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' 
                : 'border-gray-300 text-gray-900 placeholder-gray-400'
            ]"
            placeholder="Enter postal code"
            :disabled="isSubmitting"
            required
          />
          <div v-if="errors.postal_code" class="mt-1 text-sm text-red-600">
            {{ errors.postal_code[0] }}
          </div>
        </div>
      </div>
    </div>

    <!-- General Error Message -->
    <div v-if="generalError" class="rounded-md bg-red-50 p-4">
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

    <!-- Form Actions - Clean button layout -->
    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        :disabled="isSubmitting"
      >
        Cancel
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
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        </span>
        <span v-else>
          {{ isEditing ? 'Update Customer' : 'Save Customer' }}
        </span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { customerAPI } from '@/services/apiClient'

// Component props
const props = defineProps({
  customer: {
    type: Object,
    default: null
  }
})

// Component events
const emit = defineEmits(['customer-saved', 'cancel'])

// Reactive state
const isSubmitting = ref(false)
const errors = ref({})
const generalError = ref('')

// Form data - reactive object following Vue 3 best practices
const form = ref({
  name: '',
  contact_person: '',
  email: '',
  phone: '',
  address: '',
  address2: '',
  city: '',
  state: '',
  postal_code: ''
})

// Computed properties for clean logic separation
const isEditing = computed(() => !!props.customer?.id)

const isFormValid = computed(() => {
  return form.value.name.trim() &&
         form.value.contact_person.trim() &&
         form.value.email.trim() &&
         form.value.phone.trim() &&
         form.value.address.trim() &&
         form.value.city.trim() &&
         form.value.state.trim() &&
         form.value.postal_code.trim()
})

// Initialize form with customer data if editing
watch(() => props.customer, (customer) => {
  if (customer) {
    form.value = {
      name: customer.name || '',
      contact_person: customer.contact_person || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      address2: customer.address2 || '',
      city: customer.city || '',
      state: customer.state || '',
      postal_code: customer.postal_code || ''
    }
  }
}, { immediate: true })

/**
 * Clear all errors and reset error state
 * Implements clean error management following Japanese quality principles
 */
const clearErrors = () => {
  errors.value = {}
  generalError.value = ''
}

/**
 * Handle validation errors from API response
 * Provides immediate, clear feedback to users
 */
const handleValidationErrors = (errorResponse) => {
  if (errorResponse.response?.status === 422) {
    errors.value = errorResponse.response.data.errors || {}
  } else {
    generalError.value = errorResponse.message || 'An unexpected error occurred'
  }
}

/**
 * Handle form submission
 * Implements robust error handling and user feedback
 */
const handleSubmit = async () => {
  // Prevent double submission and clear previous errors
  if (isSubmitting.value) return
  
  clearErrors()
  isSubmitting.value = true

  try {
    let savedCustomer

    if (isEditing.value) {
      // Update existing customer
      savedCustomer = await customerAPI.updateCustomer(props.customer.id, form.value)
    } else {
      // Create new customer
      savedCustomer = await customerAPI.createCustomer(form.value)
    }

    // Emit success event with the saved customer data
    emit('customer-saved', savedCustomer)

    // Reset form if creating new customer
    if (!isEditing.value) {
      form.value = {
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        address2: '',
        city: '',
        state: '',
        postal_code: ''
      }
    }

  } catch (error) {
    console.error('Customer save error:', error)
    handleValidationErrors(error)
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Public method to reset the form
 * Useful for parent components to clear the form state
 */
const resetForm = () => {
  form.value = {
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    address2: '',
    city: '',
    state: '',
    postal_code: ''
  }
  clearErrors()
}

// Expose public methods for parent components
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
textarea:focus,
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
</style>