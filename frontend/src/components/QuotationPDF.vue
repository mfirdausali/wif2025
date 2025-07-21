<template>
  <div class="quotation-pdf-container">
    <!-- Preview Button -->
    <button 
      @click="togglePreview" 
      class="btn btn-secondary me-2"
      :disabled="isGenerating"
    >
      <i class="bi bi-eye"></i>
      {{ showPreview ? 'Hide Preview' : 'Show Preview' }}
    </button>

    <!-- Generate PDF Button -->
    <button 
      @click="generatePDF" 
      class="btn btn-primary"
      :disabled="isGenerating || !isValidData"
    >
      <span 
        v-if="isGenerating" 
        class="spinner-border spinner-border-sm me-2" 
        role="status"
      ></span>
      <i v-else class="bi bi-file-earmark-pdf me-2"></i>
      {{ isGenerating ? generateText : 'Generate PDF' }}
    </button>

    <!-- Progress Bar for Mobile -->
    <div v-if="isGenerating && isMobile" class="progress mt-3" style="height: 4px;">
      <div 
        class="progress-bar progress-bar-striped progress-bar-animated" 
        :style="{ width: progress + '%' }"
      ></div>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-danger mt-3" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
      <button 
        type="button" 
        class="btn-close" 
        @click="clearError"
      ></button>
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="alert alert-success mt-3" role="alert">
      <i class="bi bi-check-circle me-2"></i>
      {{ successMessage }}
    </div>

    <!-- Preview Section -->
    <div v-if="showPreview" class="preview-section mt-4">
      <h5>PDF Preview</h5>
      <div class="preview-container border rounded p-3 bg-light">
        <QuotationTemplate 
          :quotation-data="quotationData"
          :customer-data="customerData"
          :items="items"
          :company-data="companyData"
          preview-mode
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import QuotationTemplate from './QuotationTemplate.vue'

export default {
  name: 'QuotationPDF',
  components: {
    QuotationTemplate
  },
  props: {
    quotationData: {
      type: Object,
      required: true,
      validator: (value) => {
        return value && typeof value.id !== 'undefined'
      }
    },
    customerData: {
      type: Object,
      required: true
    },
    items: {
      type: Array,
      required: true,
      validator: (value) => {
        return Array.isArray(value) && value.length > 0
      }
    },
    filename: {
      type: String,
      default: () => `quotation-${Date.now()}.pdf`
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
    }
  },
  emits: ['generated', 'error', 'progress'],
  setup(props, { emit }) {
    // Reactive state
    const isGenerating = ref(false)
    const showPreview = ref(false)
    const error = ref('')
    const successMessage = ref('')
    const progress = ref(0)
    const generateText = ref('Generating PDF...')
    const isMobile = ref(false)

    // Computed properties
    const isValidData = computed(() => {
      return props.quotationData?.id && 
             props.customerData?.company_name && 
             props.items?.length > 0
    })

    // Mobile detection
    const detectMobile = () => {
      isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    }

    // Progress simulation for mobile
    const simulateProgress = () => {
      if (!isMobile.value) return
      
      progress.value = 0
      const interval = setInterval(() => {
        progress.value += Math.random() * 15
        if (progress.value >= 90) {
          progress.value = 90
          clearInterval(interval)
        }
      }, 200)
      
      return interval
    }

    // Clear error message
    const clearError = () => {
      error.value = ''
    }

    // Toggle preview
    const togglePreview = () => {
      showPreview.value = !showPreview.value
    }

    // Generate PDF
    const generatePDF = async () => {
      if (!isValidData.value) {
        error.value = 'Invalid quotation data. Please check all required fields.'
        return
      }

      isGenerating.value = true
      error.value = ''
      successMessage.value = ''
      
      const progressInterval = simulateProgress()
      
      try {
        // Prepare data payload
        const payload = {
          quotation: props.quotationData,
          customer: props.customerData,
          items: props.items,
          company: props.companyData,
          filename: props.filename,
          options: {
            format: 'A4',
            margin: '0.75in',
            printBackground: true,
            preferCSSPageSize: true
          }
        }

        // Update progress text for mobile
        if (isMobile.value) {
          generateText.value = 'Preparing document...'
          setTimeout(() => {
            generateText.value = 'Generating PDF...'
          }, 1000)
        }

        // Make API request
        const response = await fetch('/api/generate-quotation-pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Server error: ${response.status}`)
        }

        // Complete progress
        if (progressInterval) clearInterval(progressInterval)
        progress.value = 100

        // Handle blob response
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        // Create download link
        const link = document.createElement('a')
        link.href = url
        link.download = props.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        // Success feedback
        successMessage.value = 'PDF generated successfully!'
        emit('generated', { filename: props.filename, success: true })
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)

      } catch (err) {
        console.error('PDF generation failed:', err)
        error.value = err.message || 'Failed to generate PDF. Please try again.'
        emit('error', err)
      } finally {
        isGenerating.value = false
        generateText.value = 'Generating PDF...'
        progress.value = 0
        if (progressInterval) clearInterval(progressInterval)
      }
    }

    // Lifecycle
    onMounted(() => {
      detectMobile()
      window.addEventListener('resize', detectMobile)
    })

    // Watch for data changes to validate
    watch([() => props.quotationData, () => props.customerData, () => props.items], () => {
      clearError()
    }, { deep: true })

    return {
      // State
      isGenerating,
      showPreview,
      error,
      successMessage,
      progress,
      generateText,
      isMobile,
      
      // Computed
      isValidData,
      
      // Methods
      generatePDF,
      togglePreview,
      clearError
    }
  }
}
</script>

<style scoped>
.quotation-pdf-container {
  margin: 1rem 0;
}

.preview-section {
  background: #f8f9fa;
  border-radius: 0.375rem;
  padding: 1rem;
}

.preview-container {
  max-height: 600px;
  overflow-y: auto;
  background: white !important;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .btn.me-2 {
    margin-right: 0 !important;
  }
  
  .preview-container {
    max-height: 400px;
    font-size: 0.875rem;
  }
}

/* Loading animation */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Progress bar styling */
.progress {
  border-radius: 0.25rem;
  background-color: #e9ecef;
}

.progress-bar {
  transition: width 0.3s ease;
}
</style>