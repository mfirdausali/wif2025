import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import QuotationBuilder from '../QuotationBuilder.vue'
import { customerAPI, quotationAPI } from '@/services/apiClient'

// Mock the API client
vi.mock('@/services/apiClient', () => ({
  customerAPI: {
    getCustomers: vi.fn()
  },
  quotationAPI: {
    createQuotation: vi.fn(),
    updateQuotation: vi.fn()
  }
}))

const mockCustomers = [
  {
    id: 1,
    name: 'Test Company 1',
    contact_person: 'John Doe',
    email: 'john@test.com',
    phone: '123-456-7890'
  },
  {
    id: 2,
    name: 'Test Company 2',
    contact_person: 'Jane Smith',
    email: 'jane@test.com',
    phone: '098-765-4321'
  }
]

const mockQuotation = {
  id: 1,
  customer_id: 1,
  quotation_date: '2024-01-15',
  status: 'Draft',
  total_amount: 1050.00,
  items: [
    {
      id: 1,
      description: 'Consulting Service',
      quantity: 5,
      unit_price: 200.00
    },
    {
      id: 2,
      description: 'Additional Service',
      quantity: 1,
      unit_price: 50.00
    }
  ]
}

describe('QuotationBuilder', () => {
  let wrapper

  const createWrapper = (props = {}) => {
    return mount(QuotationBuilder, {
      props,
      global: {
        mocks: {
          $emit: vi.fn()
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock successful customer API response
    customerAPI.getCustomers.mockResolvedValue({
      data: mockCustomers
    })
  })

  describe('Component Initialization', () => {
    it('should render the component correctly', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.find('h2').text()).toBe('Create New Quotation')
      expect(wrapper.find('[data-testid="customer-select"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="quotation-date"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="line-items"]').exists()).toBe(true)
    })

    it('should load customers on mount', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      expect(customerAPI.getCustomers).toHaveBeenCalled()
    })

    it('should set default quotation date to today', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const today = new Date().toISOString().split('T')[0]
      const dateInput = wrapper.find('#quotation_date')
      expect(dateInput.element.value).toBe(today)
    })

    it('should initialize with one empty line item', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const lineItems = wrapper.findAll('[data-testid="line-item"]')
      expect(lineItems).toHaveLength(1)
    })
  })

  describe('Customer Selection', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await nextTick()
    })

    it('should display customers in dropdown', async () => {
      const customerSelect = wrapper.find('#customer')
      const options = customerSelect.findAll('option')
      
      // Should have default option + 2 customers
      expect(options).toHaveLength(3)
      expect(options[1].text()).toContain('Test Company 1 - John Doe')
      expect(options[2].text()).toContain('Test Company 2 - Jane Smith')
    })

    it('should update form when customer is selected', async () => {
      const customerSelect = wrapper.find('#customer')
      await customerSelect.setValue('1')
      
      expect(wrapper.vm.form.customer_id).toBe('1')
    })

    it('should show loading state while fetching customers', async () => {
      // Create new wrapper before API call resolves
      customerAPI.getCustomers.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      wrapper = createWrapper()
      
      expect(wrapper.find('.animate-spin').exists()).toBe(true)
      expect(wrapper.find('#customer option').text()).toContain('Loading customers...')
    })
  })

  describe('Line Items Management', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await nextTick()
    })

    it('should add new line item when "Add Item" button is clicked', async () => {
      const addButton = wrapper.find('[data-testid="add-item-btn"]')
      await addButton.trigger('click')
      
      const lineItems = wrapper.findAll('[data-testid="line-item"]')
      expect(lineItems).toHaveLength(2)
    })

    it('should remove line item when remove button is clicked', async () => {
      // Add a second item first
      const addButton = wrapper.find('[data-testid="add-item-btn"]')
      await addButton.trigger('click')
      
      let lineItems = wrapper.findAll('[data-testid="line-item"]')
      expect(lineItems).toHaveLength(2)
      
      // Remove the first item
      const removeButton = wrapper.find('[data-testid="remove-item-btn"]')
      await removeButton.trigger('click')
      
      lineItems = wrapper.findAll('[data-testid="line-item"]')
      expect(lineItems).toHaveLength(1)
    })

    it('should not allow removing the last line item', async () => {
      const removeButton = wrapper.find('[data-testid="remove-item-btn"]')
      expect(removeButton.element.disabled).toBe(true)
    })

    it('should calculate line total correctly', async () => {
      const quantityInput = wrapper.find('[data-testid="quantity-0"]')
      const priceInput = wrapper.find('[data-testid="unit-price-0"]')
      
      await quantityInput.setValue('5')
      await priceInput.setValue('100')
      
      const lineTotal = wrapper.find('[data-testid="line-total-0"]')
      expect(lineTotal.text()).toContain('500.00')
    })

    it('should update total amount when line items change', async () => {
      const quantityInput = wrapper.find('[data-testid="quantity-0"]')
      const priceInput = wrapper.find('[data-testid="unit-price-0"]')
      
      await quantityInput.setValue('2')
      await priceInput.setValue('250')
      
      expect(wrapper.vm.totalAmount).toBe(500)
      const totalDisplay = wrapper.find('[data-testid="total-amount"]')
      expect(totalDisplay.text()).toContain('500.00')
    })
  })

  describe('Form Validation', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await nextTick()
    })

    it('should disable submit button when form is invalid', async () => {
      const submitButton = wrapper.find('[data-testid="submit-btn"]')
      expect(submitButton.element.disabled).toBe(true)
    })

    it('should enable submit button when form is valid', async () => {
      // Fill in required fields
      await wrapper.find('#customer').setValue('1')
      await wrapper.find('[data-testid="description-0"]').setValue('Test Service')
      await wrapper.find('[data-testid="quantity-0"]').setValue('1')
      await wrapper.find('[data-testid="unit-price-0"]').setValue('100')
      
      await nextTick()
      
      const submitButton = wrapper.find('[data-testid="submit-btn"]')
      expect(submitButton.element.disabled).toBe(false)
    })

    it('should show validation errors', async () => {
      wrapper.vm.errors = {
        customer_id: ['Customer is required'],
        'items.0.description': ['Description is required']
      }
      
      await nextTick()
      
      const customerError = wrapper.find('[data-testid="customer-error"]')
      const descriptionError = wrapper.find('[data-testid="description-0-error"]')
      
      expect(customerError.text()).toBe('Customer is required')
      expect(descriptionError.text()).toBe('Description is required')
    })
  })

  describe('Form Submission', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await nextTick()
      
      // Fill in valid form data
      await wrapper.find('#customer').setValue('1')
      await wrapper.find('[data-testid="description-0"]').setValue('Test Service')
      await wrapper.find('[data-testid="quantity-0"]').setValue('2')
      await wrapper.find('[data-testid="unit-price-0"]').setValue('150')
    })

    it('should create new quotation when not editing', async () => {
      const mockResponse = { data: { id: 1, ...mockQuotation } }
      quotationAPI.createQuotation.mockResolvedValue(mockResponse)
      
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      
      expect(quotationAPI.createQuotation).toHaveBeenCalledWith({
        customer_id: '1',
        quotation_date: expect.any(String),
        items: [{
          description: 'Test Service',
          quantity: 2,
          unit_price: 150
        }]
      })
      
      expect(wrapper.emitted('quotation-saved')).toBeTruthy()
    })

    it('should update existing quotation when editing', async () => {
      wrapper = createWrapper({ quotation: mockQuotation })
      await nextTick()
      
      const mockResponse = { data: { ...mockQuotation, updated_at: new Date().toISOString() } }
      quotationAPI.updateQuotation.mockResolvedValue(mockResponse)
      
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      
      expect(quotationAPI.updateQuotation).toHaveBeenCalledWith(
        mockQuotation.id,
        expect.any(Object)
      )
      
      expect(wrapper.emitted('quotation-saved')).toBeTruthy()
    })

    it('should show loading state during submission', async () => {
      quotationAPI.createQuotation.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      const form = wrapper.find('form')
      form.trigger('submit.prevent')
      
      await nextTick()
      
      expect(wrapper.find('[data-testid="submit-btn"]').text()).toContain('Creating...')
      expect(wrapper.find('[data-testid="submit-btn"]').element.disabled).toBe(true)
    })

    it('should handle submission errors', async () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: {
              customer_id: ['Customer is required']
            }
          }
        }
      }
      quotationAPI.createQuotation.mockRejectedValue(error)
      
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      
      await nextTick()
      
      expect(wrapper.vm.errors.customer_id).toEqual(['Customer is required'])
    })

    it('should reset form after successful creation', async () => {
      const mockResponse = { data: { id: 1, ...mockQuotation } }
      quotationAPI.createQuotation.mockResolvedValue(mockResponse)
      
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      
      await nextTick()
      
      expect(wrapper.vm.form.customer_id).toBe('')
      expect(wrapper.vm.form.items[0].description).toBe('')
    })
  })

  describe('Edit Mode', () => {
    it('should populate form with quotation data when editing', async () => {
      wrapper = createWrapper({ quotation: mockQuotation })
      await nextTick()
      
      expect(wrapper.find('h2').text()).toBe('Edit Quotation')
      expect(wrapper.vm.form.customer_id).toBe(mockQuotation.customer_id)
      expect(wrapper.vm.form.quotation_date).toBe(mockQuotation.quotation_date)
      expect(wrapper.vm.form.items).toHaveLength(2)
      expect(wrapper.vm.form.items[0].description).toBe('Consulting Service')
    })

    it('should show update button text when editing', async () => {
      wrapper = createWrapper({ quotation: mockQuotation })
      await nextTick()
      
      const submitButton = wrapper.find('[data-testid="submit-btn"]')
      expect(submitButton.text()).toContain('Update Quotation')
    })
  })

  describe('Currency Formatting', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await nextTick()
    })

    it('should format currency using Japanese locale', () => {
      const formatted = wrapper.vm.formatCurrency(1234.56)
      expect(formatted).toBe('1,234.56')
    })

    it('should handle zero amounts', () => {
      const formatted = wrapper.vm.formatCurrency(0)
      expect(formatted).toBe('0.00')
    })

    it('should handle large amounts', () => {
      const formatted = wrapper.vm.formatCurrency(1000000)
      expect(formatted).toBe('1,000,000.00')
    })
  })

  describe('Cancel Functionality', () => {
    it('should emit cancel event when cancel button is clicked', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const cancelButton = wrapper.find('[data-testid="cancel-btn"]')
      await cancelButton.trigger('click')
      
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    beforeEach(async () => {
      wrapper = createWrapper()
      await nextTick()
    })

    it('should have proper labels for form inputs', () => {
      expect(wrapper.find('label[for="customer"]').exists()).toBe(true)
      expect(wrapper.find('label[for="quotation_date"]').exists()).toBe(true)
    })

    it('should show required field indicators', () => {
      const requiredIndicators = wrapper.findAll('.text-red-500')
      expect(requiredIndicators.length).toBeGreaterThan(0)
    })

    it('should have proper button titles', () => {
      const addButton = wrapper.find('[data-testid="add-item-btn"]')
      expect(addButton.attributes('type')).toBe('button')
    })
  })

  describe('Error Handling', () => {
    it('should handle customer loading errors gracefully', async () => {
      customerAPI.getCustomers.mockRejectedValue(new Error('Network error'))
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.generalError).toBe('Failed to load customers. Please refresh the page.')
    })

    it('should clear errors when form is resubmitted', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      wrapper.vm.errors = { customer_id: ['Required'] }
      wrapper.vm.generalError = 'Some error'
      
      // Fill form and submit
      await wrapper.find('#customer').setValue('1')
      await wrapper.find('[data-testid="description-0"]').setValue('Test')
      await wrapper.find('[data-testid="quantity-0"]').setValue('1')
      await wrapper.find('[data-testid="unit-price-0"]').setValue('100')
      
      quotationAPI.createQuotation.mockResolvedValue({ data: mockQuotation })
      
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      
      expect(wrapper.vm.errors).toEqual({})
      expect(wrapper.vm.generalError).toBe('')
    })
  })

  describe('Performance', () => {
    it('should not create excessive reactivity when calculating totals', async () => {
      wrapper = createWrapper()
      await nextTick()
      
      const calculateSpy = vi.spyOn(wrapper.vm, 'calculateTotal')
      
      await wrapper.find('[data-testid="quantity-0"]').setValue('5')
      await wrapper.find('[data-testid="unit-price-0"]').setValue('100')
      
      // Should not be called excessively
      expect(calculateSpy).toHaveBeenCalledTimes(2)
    })
  })
})