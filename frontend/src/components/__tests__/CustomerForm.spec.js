import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomerForm from '../CustomerForm.vue'
import { customerAPI } from '@/services/apiClient'

// Mock the API client
vi.mock('@/services/apiClient', () => ({
  customerAPI: {
    createCustomer: vi.fn(),
    updateCustomer: vi.fn()
  }
}))

describe('CustomerForm.vue', () => {
  let wrapper

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up after each test
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component Rendering', () => {
    it('renders all required input fields correctly', () => {
      wrapper = mount(CustomerForm)

      // Test that all form fields are present
      expect(wrapper.find('#name').exists()).toBe(true)
      expect(wrapper.find('#contact_person').exists()).toBe(true)
      expect(wrapper.find('#email').exists()).toBe(true)
      expect(wrapper.find('#phone').exists()).toBe(true)
      expect(wrapper.find('#address').exists()).toBe(true)

      // Test field labels
      expect(wrapper.text()).toContain('Company Name')
      expect(wrapper.text()).toContain('Contact Person')
      expect(wrapper.text()).toContain('Email Address')
      expect(wrapper.text()).toContain('Phone Number')
      expect(wrapper.text()).toContain('Address')

      // Test required field indicators
      const requiredFields = wrapper.findAll('.text-red-500')
      expect(requiredFields.length).toBe(5) // All fields are required
    })

    it('displays "Add New Customer" title when creating', () => {
      wrapper = mount(CustomerForm)
      expect(wrapper.text()).toContain('Add New Customer')
      expect(wrapper.text()).toContain('Enter customer details to create a new record.')
    })

    it('displays "Edit Customer" title when editing', () => {
      const existingCustomer = {
        id: 1,
        name: 'Test Company',
        contact_person: 'John Doe',
        email: 'john@test.com',
        phone: '123-456-7890',
        address: '123 Test St'
      }

      wrapper = mount(CustomerForm, {
        props: { customer: existingCustomer }
      })

      expect(wrapper.text()).toContain('Edit Customer')
      expect(wrapper.text()).toContain('Update customer information below.')
    })

    it('populates form fields when editing existing customer', async () => {
      const existingCustomer = {
        id: 1,
        name: 'Test Company',
        contact_person: 'John Doe',
        email: 'john@test.com',
        phone: '123-456-7890',
        address: '123 Test St'
      }

      wrapper = mount(CustomerForm, {
        props: { customer: existingCustomer }
      })

      await wrapper.vm.$nextTick()

      // Check that form fields are populated
      expect(wrapper.find('#name').element.value).toBe(existingCustomer.name)
      expect(wrapper.find('#contact_person').element.value).toBe(existingCustomer.contact_person)
      expect(wrapper.find('#email').element.value).toBe(existingCustomer.email)
      expect(wrapper.find('#phone').element.value).toBe(existingCustomer.phone)
      expect(wrapper.find('#address').element.value).toBe(existingCustomer.address)
    })
  })

  describe('Form Validation', () => {
    beforeEach(() => {
      wrapper = mount(CustomerForm)
    })

    it('disables submit button when form is empty', () => {
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeDefined()
    })

    it('enables submit button when all required fields are filled', async () => {
      // Fill all required fields
      await wrapper.find('#name').setValue('Test Company')
      await wrapper.find('#contact_person').setValue('John Doe')
      await wrapper.find('#email').setValue('john@test.com')
      await wrapper.find('#phone').setValue('123-456-7890')
      await wrapper.find('#address').setValue('123 Test St')

      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.attributes('disabled')).toBeUndefined()
    })

    it('displays validation errors from API response', async () => {
      const mockErrors = {
        response: {
          status: 422,
          data: {
            errors: {
              email: ['The email has already been taken.'],
              name: ['The name field is required.']
            }
          }
        }
      }

      customerAPI.createCustomer.mockRejectedValue(mockErrors)

      // Fill form and submit
      await wrapper.find('#name').setValue('Test Company')
      await wrapper.find('#contact_person').setValue('John Doe')
      await wrapper.find('#email').setValue('john@test.com')
      await wrapper.find('#phone').setValue('123-456-7890')
      await wrapper.find('#address').setValue('123 Test St')

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Check that error messages are displayed
      expect(wrapper.text()).toContain('The email has already been taken.')
      expect(wrapper.text()).toContain('The name field is required.')
    })

    it('displays general error message for non-validation errors', async () => {
      const mockError = {
        message: 'Network error occurred'
      }

      customerAPI.createCustomer.mockRejectedValue(mockError)

      // Fill form and submit
      await wrapper.find('#name').setValue('Test Company')
      await wrapper.find('#contact_person').setValue('John Doe')
      await wrapper.find('#email').setValue('john@test.com')
      await wrapper.find('#phone').setValue('123-456-7890')
      await wrapper.find('#address').setValue('123 Test St')

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Check that general error message is displayed
      expect(wrapper.text()).toContain('Network error occurred')
    })
  })

  describe('Form Submission', () => {
    it('creates new customer and emits customer-saved event', async () => {
      const mockCustomer = {
        id: 1,
        name: 'Test Company',
        contact_person: 'John Doe',
        email: 'john@test.com',
        phone: '123-456-7890',
        address: '123 Test St'
      }

      customerAPI.createCustomer.mockResolvedValue(mockCustomer)

      wrapper = mount(CustomerForm)

      // Fill form
      await wrapper.find('#name').setValue(mockCustomer.name)
      await wrapper.find('#contact_person').setValue(mockCustomer.contact_person)
      await wrapper.find('#email').setValue(mockCustomer.email)
      await wrapper.find('#phone').setValue(mockCustomer.phone)
      await wrapper.find('#address').setValue(mockCustomer.address)

      // Submit form
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Verify API was called with correct data
      expect(customerAPI.createCustomer).toHaveBeenCalledWith({
        name: mockCustomer.name,
        contact_person: mockCustomer.contact_person,
        email: mockCustomer.email,
        phone: mockCustomer.phone,
        address: mockCustomer.address
      })

      // Verify event was emitted
      expect(wrapper.emitted('customer-saved')).toBeTruthy()
      expect(wrapper.emitted('customer-saved')[0][0]).toEqual(mockCustomer)
    })

    it('updates existing customer and emits customer-saved event', async () => {
      const existingCustomer = {
        id: 1,
        name: 'Old Company',
        contact_person: 'Jane Doe',
        email: 'jane@old.com',
        phone: '111-111-1111',
        address: '111 Old St'
      }

      const updatedCustomer = {
        id: 1,
        name: 'Updated Company',
        contact_person: 'Jane Smith',
        email: 'jane@updated.com',
        phone: '222-222-2222',
        address: '222 Updated St'
      }

      customerAPI.updateCustomer.mockResolvedValue(updatedCustomer)

      wrapper = mount(CustomerForm, {
        props: { customer: existingCustomer }
      })

      // Update form fields
      await wrapper.find('#name').setValue(updatedCustomer.name)
      await wrapper.find('#contact_person').setValue(updatedCustomer.contact_person)
      await wrapper.find('#email').setValue(updatedCustomer.email)
      await wrapper.find('#phone').setValue(updatedCustomer.phone)
      await wrapper.find('#address').setValue(updatedCustomer.address)

      // Submit form
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Verify API was called with correct data
      expect(customerAPI.updateCustomer).toHaveBeenCalledWith(existingCustomer.id, {
        name: updatedCustomer.name,
        contact_person: updatedCustomer.contact_person,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        address: updatedCustomer.address
      })

      // Verify event was emitted
      expect(wrapper.emitted('customer-saved')).toBeTruthy()
      expect(wrapper.emitted('customer-saved')[0][0]).toEqual(updatedCustomer)
    })

    it('shows loading state during submission', async () => {
      // Create a promise that we can resolve manually
      let resolvePromise
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      customerAPI.createCustomer.mockReturnValue(pendingPromise)

      wrapper = mount(CustomerForm)

      // Fill form
      await wrapper.find('#name').setValue('Test Company')
      await wrapper.find('#contact_person').setValue('John Doe')
      await wrapper.find('#email').setValue('john@test.com')
      await wrapper.find('#phone').setValue('123-456-7890')
      await wrapper.find('#address').setValue('123 Test St')

      // Submit form
      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Check loading state
      const submitButton = wrapper.find('button[type="submit"]')
      expect(submitButton.text()).toContain('Saving...')
      expect(submitButton.attributes('disabled')).toBeDefined()

      // All form inputs should be disabled during submission
      expect(wrapper.find('#name').attributes('disabled')).toBeDefined()
      expect(wrapper.find('#contact_person').attributes('disabled')).toBeDefined()
      expect(wrapper.find('#email').attributes('disabled')).toBeDefined()
      expect(wrapper.find('#phone').attributes('disabled')).toBeDefined()
      expect(wrapper.find('#address').attributes('disabled')).toBeDefined()

      // Resolve the promise to complete the test
      resolvePromise({ id: 1, name: 'Test Company' })
      await wrapper.vm.$nextTick()
    })

    it('prevents double submission during loading', async () => {
      let resolveCount = 0
      customerAPI.createCustomer.mockImplementation(() => {
        resolveCount++
        return Promise.resolve({ id: 1, name: 'Test Company' })
      })

      wrapper = mount(CustomerForm)

      // Fill form
      await wrapper.find('#name').setValue('Test Company')
      await wrapper.find('#contact_person').setValue('John Doe')
      await wrapper.find('#email').setValue('john@test.com')
      await wrapper.find('#phone').setValue('123-456-7890')
      await wrapper.find('#address').setValue('123 Test St')

      // Submit form multiple times rapidly
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      await form.trigger('submit.prevent')
      await form.trigger('submit.prevent')

      await wrapper.vm.$nextTick()

      // API should only be called once
      expect(customerAPI.createCustomer).toHaveBeenCalledTimes(1)
    })

    it('clears form after successful creation', async () => {
      const mockCustomer = {
        id: 1,
        name: 'Test Company',
        contact_person: 'John Doe',
        email: 'john@test.com',
        phone: '123-456-7890',
        address: '123 Test St'
      }

      customerAPI.createCustomer.mockResolvedValue(mockCustomer)

      wrapper = mount(CustomerForm)

      // Fill and submit form
      await wrapper.find('#name').setValue(mockCustomer.name)
      await wrapper.find('#contact_person').setValue(mockCustomer.contact_person)
      await wrapper.find('#email').setValue(mockCustomer.email)
      await wrapper.find('#phone').setValue(mockCustomer.phone)
      await wrapper.find('#address').setValue(mockCustomer.address)

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Form should be cleared
      expect(wrapper.find('#name').element.value).toBe('')
      expect(wrapper.find('#contact_person').element.value).toBe('')
      expect(wrapper.find('#email').element.value).toBe('')
      expect(wrapper.find('#phone').element.value).toBe('')
      expect(wrapper.find('#address').element.value).toBe('')
    })
  })

  describe('User Interactions', () => {
    beforeEach(() => {
      wrapper = mount(CustomerForm)
    })

    it('emits cancel event when cancel button is clicked', async () => {
      const cancelButton = wrapper.find('button[type="button"]')
      await cancelButton.trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('clears errors when user starts typing', async () => {
      // First create an error state
      const mockErrors = {
        response: {
          status: 422,
          data: {
            errors: {
              email: ['The email has already been taken.']
            }
          }
        }
      }

      customerAPI.createCustomer.mockRejectedValue(mockErrors)

      // Fill form and submit to create error
      await wrapper.find('#name').setValue('Test Company')
      await wrapper.find('#contact_person').setValue('John Doe')
      await wrapper.find('#email').setValue('john@test.com')
      await wrapper.find('#phone').setValue('123-456-7890')
      await wrapper.find('#address').setValue('123 Test St')

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      // Verify error is displayed
      expect(wrapper.text()).toContain('The email has already been taken.')

      // Clear errors manually (simulating new form interaction)
      wrapper.vm.clearErrors()
      await wrapper.vm.$nextTick()

      // Error should be cleared
      expect(wrapper.text()).not.toContain('The email has already been taken.')
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      wrapper = mount(CustomerForm)
    })

    it('has proper labels for all form fields', () => {
      const labels = wrapper.findAll('label')
      expect(labels.length).toBe(5)

      const labelTexts = labels.map(label => label.text())
      expect(labelTexts).toContain('Company Name *')
      expect(labelTexts).toContain('Contact Person *')
      expect(labelTexts).toContain('Email Address *')
      expect(labelTexts).toContain('Phone Number *')
      expect(labelTexts).toContain('Address *')
    })

    it('associates labels with form fields using for attribute', () => {
      const nameLabel = wrapper.find('label[for="name"]')
      const nameInput = wrapper.find('input#name')
      
      expect(nameLabel.exists()).toBe(true)
      expect(nameInput.exists()).toBe(true)

      const emailLabel = wrapper.find('label[for="email"]')
      const emailInput = wrapper.find('input#email')
      
      expect(emailLabel.exists()).toBe(true)
      expect(emailInput.exists()).toBe(true)
    })

    it('marks required fields appropriately', () => {
      const requiredInputs = wrapper.findAll('input[required], textarea[required]')
      expect(requiredInputs.length).toBe(5) // All fields are required
    })
  })
})