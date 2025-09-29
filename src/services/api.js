import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for authentication if needed
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error('API Error:', error.response.status, error.response.data);
      
      // Handle specific status codes
      if (error.response.status === 401) {
        // Unauthorized - handle logout or token refresh
        console.log('Authentication error');
        // You might want to redirect to login or refresh token
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Medicine API functions
const medicineApi = {
  /**
   * Search for medicines based on query
   * @param {string} query - Search query string
   * @param {Object} options - Additional options like pagination, filters
   * @returns {Promise} Promise with search results
   */
  searchMedicines: async (query, options = {}) => {
    try {
      const response = await api.get('/api/medicines/search', {
        params: {
          q: query,
          limit: options.limit || 20,
          page: options.page || 1,
          ...options.filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching medicines:', error);
      throw error;
    }
  },

  /**
   * Get medicine details by ID
   * @param {string} id - Medicine ID
   * @returns {Promise} Promise with medicine details
   */
  getMedicineById: async (id) => {
    try {
      const response = await api.get(`/api/medicines/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching medicine ${id}:`, error);
      throw error;
    }
  },
};

export { api as default, medicineApi };
