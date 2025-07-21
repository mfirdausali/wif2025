import axios from 'axios'

/**
 * Central API client for the WIF Japan ERP system
 * Provides consistent configuration and token management
 * following the principle of Muda (無駄) reduction - eliminating waste through automation
 */

// Create the main Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: false, // Disable for development without auth
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

/**
 * Token management utilities
 * Implements clean separation of concerns for authentication
 */
const tokenManager = {
  get() {
    return localStorage.getItem('auth_token')
  },
  
  set(token) {
    localStorage.setItem('auth_token', token)
  },
  
  remove() {
    localStorage.removeItem('auth_token')
  },
  
  exists() {
    return !!this.get()
  }
}

/**
 * Request interceptor
 * Automatically attaches Bearer token to all requests
 * Ensures consistent security implementation across the application
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.get()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor
 * Handles common error scenarios and token cleanup
 * Provides consistent error handling following Japanese quality principles
 */
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      tokenManager.remove()
      // Could emit an event here for global authentication handling
      window.location.href = '/login'
    }
    
    // Handle validation errors (422) - preserve original structure for components
    if (error.response?.status === 422) {
      return Promise.reject(error)
    }
    
    // Handle other errors with consistent structure
    const errorMessage = error.response?.data?.message || 'An unexpected error occurred'
    return Promise.reject({
      ...error,
      message: errorMessage
    })
  }
)

/**
 * Customer API endpoints
 * Provides clean, consistent interface for customer operations
 */
export const customerAPI = {
  /**
   * Fetch paginated list of customers
   * @param {Object} params - Query parameters (page, per_page, etc.)
   * @returns {Promise} Response with customer data
   */
  async getCustomers(params = {}) {
    const response = await apiClient.get('/customers', { params })
    return response.data
  },

  /**
   * Create a new customer
   * @param {Object} customerData - Customer information
   * @returns {Promise} Response with created customer
   */
  async createCustomer(customerData) {
    const response = await apiClient.post('/customers', customerData)
    return response.data
  },

  /**
   * Get a specific customer by ID
   * @param {number} id - Customer ID
   * @returns {Promise} Response with customer data
   */
  async getCustomer(id) {
    const response = await apiClient.get(`/customers/${id}`)
    return response.data
  },

  /**
   * Update an existing customer
   * @param {number} id - Customer ID
   * @param {Object} customerData - Updated customer information
   * @returns {Promise} Response with updated customer
   */
  async updateCustomer(id, customerData) {
    const response = await apiClient.put(`/customers/${id}`, customerData)
    return response.data
  },

  /**
   * Delete a customer
   * @param {number} id - Customer ID
   * @returns {Promise} Response confirmation
   */
  async deleteCustomer(id) {
    const response = await apiClient.delete(`/customers/${id}`)
    return response.data
  }
}

/**
 * Quotation API endpoints
 * Provides clean, consistent interface for quotation operations
 */
export const quotationAPI = {
  /**
   * Fetch paginated list of quotations
   * @param {Object} params - Query parameters (page, status, customer_id, etc.)
   * @returns {Promise} Response with quotation data
   */
  async getQuotations(params = {}) {
    const response = await apiClient.get('/quotations', { params })
    return response.data
  },

  /**
   * Create a new quotation
   * @param {Object} quotationData - Quotation information including items
   * @returns {Promise} Response with created quotation
   */
  async createQuotation(quotationData) {
    const response = await apiClient.post('/quotations', quotationData)
    return response.data
  },

  /**
   * Get a specific quotation by ID
   * @param {number} id - Quotation ID
   * @returns {Promise} Response with quotation data including relationships
   */
  async getQuotation(id) {
    const response = await apiClient.get(`/quotations/${id}`)
    return response.data
  },

  /**
   * Update an existing quotation
   * @param {number} id - Quotation ID
   * @param {Object} quotationData - Updated quotation information
   * @returns {Promise} Response with updated quotation
   */
  async updateQuotation(id, quotationData) {
    const response = await apiClient.put(`/quotations/${id}`, quotationData)
    return response.data
  },

  /**
   * Update quotation status
   * @param {number} id - Quotation ID
   * @param {string} status - New status value
   * @returns {Promise} Response with updated quotation
   */
  async updateQuotationStatus(id, status) {
    const response = await apiClient.post(`/quotations/${id}/status`, { status })
    return response.data
  },

  /**
   * Delete a quotation (soft delete)
   * @param {number} id - Quotation ID
   * @returns {Promise} Response confirmation
   */
  async deleteQuotation(id) {
    const response = await apiClient.delete(`/quotations/${id}`)
    return response.data
  }
}

// Export token manager for authentication components
export { tokenManager }

// Export the configured client for custom requests
export default apiClient