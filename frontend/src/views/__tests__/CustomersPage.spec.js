import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CustomersPage from '../CustomersPage.vue'
import CustomerForm from '@/components/CustomerForm.vue'
import { customerAPI } from '@/services/apiClient'

// Mock the API client
vi.mock('@/services/apiClient', () => ({
  customerAPI: {
    getCustomers: vi.fn(),
    createCustomer: vi.fn(),
    updateCustomer: vi.fn(),
    deleteCustomer: vi.fn()
  }
}))

// Mock CustomerForm component to avoid testing its internal logic
vi.mock('@/components/CustomerForm.vue', () => ({
  default: {
    name: 'CustomerForm',
    props: ['customer'],
    emits: ['customer-saved', 'cancel'],
    template: '<div data-testid="customer-form">Customer Form Mock</div>'
  }
}))

describe('CustomersPage.vue', () => {
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

  describe('Loading State', () => {
    it('displays loading message when fetching customers', async () => {
      // Create a promise that we can control
      let resolvePromise
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      customerAPI.getCustomers.mockReturnValue(pendingPromise)

      wrapper = mount(CustomersPage)

      // Component should show loading state
      const loadingState = wrapper.find('[data-testid="loading-state"]')
      expect(loadingState.exists()).toBe(true)
      expect(loadingState.text()).toContain('Loading customers...')

      // Resolve the promise to complete the test
      resolvePromise({
        data: [],
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0
      })
      await wrapper.vm.$nextTick()
    })

    it('hides loading message after API call completes', async () => {
      const mockResponse = {
        data: [],
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      wrapper = mount(CustomersPage)

      // Wait for component to mount and API call to complete
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      // Loading state should be hidden
      const loadingState = wrapper.find('[data-testid="loading-state"]')
      expect(loadingState.exists()).toBe(false)
    })
  })

  describe('Error State', () => {
    it('displays error message when API call fails', async () => {
      const mockError = {
        message: 'Network error occurred'
      }

      customerAPI.getCustomers.mockRejectedValue(mockError)

      wrapper = mount(CustomersPage)

      // Wait for component to mount and API call to complete
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      // Error state should be displayed
      const errorState = wrapper.find('[data-testid="error-state"]')
      expect(errorState.exists()).toBe(true)
      expect(errorState.text()).toContain('Unable to load customers')
      expect(errorState.text()).toContain('Network error occurred')
    })

    it('allows retry when error occurs', async () => {
      const mockError = {
        message: 'Network error occurred'
      }

      customerAPI.getCustomers.mockRejectedValue(mockError)

      wrapper = mount(CustomersPage)

      // Wait for error state
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      // Mock successful response for retry
      const mockResponse = {
        data: [
          {
            id: 1,
            name: 'Test Company',
            contact_person: 'John Doe',
            email: 'john@test.com',
            phone: '123-456-7890',
            address: '123 Test St'
          }
        ],
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 1,
        total: 1
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      // Click retry button
      const retryButton = wrapper.find('[data-testid="error-state"] button')
      await retryButton.trigger('click')

      // Wait for retry API call
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      // Error should be gone and customer list should be displayed
      expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(false)
      expect(wrapper.find('[data-testid="customer-list"]').exists()).toBe(true)
    })
  })

  describe('Empty State', () => {
    it('displays empty state when no customers exist', async () => {
      const mockResponse = {
        data: [],
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      wrapper = mount(CustomersPage)

      // Wait for API call to complete
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      // Empty state should be displayed
      const emptyState = wrapper.find('[data-testid="empty-state"]')
      expect(emptyState.exists()).toBe(true)
      expect(emptyState.text()).toContain('No customers yet')
      expect(emptyState.text()).toContain('Start building your customer database')
    })

    it('shows "Add Your First Customer" button in empty state', async () => {
      const mockResponse = {
        data: [],
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      wrapper = mount(CustomersPage)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      const emptyState = wrapper.find('[data-testid="empty-state"]')
      const addButton = emptyState.find('button')
      
      expect(addButton.exists()).toBe(true)
      expect(addButton.text()).toContain('Add Your First Customer')
    })
  })

  describe('Customer List Display', () => {
    const mockCustomers = [
      {
        id: 1,
        name: 'Test Company 1',
        contact_person: 'John Doe',
        email: 'john@test1.com',
        phone: '123-456-7890',
        address: '123 Test St'
      },
      {
        id: 2,
        name: 'Test Company 2',
        contact_person: 'Jane Smith',
        email: 'jane@test2.com',
        phone: '098-765-4321',
        address: '456 Another St'
      }
    ]

    it('displays customer list when customers exist', async () => {
      const mockResponse = {
        data: mockCustomers,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 2,
        total: 2
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      wrapper = mount(CustomersPage)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      // Customer list should be displayed
      const customerList = wrapper.find('[data-testid="customer-list"]')
      expect(customerList.exists()).toBe(true)

      // Should display all customers
      const customerRows = wrapper.findAll('[data-testid="customer-row"]')
      expect(customerRows.length).toBe(2)
    })

    it('displays customer information correctly', async () => {
      const mockResponse = {
        data: mockCustomers,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 2,
        total: 2
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      wrapper = mount(CustomersPage)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      // Check first customer data
      const firstRow = wrapper.findAll('[data-testid="customer-row"]')[0]
      expect(firstRow.text()).toContain('Test Company 1')
      expect(firstRow.text()).toContain('John Doe')
      expect(firstRow.text()).toContain('john@test1.com')
      expect(firstRow.text()).toContain('123-456-7890')
    })

    it('creates mailto links for email addresses', async () => {
      const mockResponse = {
        data: mockCustomers,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 2,
        total: 2
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      wrapper = mount(CustomersPage)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      const emailLinks = wrapper.findAll('a[href^="mailto:"]')
      expect(emailLinks.length).toBe(2)
      expect(emailLinks[0].attributes('href')).toBe('mailto:john@test1.com')
      expect(emailLinks[1].attributes('href')).toBe('mailto:jane@test2.com')
    })

    it('creates tel links for phone numbers', async () => {
      const mockResponse = {
        data: mockCustomers,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 2,
        total: 2
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      wrapper = mount(CustomersPage)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      const phoneLinks = wrapper.findAll('a[href^="tel:"]')
      expect(phoneLinks.length).toBe(2)
      expect(phoneLinks[0].attributes('href')).toBe('tel:123-456-7890')
      expect(phoneLinks[1].attributes('href')).toBe('tel:098-765-4321')
    })
  })

  describe('Customer Actions', () => {
    const mockCustomers = [
      {
        id: 1,
        name: 'Test Company',
        contact_person: 'John Doe',
        email: 'john@test.com',
        phone: '123-456-7890',
        address: '123 Test St'
      }
    ]

    beforeEach(async () => {
      const mockResponse = {
        data: mockCustomers,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 1,
        total: 1
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      wrapper = mount(CustomersPage)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('shows Edit and Delete buttons for each customer', () => {
      const customerRow = wrapper.find('[data-testid="customer-row"]')
      const editButton = customerRow.find('button:contains("Edit")')
      const deleteButton = customerRow.find('button:contains("Delete")')

      expect(editButton.exists()).toBe(true)
      expect(deleteButton.exists()).toBe(true)
    })

    it('opens edit modal when Edit button is clicked', async () => {
      const editButton = wrapper.find('button:contains("Edit")')
      await editButton.trigger('click')

      // Modal should be visible
      const modal = wrapper.find('[data-testid="customer-modal"]')
      expect(modal.exists()).toBe(true)

      // Customer form should be present
      const customerForm = modal.find('[data-testid="customer-form"]')
      expect(customerForm.exists()).toBe(true)
    })

    it('opens delete confirmation modal when Delete button is clicked', async () => {
      const deleteButton = wrapper.find('button:contains("Delete")')
      await deleteButton.trigger('click')

      // Delete modal should be visible
      const deleteModal = wrapper.find('[data-testid="delete-modal"]')
      expect(deleteModal.exists()).toBe(true)
      expect(deleteModal.text()).toContain('Delete Customer')
      expect(deleteModal.text()).toContain('Test Company')
    })
  })

  describe('Modal Management', () => {
    beforeEach(async () => {
      const mockResponse = {
        data: [],
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      wrapper = mount(CustomersPage)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('opens add customer modal when "Add New Customer" button is clicked', async () => {
      const addButton = wrapper.find('button:contains("Add New Customer")')
      await addButton.trigger('click')

      // Modal should be visible
      const modal = wrapper.find('[data-testid="customer-modal"]')
      expect(modal.exists()).toBe(true)

      // Customer form should be present
      const customerForm = modal.find('[data-testid="customer-form"]')
      expect(customerForm.exists()).toBe(true)
    })

    it('closes modal when background overlay is clicked', async () => {
      // Open modal first
      const addButton = wrapper.find('button:contains("Add New Customer")')
      await addButton.trigger('click')

      // Click background overlay
      const overlay = wrapper.find('.fixed.inset-0.bg-gray-500')
      await overlay.trigger('click')

      // Modal should be closed
      const modal = wrapper.find('[data-testid="customer-modal"]')
      expect(modal.exists()).toBe(false)
    })

    it('closes modal when customer form emits cancel event', async () => {
      // Open modal first
      const addButton = wrapper.find('button:contains("Add New Customer")')
      await addButton.trigger('click')

      // Find the customer form component and emit cancel event
      const customerForm = wrapper.findComponent({ name: 'CustomerForm' })
      customerForm.vm.$emit('cancel')
      await wrapper.vm.$nextTick()

      // Modal should be closed
      const modal = wrapper.find('[data-testid="customer-modal"]')
      expect(modal.exists()).toBe(false)
    })
  })

  describe('Customer Management', () => {
    beforeEach(async () => {
      const mockResponse = {
        data: [],
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      wrapper = mount(CustomersPage)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('adds new customer to list when customer-saved event is emitted', async () => {
      const newCustomer = {
        id: 1,
        name: 'New Company',
        contact_person: 'John Doe',
        email: 'john@new.com',
        phone: '123-456-7890',
        address: '123 New St'
      }

      // Open modal
      const addButton = wrapper.find('button:contains("Add New Customer")')
      await addButton.trigger('click')

      // Emit customer-saved event
      const customerForm = wrapper.findComponent({ name: 'CustomerForm' })
      customerForm.vm.$emit('customer-saved', newCustomer)
      await wrapper.vm.$nextTick()

      // Customer should be added to the list
      expect(wrapper.vm.customers).toContain(newCustomer)

      // Modal should be closed
      const modal = wrapper.find('[data-testid="customer-modal"]')
      expect(modal.exists()).toBe(false)
    })

    it('updates existing customer in list when edited', async () => {
      // First set up a customer in the list
      wrapper.vm.customers = [
        {
          id: 1,
          name: 'Old Company',
          contact_person: 'John Doe',
          email: 'john@old.com',
          phone: '123-456-7890',
          address: '123 Old St'
        }
      ]
      await wrapper.vm.$nextTick()

      const updatedCustomer = {
        id: 1,
        name: 'Updated Company',
        contact_person: 'John Smith',
        email: 'john@updated.com',
        phone: '098-765-4321',
        address: '456 Updated St'
      }

      // Set selected customer for editing
      wrapper.vm.selectedCustomer = { id: 1 }
      wrapper.vm.showModal = true
      await wrapper.vm.$nextTick()

      // Emit customer-saved event
      const customerForm = wrapper.findComponent({ name: 'CustomerForm' })
      customerForm.vm.$emit('customer-saved', updatedCustomer)
      await wrapper.vm.$nextTick()

      // Customer should be updated in the list
      expect(wrapper.vm.customers[0]).toEqual(updatedCustomer)

      // Modal should be closed
      const modal = wrapper.find('[data-testid="customer-modal"]')
      expect(modal.exists()).toBe(false)
    })

    it('deletes customer when confirmed', async () => {
      const customerToDelete = {
        id: 1,
        name: 'Test Company',
        contact_person: 'John Doe',
        email: 'john@test.com',
        phone: '123-456-7890',
        address: '123 Test St'
      }

      // Set up customer in list
      wrapper.vm.customers = [customerToDelete]
      wrapper.vm.customerToDelete = customerToDelete
      wrapper.vm.showDeleteModal = true
      await wrapper.vm.$nextTick()

      customerAPI.deleteCustomer.mockResolvedValue({})

      // Click delete button in modal
      const deleteButton = wrapper.find('[data-testid="delete-modal"] button:contains("Delete")')
      await deleteButton.trigger('click')

      // Wait for API call
      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      // API should be called
      expect(customerAPI.deleteCustomer).toHaveBeenCalledWith(customerToDelete.id)

      // Customer should be removed from list
      expect(wrapper.vm.customers).toHaveLength(0)

      // Delete modal should be closed
      const deleteModal = wrapper.find('[data-testid="delete-modal"]')
      expect(deleteModal.exists()).toBe(false)
    })
  })

  describe('Page Title and Header', () => {
    beforeEach(async () => {
      const mockResponse = {
        data: [],
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      wrapper = mount(CustomersPage)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    it('displays correct page title and description', () => {
      expect(wrapper.text()).toContain('Customers')
      expect(wrapper.text()).toContain('Manage your customer relationships and contact information')
    })

    it('displays "Add New Customer" button in header', () => {
      const headerButton = wrapper.find('header button:contains("Add New Customer")')
      expect(headerButton.exists()).toBe(true)
    })
  })

  describe('Component Integration', () => {
    it('loads customers on component mount', () => {
      customerAPI.getCustomers.mockResolvedValue({
        data: [],
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0
      })

      wrapper = mount(CustomersPage)

      // API should be called immediately on mount
      expect(customerAPI.getCustomers).toHaveBeenCalledWith({ page: 1 })
    })

    it('handles API response correctly', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            name: 'Test Company',
            contact_person: 'John Doe',
            email: 'john@test.com',
            phone: '123-456-7890',
            address: '123 Test St'
          }
        ],
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 1,
        total: 1
      }

      customerAPI.getCustomers.mockResolvedValue(mockResponse)

      wrapper = mount(CustomersPage)

      await wrapper.vm.$nextTick()
      await new Promise(resolve => setTimeout(resolve, 0))

      // Component state should be updated correctly
      expect(wrapper.vm.customers).toEqual(mockResponse.data)
      expect(wrapper.vm.pagination).toEqual({
        current_page: 1,
        last_page: 1,
        from: 1,
        to: 1,
        total: 1
      })
      expect(wrapper.vm.isLoading).toBe(false)
      expect(wrapper.vm.error).toBe('')
    })
  })
})