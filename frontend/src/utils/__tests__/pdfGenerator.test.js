import { describe, it, expect, vi, beforeEach } from 'vitest'
import pdfGenerator from '../pdfGenerator'

// Mock jsPDF
vi.mock('jspdf', () => {
  const mockAutoTable = vi.fn()
  const mockJsPDF = vi.fn(() => ({
    setProperties: vi.fn(),
    setFillColor: vi.fn(),
    rect: vi.fn(),
    setTextColor: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    text: vi.fn(),
    roundedRect: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    autoTable: mockAutoTable,
    lastAutoTable: { finalY: 100 },
    internal: {
      pageSize: { height: 297 },
      getNumberOfPages: () => 1
    },
    save: vi.fn()
  }))
  
  mockJsPDF.mockAutoTable = mockAutoTable
  return { default: mockJsPDF }
})

vi.mock('jspdf-autotable', () => ({}))

const mockQuotation = {
  id: 1,
  quotation_date: '2024-01-15',
  status: 'Draft',
  total_amount: 1050.00,
  created_at: '2024-01-15T10:00:00Z',
  customer: {
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

describe('PDFGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('generateQuotationPDF', () => {
    it('should generate PDF successfully with valid quotation data', () => {
      expect(() => {
        pdfGenerator.generateQuotationPDF(mockQuotation)
      }).not.toThrow()
    })

    it('should handle missing customer data gracefully', () => {
      const quotationWithoutCustomer = {
        ...mockQuotation,
        customer: {
          name: null,
          contact_person: null,
          email: null,
          phone: null,
          address: null
        }
      }

      expect(() => {
        pdfGenerator.generateQuotationPDF(quotationWithoutCustomer)
      }).not.toThrow()
    })

    it('should handle empty items array', () => {
      const quotationWithoutItems = {
        ...mockQuotation,
        items: []
      }

      expect(() => {
        pdfGenerator.generateQuotationPDF(quotationWithoutItems)
      }).not.toThrow()
    })

    it('should throw error when PDF generation fails', () => {
      // Mock jsPDF to throw an error
      const originalConsoleError = console.error
      console.error = vi.fn()

      // Create a quotation that would cause issues
      const invalidQuotation = null

      expect(() => {
        pdfGenerator.generateQuotationPDF(invalidQuotation)
      }).toThrow('Failed to generate PDF. Please try again.')

      console.error = originalConsoleError
    })
  })

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(pdfGenerator.formatCurrency(1234.56)).toBe('1,234.56')
      expect(pdfGenerator.formatCurrency(0)).toBe('0.00')
      expect(pdfGenerator.formatCurrency(1000000)).toBe('1,000,000.00')
    })

    it('should handle null and undefined values', () => {
      expect(pdfGenerator.formatCurrency(null)).toBe('0.00')
      expect(pdfGenerator.formatCurrency(undefined)).toBe('0.00')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers correctly', () => {
      expect(pdfGenerator.formatNumber(5.5)).toBe('5.50')
      expect(pdfGenerator.formatNumber(10)).toBe('10.00')
    })

    it('should handle null and undefined values', () => {
      expect(pdfGenerator.formatNumber(null)).toBe('0.00')
      expect(pdfGenerator.formatNumber(undefined)).toBe('0.00')
    })
  })

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const formatted = pdfGenerator.formatDate('2024-01-15')
      expect(formatted).toBe('January 15, 2024')
    })

    it('should handle different date formats', () => {
      const formatted = pdfGenerator.formatDate('2024-12-25')
      expect(formatted).toBe('December 25, 2024')
    })
  })

  describe('formatDateTime', () => {
    it('should format datetime correctly', () => {
      const formatted = pdfGenerator.formatDateTime('2024-01-15T10:30:00Z')
      expect(formatted).toContain('Jan 15, 2024')
      expect(formatted).toContain('10:30')
    })
  })

  describe('getStatusColor', () => {
    it('should return correct colors for different statuses', () => {
      const draftColor = pdfGenerator.getStatusColor('Draft')
      expect(draftColor).toHaveProperty('bg')
      expect(draftColor).toHaveProperty('text')

      const sentColor = pdfGenerator.getStatusColor('Sent')
      expect(sentColor).toHaveProperty('bg')
      expect(sentColor).toHaveProperty('text')

      const acceptedColor = pdfGenerator.getStatusColor('Accepted')
      expect(acceptedColor).toHaveProperty('bg')
      expect(acceptedColor).toHaveProperty('text')
    })

    it('should return default color for unknown status', () => {
      const unknownColor = pdfGenerator.getStatusColor('Unknown')
      const defaultColor = pdfGenerator.getStatusColor('Draft')
      expect(unknownColor).toEqual(defaultColor)
    })
  })

  describe('calculateValidUntil', () => {
    it('should calculate validity period correctly', () => {
      const validUntil = pdfGenerator.calculateValidUntil('2024-01-15')
      expect(validUntil).toBe('February 14, 2024') // 30 days later
    })

    it('should handle different starting dates', () => {
      const validUntil = pdfGenerator.calculateValidUntil('2024-12-01')
      expect(validUntil).toBe('December 31, 2024')
    })
  })

  describe('PDF structure validation', () => {
    it('should call all required PDF methods', () => {
      const jsPDF = require('jspdf').default
      const mockDoc = new jsPDF()
      
      // Reset mocks to track calls
      vi.clearAllMocks()
      
      pdfGenerator.generateQuotationPDF(mockQuotation)
      
      // Verify PDF creation methods were called
      expect(mockDoc.setProperties).toHaveBeenCalled()
      expect(mockDoc.setFont).toHaveBeenCalled()
      expect(mockDoc.setFontSize).toHaveBeenCalled()
      expect(mockDoc.text).toHaveBeenCalled()
      expect(mockDoc.save).toHaveBeenCalled()
    })

    it('should generate correct filename', () => {
      const jsPDF = require('jspdf').default
      const mockDoc = new jsPDF()
      
      pdfGenerator.generateQuotationPDF(mockQuotation)
      
      expect(mockDoc.save).toHaveBeenCalledWith(
        expect.stringMatching(/^Quotation_1_January_15,_2024\.pdf$/)
      )
    })
  })

  describe('Error handling', () => {
    it('should handle PDF save errors gracefully', () => {
      const jsPDF = require('jspdf').default
      const mockDoc = new jsPDF()
      mockDoc.save.mockImplementation(() => {
        throw new Error('Save failed')
      })

      expect(() => {
        pdfGenerator.generateQuotationPDF(mockQuotation)
      }).toThrow('Failed to generate PDF. Please try again.')
    })
  })

  describe('Japanese locale formatting', () => {
    it('should use Japanese number formatting', () => {
      // Test that our formatter uses Japanese locale conventions
      const largeCurrency = pdfGenerator.formatCurrency(1234567.89)
      expect(largeCurrency).toBe('1,234,567.89')
    })

    it('should handle decimal precision correctly', () => {
      const precise = pdfGenerator.formatCurrency(100.1)
      expect(precise).toBe('100.10')
    })
  })
})