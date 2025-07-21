<template>
  <div class="min-h-screen bg-gray-50">
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
              <h1 class="text-2xl font-semibold text-gray-900">Create New Quotation</h1>
              <p class="mt-1 text-sm text-gray-600">
                Fill in the details to create a new quotation for your customer
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <QuotationBuilder
        @quotation-saved="handleQuotationSaved"
        @cancel="handleCancel"
      />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import QuotationBuilder from '@/components/quotations/QuotationBuilder.vue'

const router = useRouter()

const handleQuotationSaved = (quotation) => {
  // Navigate to the newly created quotation detail page
  router.push(`/quotations/${quotation.id}`)
}

const handleCancel = () => {
  navigateBack()
}

const navigateBack = () => {
  router.push('/quotations')
}
</script>

<style scoped>
.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>