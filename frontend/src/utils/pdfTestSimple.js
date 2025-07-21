import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Simple PDF test to verify jsPDF functionality
 */
export function testSimplePDF() {
  try {
    const doc = new jsPDF('p', 'mm', 'a4')
    
    // Test basic text
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.text('Hello World', 20, 20)
    
    // Test fill color with RGB array
    doc.setFillColor(79, 70, 229)
    doc.rect(20, 30, 50, 10, 'F')
    
    // Test white text on colored background
    doc.setTextColor(255, 255, 255)
    doc.text('White Text', 25, 37)
    
    // Save the PDF
    doc.save('test-simple.pdf')
    
    return true
  } catch (error) {
    console.error('Simple PDF test failed:', error)
    return false
  }
}

// Export for testing
export default testSimplePDF