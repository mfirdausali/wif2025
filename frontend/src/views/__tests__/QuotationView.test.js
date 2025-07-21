import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import QuotationView from '../QuotationView.vue'
import { quotationAPI } from '@/services/apiClient'

// Mock the API client
vi.mock('@/services/apiClient', () => ({
  quotationAPI: {
    getQuotation: vi.fn(),
    updateQuotationStatus: vi.fn(),
    deleteQuotation: vi.fn()
  }
}))

// Mock router
const mockRouter = {
  back: vi.fn(),
  push: vi.fn()
}

const mockRoute = {
  params: {
    id: '1'
  }
}

const mockQuotation = {
  id: 1,
  customer_id: 1,
  quotation_date: '2024-01-15',
  status: 'Draft',
  total_amount: 1050.00,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  customer: {
    id: 1,
    name: 'Test Company',
    contact_person: 'John Doe',
    email: 'john@test.com',
    phone: '123-456-7890',
    address: '123 Test Street, Test City'
  },
  items: [
    {
      id: 1,
      description: 'Consulting Service',
      quantity: 5.00,
      unit_price: 200.00,
      line_total: 1000.00
    },
    {
      id: 2,
      description: 'Additional Service',
      quantity: 1.00,
      unit_price: 50.00,
      line_total: 50.00
    }
  ]
}

describe('QuotationView', () => {
  let wrapper

  const createWrapper = (routeParams = { id: '1' }) => {
    return mount(QuotationView, {
      global: {
        mocks: {
          $router: mockRouter,
          $route: {
            params: routeParams
          }
        },
        stubs: {
          'router-link': true
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Initialization', () => {
    it('should render loading state initially', async () => {
      quotationAPI.getQuotation.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      wrapper = createWrapper()
      
      expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="loading-state"]').text()).toContain('Loading quotation details...')
    })

    it('should load quotation data on mount', async () => {
      quotationAPI.getQuotation.mockResolvedValue({ data: mockQuotation })
      wrapper = createWrapper()
      await nextTick()
      
      expect(quotationAPI.getQuotation).toHaveBeenCalledWith('1')
    })

    it('should display error state when loading fails', async () => {
      const errorMessage = 'Failed to load quotation'
      quotationAPI.getQuotation.mockRejectedValue(new Error(errorMessage))
      
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="error-state"]').text()).toContain(errorMessage)
    })

    it('should handle invalid quotation ID', async () => {
      wrapper = createWrapper({ id: undefined })
      await nextTick()
      
      expect(wrapper.find('[data-testid="error-state"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="error-state"]').text()).toContain('Invalid quotation ID')
    })
  })

  describe('Quotation Display', () => {
    beforeEach(async () => {
      quotationAPI.getQuotation.mockResolvedValue({ data: mockQuotation })
      wrapper = createWrapper()
      await nextTick()
    })

    it('should display quotation header information correctly', () => {
      const header = wrapper.find('h1')
      expect(header.text()).toBe('Quotation #1')
      
      expect(wrapper.text()).toContain('Created Jan 15, 2024')
    })

    it('should display customer information correctly', () => {
      const customerSection = wrapper.find('[data-testid="customer-info"]')
      
      expect(customerSection.text()).toContain('Test Company')
      expect(customerSection.text()).toContain('John Doe')
      expect(customerSection.text()).toContain('john@test.com')
      expect(customerSection.text()).toContain('123-456-7890')
      expect(customerSection.text()).toContain('123 Test Street, Test City')
    })

    it('should display line items correctly', () => {
      const itemsTable = wrapper.find('[data-testid="line-items-table"]')
      const rows = itemsTable.findAll('tbody tr')
      
      expect(rows).toHaveLength(2)
      
      // First item
      expect(rows[0].text()).toContain('Consulting Service')
      expect(rows[0].text()).toContain('5.00')
      expect(rows[0].text()).toContain('¥200.00')
      expect(rows[0].text()).toContain('¥1,000.00')
      
      // Second item
      expect(rows[1].text()).toContain('Additional Service')
      expect(rows[1].text()).toContain('1.00')
      expect(rows[1].text()).toContain('¥50.00')
      expect(rows[1].text()).toContain('¥50.00')
    })

    it('should display total amount correctly', () => {
      const totalFooter = wrapper.find('tfoot')
      expect(totalFooter.text()).toContain('¥1,050.00')
    })

    it('should display quotation details in sidebar', () => {
      const sidebar = wrapper.find('[data-testid="quotation-sidebar"]')
      
      expect(sidebar.text()).toContain('January 15, 2024') // Quotation date
      expect(sidebar.text()).toContain('Draft') // Status
      expect(sidebar.text()).toContain('2') // Total items
      expect(sidebar.text()).toContain('¥1,050.00') // Total amount
    })
  })

  describe('Status Management', () => {
    beforeEach(async () => {
      quotationAPI.getQuotation.mockResolvedValue({ 
        data: { ...mockQuotation, status: 'Draft' } 
      })
      wrapper = createWrapper()
      await nextTick()
    })

    it('should show status update dropdown for updatable statuses', () => {
      const updateButton = wrapper.find('[data-testid="status-update-btn"]')
      expect(updateButton.exists()).toBe(true)
    })

    it('should hide status update dropdown for final statuses', async () => {
      quotationAPI.getQuotation.mockResolvedValue({ 
        data: { ...mockQuotation, status: 'Accepted' } 
      })
      wrapper = createWrapper()
      await nextTick()
      
      const updateButton = wrapper.find('[data-testid="status-update-btn"]')
      expect(updateButton.exists()).toBe(false)
    })

    it('should open status dropdown when clicked', async () => {
      const updateButton = wrapper.find('[data-testid="status-update-btn"]')
      await updateButton.trigger('click')
      
      const dropdown = wrapper.find('[data-testid="status-dropdown"]')
      expect(dropdown.exists()).toBe(true)
    })

    it('should update quotation status when new status is selected', async () => {
      const updatedQuotation = { ...mockQuotation, status: 'Sent' }
      quotationAPI.updateQuotationStatus.mockResolvedValue({ data: updatedQuotation })
      
      wrapper.vm.updateStatus('Sent')
      await nextTick()
      
      expect(quotationAPI.updateQuotationStatus).toHaveBeenCalledWith(1, 'Sent')
    })

    it('should handle status update errors', async () => {
      const errorMessage = 'Failed to update status'
      quotationAPI.updateQuotationStatus.mockRejectedValue(new Error(errorMessage))
      
      wrapper.vm.updateStatus('Sent')
      await nextTick()
      
      expect(wrapper.vm.error).toBe(errorMessage)
    })

    it('should show correct status badge classes', () => {
      const statusBadge = wrapper.find('[data-testid="status-badge"]')
      expect(statusBadge.classes()).toContain('bg-gray-100')
      expect(statusBadge.classes()).toContain('text-gray-800')
    })
  })

  describe('Action Buttons', () => {
    beforeEach(async () => {
      quotationAPI.getQuotation.mockResolvedValue({ data: mockQuotation })
      wrapper = createWrapper()
      await nextTick()
    })

    it('should enable edit button for editable statuses', () => {
      const editButton = wrapper.find('[data-testid="edit-btn"]')
      expect(editButton.element.disabled).toBe(false)
    })

    it('should disable edit button for final statuses', async () => {
      quotationAPI.getQuotation.mockResolvedValue({ 
        data: { ...mockQuotation, status: 'Accepted' } 
      })
      wrapper = createWrapper()
      await nextTick()
      
      const editButton = wrapper.find('[data-testid="edit-btn"]')
      expect(editButton.element.disabled).toBe(true)
    })

    it('should navigate to edit page when edit button is clicked', async () => {
      const editButton = wrapper.find('[data-testid="edit-btn"]')
      await editButton.trigger('click')
      
      expect(mockRouter.push).toHaveBeenCalledWith('/quotations/1/edit')
    })

    it('should navigate back when back button is clicked', async () => {
      const backButton = wrapper.find('[data-testid="back-btn"]')
      await backButton.trigger('click')
      
      expect(mockRouter.back).toHaveBeenCalled()
    })
  })

  describe('Quick Actions', () => {
    beforeEach(async () => {
      quotationAPI.getQuotation.mockResolvedValue({ data: mockQuotation })
      wrapper = createWrapper()
      await nextTick()
    })

    it('should show PDF generation button', () => {
      const pdfButton = wrapper.find('[data-testid="generate-pdf-btn"]')
      expect(pdfButton.exists()).toBe(true)
      expect(pdfButton.text()).toContain('Download PDF')
    })

    it('should handle PDF generation', async () => {
      const pdfButton = wrapper.find('[data-testid="generate-pdf-btn"]')
      await pdfButton.trigger('click')
      
      expect(wrapper.vm.isGeneratingPDF).toBe(true)
    })

    it('should show email button when customer has email', () => {
      const emailButton = wrapper.find('[data-testid="email-btn"]')
      expect(emailButton.exists()).toBe(true)
      expect(emailButton.element.disabled).toBe(false)
    })

    it('should disable email button when customer has no email', async () => {
      const quotationWithoutEmail = {
        ...mockQuotation,
        customer: { ...mockQuotation.customer, email: null }
      }
      quotationAPI.getQuotation.mockResolvedValue({ data: quotationWithoutEmail })
      wrapper = createWrapper()
      await nextTick()
      
      const emailButton = wrapper.find('[data-testid="email-btn"]')
      expect(emailButton.element.disabled).toBe(true)
    })

    it('should show delete button for draft quotations', () => {
      const deleteButton = wrapper.find('[data-testid="delete-btn"]')
      expect(deleteButton.exists()).toBe(true)
    })

    it('should hide delete button for non-draft quotations', async () => {
      quotationAPI.getQuotation.mockResolvedValue({ 
        data: { ...mockQuotation, status: 'Sent' } 
      })
      wrapper = createWrapper()
      await nextTick()
      
      const deleteButton = wrapper.find('[data-testid="delete-btn"]')
      expect(deleteButton.exists()).toBe(false)
    })
  })

  describe('Delete Functionality', () => {
    beforeEach(async () => {
      quotationAPI.getQuotation.mockResolvedValue({ data: mockQuotation })
      wrapper = createWrapper()
      await nextTick()
    })

    it('should show delete confirmation modal when delete is clicked', async () => {
      const deleteButton = wrapper.find('[data-testid="delete-btn"]')
      await deleteButton.trigger('click')
      
      expect(wrapper.vm.showDeleteModal).toBe(true)
      const modal = wrapper.find('[data-testid="delete-modal"]')
      expect(modal.exists()).toBe(true)
    })

    it('should close modal when cancel is clicked', async () => {
      wrapper.vm.showDeleteModal = true
      await nextTick()
      
      const cancelButton = wrapper.find('[data-testid="delete-cancel-btn"]')
      await cancelButton.trigger('click')
      
      expect(wrapper.vm.showDeleteModal).toBe(false)
    })

    it('should delete quotation and redirect when confirmed', async () => {
      quotationAPI.deleteQuotation.mockResolvedValue({})
      wrapper.vm.showDeleteModal = true
      await nextTick()
      
      const confirmButton = wrapper.find('[data-testid="delete-confirm-btn"]')
      await confirmButton.trigger('click')
      
      expect(quotationAPI.deleteQuotation).toHaveBeenCalledWith(1)
      expect(mockRouter.push).toHaveBeenCalledWith('/quotations')
    })

    it('should handle delete errors', async () => {
      const errorMessage = 'Failed to delete quotation'
      quotationAPI.deleteQuotation.mockRejectedValue(new Error(errorMessage))
      
      wrapper.vm.deleteQuotation()
      await nextTick()
      
      expect(wrapper.vm.error).toBe(errorMessage)
    })
  })

  describe('Currency and Date Formatting', () => {
    beforeEach(async () => {
      quotationAPI.getQuotation.mockResolvedValue({ data: mockQuotation })
      wrapper = createWrapper()
      await nextTick()
    })

    it('should format currency using Japanese locale', () => {
      const formatted = wrapper.vm.formatCurrency(1234.56)
      expect(formatted).toBe('1,234.56')
    })

    it('should format numbers correctly', () => {
      const formatted = wrapper.vm.formatNumber(5.5)
      expect(formatted).toBe('5.50')
    })

    it('should format dates correctly', () => {
      const formatted = wrapper.vm.formatDate('2024-01-15')
      expect(formatted).toBe('January 15, 2024')
    })

    it('should format datetime correctly', () => {
      const formatted = wrapper.vm.formatDateTime('2024-01-15T10:30:00Z')
      expect(formatted).toContain('Jan 15, 2024')
      expect(formatted).toContain('10:30')
    })
  })

  describe('Status Badge Styling', () => {
    it('should return correct classes for different statuses', async () => {
      quotationAPI.getQuotation.mockResolvedValue({ data: mockQuotation })
      wrapper = createWrapper()
      await nextTick()
      
      expect(wrapper.vm.getStatusBadgeClass('Draft')).toContain('bg-gray-100 text-gray-800')
      expect(wrapper.vm.getStatusBadgeClass('Sent')).toContain('bg-blue-100 text-blue-800')
      expect(wrapper.vm.getStatusBadgeClass('Accepted')).toContain('bg-green-100 text-green-800')
      expect(wrapper.vm.getStatusBadgeClass('Declined')).toContain('bg-red-100 text-red-800')
      expect(wrapper.vm.getStatusBadgeClass('Expired')).toContain('bg-yellow-100 text-yellow-800')
    })
  })

  describe('Available Status Transitions', () => {
    beforeEach(async () => {
      quotationAPI.getQuotation.mockResolvedValue({ data: mockQuotation })
      wrapper = createWrapper()
      await nextTick()
    })

    it('should show correct available statuses for Draft', () => {
      wrapper.vm.quotation.status = 'Draft'
      const available = wrapper.vm.availableStatuses
      
      const statusValues = available.map(s => s.value)
      expect(statusValues).toContain('Draft') // Current status
      expect(statusValues).toContain('Sent')
      expect(statusValues).toContain('Expired')
      expect(statusValues).not.toContain('Accepted')
      expect(statusValues).not.toContain('Declined')
    })

    it('should show correct available statuses for Sent', () => {
      wrapper.vm.quotation.status = 'Sent'
      const available = wrapper.vm.availableStatuses
      
      const statusValues = available.map(s => s.value)
      expect(statusValues).toContain('Sent') // Current status
      expect(statusValues).toContain('Accepted')
      expect(statusValues).toContain('Declined')
      expect(statusValues).toContain('Expired')
      expect(statusValues).not.toContain('Draft')
    })

    it('should show no available statuses for final states', () => {
      wrapper.vm.quotation.status = 'Accepted'
      const available = wrapper.vm.availableStatuses
      
      expect(available).toHaveLength(0)
    })
  })

  describe('Error Handling', () => {
    it('should show retry button in error state', async () => {
      quotationAPI.getQuotation.mockRejectedValue(new Error('Network error'))
      wrapper = createWrapper()
      await nextTick()
      
      const retryButton = wrapper.find('[data-testid="retry-btn"]')
      expect(retryButton.exists()).toBe(true)
    })

    it('should retry loading when retry button is clicked', async () => {
      quotationAPI.getQuotation.mockRejectedValue(new Error('Network error'))
      wrapper = createWrapper()
      await nextTick()
      
      quotationAPI.getQuotation.mockResolvedValue({ data: mockQuotation })
      
      const retryButton = wrapper.find('[data-testid="retry-btn"]')
      await retryButton.trigger('click')
      
      expect(quotationAPI.getQuotation).toHaveBeenCalledTimes(2)
    })
  })

  describe('Accessibility', () => {
    beforeEach(async () => {
      quotationAPI.getQuotation.mockResolvedValue({ data: mockQuotation })
      wrapper = createWrapper()
      await nextTick()
    })

    it('should have proper ARIA labels for buttons', () => {
      const editButton = wrapper.find('[data-testid="edit-btn"]')
      const backButton = wrapper.find('[data-testid="back-btn"]')
      
      expect(editButton.exists()).toBe(true)
      expect(backButton.exists()).toBe(true)
    })

    it('should have proper table headers', () => {
      const table = wrapper.find('table')
      const headers = table.findAll('th')
      
      expect(headers).toHaveLength(4)
      expect(headers[0].text()).toBe('Description')
      expect(headers[1].text()).toBe('Quantity')
      expect(headers[2].text()).toBe('Unit Price')
      expect(headers[3].text()).toBe('Total')
    })

    it('should have clickable email and phone links', () => {
      const emailLink = wrapper.find('a[href^="mailto:"]')
      const phoneLink = wrapper.find('a[href^="tel:"]')
      
      expect(emailLink.exists()).toBe(true)
      expect(phoneLink.exists()).toBe(true)
      expect(emailLink.attributes('href')).toBe('mailto:john@test.com')
      expect(phoneLink.attributes('href')).toBe('tel:123-456-7890')
    })
  })

  describe('Loading States', () => {
    beforeEach(async () => {
      quotationAPI.getQuotation.mockResolvedValue({ data: mockQuotation })
      wrapper = createWrapper()
      await nextTick()
    })

    it('should show loading state for status updates', async () => {
      quotationAPI.updateQuotationStatus.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      wrapper.vm.updateStatus('Sent')
      expect(wrapper.vm.isUpdatingStatus).toBe(true)
    })

    it('should show loading state for PDF generation', async () => {
      wrapper.vm.generatePDF()
      expect(wrapper.vm.isGeneratingPDF).toBe(true)
    })

    it('should show loading state for email sending', async () => {
      wrapper.vm.emailQuotation()
      expect(wrapper.vm.isEmailingQuotation).toBe(true)
    })

    it('should show loading state for deletion', async () => {
      quotationAPI.deleteQuotation.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      wrapper.vm.deleteQuotation()
      expect(wrapper.vm.isDeletingQuotation).toBe(true)
    })
  })
})