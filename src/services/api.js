import axios from 'axios';

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ,
  headers: {
    'Content-Type': 'application/json',
    // Add these headers to help with CORS issues
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
  },
  timeout: 15000, // 15 seconds timeout for slower network connections
  // Important for cross-origin requests
  withCredentials: false
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
  (response) => {
    // Log successful responses for debugging
    console.log(`API Success [${response.config.method.toUpperCase()}] ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response) {
      // Server responded with a status code outside of 2xx range
      console.error(`API Error [${error.config?.method?.toUpperCase()}] ${error.config?.url}:`, error.response.status);
      console.error('Error response data:', error.response.data);
      
      // Handle specific status codes
      if (error.response.status === 400) {
        console.error('Bad Request - Check your parameters:', error.config?.params);
      } else if (error.response.status === 401) {
        // Unauthorized - handle logout or token refresh
        console.error('Authentication error - you may need to log in');
      } else if (error.response.status === 404) {
        console.error('Resource not found - check your endpoint URL');
      } else if (error.response.status >= 500) {
        console.error('Server error - the backend service may be down');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error - no response received:', error.request);
      console.error('Request URL:', error.config?.url);
      console.error('Request method:', error.config?.method);
      console.error('Request params:', error.config?.params);
    } else {
      // Something happened in setting up the request
      console.error('Request Setup Error:', error.message);
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
      console.log('Searching medicines with query:', query);
      
      // First try the specific endpoint for searching by common name or medicine name
      try {
        // Use the correct endpoint format as shown in the example
        // http://192.168.18.83:3000/api/medicines/common-name?name=hemlock
        const response = await api.get('/api/medicines/common-name', {
          params: {
            name: query, // This is the required parameter name based on the example
            limit: options.limit || 20,
            page: options.page || 1,
            ...options.filters,
          },
        });
        
        console.log('Search endpoint response:', response.data);
        
        // Format the response data to match our frontend expectations
        let formattedData = [];
        
        if (Array.isArray(response.data)) {
          formattedData = response.data.map(formatMedicineData);
        } else if (response.data && response.data.medicines && Array.isArray(response.data.medicines)) {
          formattedData = response.data.medicines.map(formatMedicineData);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          formattedData = response.data.data.map(formatMedicineData);
        }
        
        // If we found results, return them
        if (formattedData.length > 0) {
          return formattedData;
        }
        
        // If no results, try searching by remedy name directly
        console.log('No results found with common-name search, trying remedy-name search');
        const remedyResponse = await api.get('/api/medicines/remedy-name', {
          params: {
            name: query,
            limit: options.limit || 20,
            page: options.page || 1,
          },
        });
        
        console.log('Remedy search endpoint response:', remedyResponse.data);
        
        // Format the remedy search response
        if (Array.isArray(remedyResponse.data)) {
          formattedData = remedyResponse.data.map(formatMedicineData);
        } else if (remedyResponse.data && remedyResponse.data.medicines && Array.isArray(remedyResponse.data.medicines)) {
          formattedData = remedyResponse.data.medicines.map(formatMedicineData);
        } else if (remedyResponse.data && remedyResponse.data.data && Array.isArray(remedyResponse.data.data)) {
          formattedData = remedyResponse.data.data.map(formatMedicineData);
        }
        
        // If still no results, try the general search endpoint
        if (formattedData.length === 0) {
          console.log('No results found with remedy-name search, trying general search');
          const generalResponse = await api.get('/api/medicines/search', {
            params: {
              q: query,
              limit: options.limit || 20,
              page: options.page || 1,
            },
          });
          
          console.log('General search endpoint response:', generalResponse.data);
          
          // Format the general search response
          if (Array.isArray(generalResponse.data)) {
            formattedData = generalResponse.data.map(formatMedicineData);
          } else if (generalResponse.data && generalResponse.data.medicines && Array.isArray(generalResponse.data.medicines)) {
            formattedData = generalResponse.data.medicines.map(formatMedicineData);
          } else if (generalResponse.data && generalResponse.data.data && Array.isArray(generalResponse.data.data)) {
            formattedData = generalResponse.data.data.map(formatMedicineData);
          }
        }
        
        // If still no results, try to manually filter from all medicines
        if (formattedData.length === 0) {
          console.log('No results found with API endpoints, trying manual filtering');
          const allResponse = await api.get('/api/medicines', {
            params: {
              limit: 100, // Get more medicines to increase chance of finding matches
              page: 1,
            },
          });
          
          let allMedicines = [];
          
          if (Array.isArray(allResponse.data)) {
            allMedicines = allResponse.data;
          } else if (allResponse.data && allResponse.data.medicines && Array.isArray(allResponse.data.medicines)) {
            allMedicines = allResponse.data.medicines;
          } else if (allResponse.data && allResponse.data.data && Array.isArray(allResponse.data.data.medicines)) {
            allMedicines = allResponse.data.data.medicines;
          } else if (allResponse.data && allResponse.data.data && Array.isArray(allResponse.data.data)) {
            allMedicines = allResponse.data.data;
          }
          
          console.log('Total medicines fetched for manual filtering:', allMedicines.length);
          
          // Filter medicines by name and common name (case insensitive)
          const lowerQuery = query.toLowerCase();
          const nameMatches = allMedicines.filter(med => {
            // Check if sections.Remedy exists and contains the query (medicine name)
            if (med.sections && med.sections.Remedy) {
              if (med.sections.Remedy.toLowerCase().includes(lowerQuery)) {
                return true;
              }
            }
            
            // Check if name property exists and contains the query
            if (med.name && med.name.toLowerCase().includes(lowerQuery)) {
              return true;
            }
            
            // Check if sections['Common Name'] exists and contains the query
            if (med.sections && med.sections['Common Name']) {
              if (med.sections['Common Name'].toLowerCase().includes(lowerQuery)) {
                return true;
              }
            }
            
            // Also check if commonName exists directly
            if (med.commonName && med.commonName.toLowerCase().includes(lowerQuery)) {
              return true;
            }
            
            return false;
          });
          
          console.log('Manual filtering matches found:', nameMatches.length);
          
          if (nameMatches.length > 0) {
            formattedData = nameMatches.map(formatMedicineData);
          }
        }
        
        return formattedData;
      } catch (searchError) {
        console.warn('Search endpoints failed, falling back to general endpoint:', searchError);
        
        // Fallback to the main medicines endpoint
        const response = await api.get('/api/medicines', {
          params: {
            q: query, // Use 'q' parameter as a fallback
            limit: options.limit || 20,
            page: options.page || 1,
          },
        });
        
        console.log('Main endpoint response:', response.data);
        
        // Format the response data to match our frontend expectations
        let formattedData = [];
        
        if (Array.isArray(response.data)) {
          formattedData = response.data.map(formatMedicineData);
        } else if (response.data && response.data.medicines && Array.isArray(response.data.medicines)) {
          formattedData = response.data.medicines.map(formatMedicineData);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          formattedData = response.data.data.map(formatMedicineData);
        }
        
        // If no results, try manual filtering
        if (formattedData.length === 0) {
          console.log('No results found with fallback, trying manual filtering');
          // Get all medicines and filter manually
          const allResponse = await api.get('/api/medicines', {
            params: {
              limit: 100, // Get more medicines to increase chance of finding matches
              page: 1,
            },
          });
          
          let allMedicines = [];
          
          if (Array.isArray(allResponse.data)) {
            allMedicines = allResponse.data;
          } else if (allResponse.data && allResponse.data.medicines && Array.isArray(allResponse.data.medicines)) {
            allMedicines = allResponse.data.medicines;
          } else if (allResponse.data && allResponse.data.data && Array.isArray(allResponse.data.data.medicines)) {
            allMedicines = allResponse.data.data.medicines;
          } else if (allResponse.data && allResponse.data.data && Array.isArray(allResponse.data.data)) {
            allMedicines = allResponse.data.data;
          }
          
          console.log('Total medicines fetched for manual filtering:', allMedicines.length);
          
          // Filter medicines by name and common name (case insensitive)
          const lowerQuery = query.toLowerCase();
          const nameMatches = allMedicines.filter(med => {
            // Check if sections.Remedy exists and contains the query (medicine name)
            if (med.sections && med.sections.Remedy) {
              if (med.sections.Remedy.toLowerCase().includes(lowerQuery)) {
                return true;
              }
            }
            
            // Check if name property exists and contains the query
            if (med.name && med.name.toLowerCase().includes(lowerQuery)) {
              return true;
            }
            
            // Check if sections['Common Name'] exists and contains the query
            if (med.sections && med.sections['Common Name']) {
              if (med.sections['Common Name'].toLowerCase().includes(lowerQuery)) {
                return true;
              }
            }
            
            // Also check if commonName exists directly
            if (med.commonName && med.commonName.toLowerCase().includes(lowerQuery)) {
              return true;
            }
            
            return false;
          });
          
          console.log('Manual filtering matches found:', nameMatches.length);
          
          if (nameMatches.length > 0) {
            formattedData = nameMatches.map(formatMedicineData);
          }
        }
        
        return formattedData;
      }
    } catch (error) {
      console.error('Error searching medicines:', error);
      
      // Log more details about the error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      
      throw error;
    }
  },

  /**
   * Get all medicines with pagination
   * @param {Object} options - Pagination options (page, limit)
   * @returns {Promise} Promise with all medicines
   */
  getAllMedicines: async (options = {}) => {
    try {
      console.log('Fetching all medicines with options:', options);
      const response = await api.get('/api/medicines', {
        params: {
          limit: options.limit || 50, // Get more medicines by default
          page: options.page || 1,
          sort: options.sort || 'name', // Sort by name by default
          ...options.filters,
        },
      });
      
      console.log('API response for getAllMedicines:', response.data);
      
      // Check if we have the expected data structure
      let medicinesData = [];
      
      if (response.data && Array.isArray(response.data)) {
        medicinesData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        medicinesData = response.data.data;
      } else if (response.data && response.data.data && response.data.data.medicines && Array.isArray(response.data.data.medicines)) {
        // Handle nested structure: data.data.medicines
        medicinesData = response.data.data.medicines;
      } else if (response.data && response.data.medicines && Array.isArray(response.data.medicines)) {
        medicinesData = response.data.medicines;
      }
      
      // If still no data found, log the exact structure to help debugging
      if (medicinesData.length === 0 && response.data) {
        console.log('Medicine data structure not recognized:', JSON.stringify(response.data, null, 2));
      }
      
      // Format the response data to match our frontend expectations
      const formattedData = medicinesData.map(formatMedicineData);
      
      // Add pagination metadata if available
      const result = {
        medicines: formattedData,
        pagination: response.data.pagination || {
          total: formattedData.length,
          page: options.page || 1,
          limit: options.limit || 50,
        }
      };
      
      return result;
    } catch (error) {
      console.error('Error fetching all medicines:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
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
      console.log(`Fetching medicine with ID: ${id}`);
      const response = await api.get(`/api/medicines/${id}`);
      console.log('API response for getMedicineById:', response.data);
      
      // Check if we have the expected data structure
      let medicineData = null;
      
      if (response.data) {
        if (response.data.data && response.data.data.medicine) {
          medicineData = response.data.data.medicine;
        } else if (response.data.medicine) {
          medicineData = response.data.medicine;
        } else {
          medicineData = response.data;
        }
      }
      
      // Format the medicine data to match our frontend expectations
      if (medicineData) {
        return formatMedicineData(medicineData);
      }
      
      throw new Error('Medicine not found or invalid data structure');
    } catch (error) {
      console.error(`Error fetching medicine ${id}:`, error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      throw error;
    }
  },
};

/**
 * Helper function to format medicine data from API to a consistent format
 * @param {Object} medicine - Raw medicine data from API
 * @returns {Object} Formatted medicine data
 */
const formatMedicineData = (medicine) => {
  console.log('Formatting medicine data:', medicine);
  
  // If medicine is null or undefined, return a placeholder
  if (!medicine) {
    return {
      id: Math.random().toString(36).substring(2),
      name: 'Unknown Medicine',
      commonName: '',
      description: 'No data available',
      properties: {},
      url: ''
    };
  }
  
  // If the medicine already has the expected format, return it as is but ensure all fields are present
  if (medicine.name && medicine.description) {
    return {
      ...medicine,
      id: medicine._id || medicine.id || Math.random().toString(36).substring(2),
      commonName: medicine.commonName || '',
      properties: medicine.properties || {},
      rawSections: medicine.rawSections || medicine.sections || {}
    };
  }
  
  // Handle the specific data structure from the database with sections (as shown in the image)
  if (medicine._id && medicine.sections) {
    const { sections } = medicine;
    
    // Extract common name and remedy name from sections
    const commonName = sections['Common Name'] || '';
    const medicineName = sections.Remedy || 'Unknown Remedy';
    console.log(`Extracted medicine name: "${medicineName}", common name: "${commonName}"`);
    
    return {
      id: medicine._id,
      name: medicineName,
      commonName: commonName,
      description: sections.General || '',
      // Keep the original URL for reference
      url: medicine.url || '',
      // Keep the original sections for reference - important for displaying all data
      rawSections: sections,
      // Keep the original object for reference
      originalData: medicine
    };
  }
  
  // Handle the response format shown in the image
  if (medicine._id && medicine.url && medicine.sections) {
    const { sections } = medicine;
    
    return {
      id: medicine._id,
      name: sections.Remedy || 'Unknown Medicine',
      commonName: sections['Common Name'] || '',
      description: sections.General || '',
      url: medicine.url || '',
      rawSections: sections,
      originalData: medicine
    };
  }
  
  // Handle the patient-like structure
  if (medicine._id && medicine.name) {
    // Check if there's a common name in a nested structure
    let commonName = medicine.commonName || '';
    let medicineName = medicine.name || '';
    
    // Try to extract common name from different possible locations
    if (!commonName && medicine.sections && medicine.sections['Common Name']) {
      commonName = medicine.sections['Common Name'];
    }
    
    // Try to extract medicine name from sections if available
    if (medicine.sections && medicine.sections.Remedy && (!medicineName || medicineName === 'Unknown')) {
      medicineName = medicine.sections.Remedy;
    }
    
    return {
      id: medicine._id,
      name: medicineName,
      commonName: commonName,
      description: medicine.description || '',
      // Add URL if available
      url: medicine.url || '',
      // Keep the original sections for reference
      rawSections: medicine.sections || {},
      // Keep the original object for reference
      originalData: medicine
    };
  }
  
  // Fallback for unknown format - preserve as much data as possible
  return {
    id: medicine._id || medicine.id || Math.random().toString(36).substring(2),
    name: medicine.name || medicine.title || medicine.remedy || medicine.sections?.Remedy || 'Unknown Medicine',
    commonName: medicine.commonName || medicine.sections?.['Common Name'] || '',
    description: medicine.description || medicine.general || medicine.sections?.General || '',
    url: medicine.url || '',
    rawSections: medicine.sections || {},
    originalData: medicine
  };
};

// Patient API functions
const patientApi = {
  /**
   * Get all patients
   * @param {Object} options - Additional options like pagination, filters
   * @returns {Promise} Promise with patients list
   */
  getAllPatients: async (options = {}) => {
    try {
      const response = await api.get('/api/patients', {
        params: {
          limit: options.limit || 20,
          page: options.page || 1,
          ...options.filters,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  /**
   * Get patient by ID
   * @param {string} id - Patient ID
   * @returns {Promise} Promise with patient details
   */
  getPatientById: async (id) => {
    try {
      console.log(`Fetching patient with ID: ${id}`);
      const response = await api.get(`/api/patients/${id}`);
      console.log('API response for getPatientById:', response);
      
      // Check if we have the expected data structure
      let patientData;
      if (response.data) {
        console.log('Patient data structure:', Object.keys(response.data));
        if (response.data.data && response.data.data.patient) {
          console.log('Found nested patient data structure');
          patientData = response.data.data.patient;
        } else {
          patientData = response.data;
        }
      } else {
        patientData = response;
      }
      
      // Process medical history fields
      if (patientData) {
        // Ensure medicalHistory object exists
        if (!patientData.medicalHistory) {
          patientData.medicalHistory = {};
        }
        
        // Map top-level fields to medicalHistory if they exist
        if (patientData.previousIllnesses && !patientData.medicalHistory.previousIllnesses) {
          patientData.medicalHistory.previousIllnesses = patientData.previousIllnesses;
          delete patientData.previousIllnesses;
        }
        
        if (patientData.surgeries && !patientData.medicalHistory.surgeries) {
          patientData.medicalHistory.surgeries = patientData.surgeries;
          delete patientData.surgeries;
        }
        
        if (patientData.chronicConditions && !patientData.medicalHistory.chronicConditions) {
          patientData.medicalHistory.chronicConditions = patientData.chronicConditions;
          delete patientData.chronicConditions;
        }
      }
      
      return patientData;
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add a new patient
   * @param {Object} patientData - Patient data
   * @returns {Promise} Promise with created patient
   */
  addPatient: async (patientData) => {
    try {
      console.log('Adding patient with data:', patientData);
      
      // Format the data to match the backend schema
      const formattedData = {
        // Personal Information
        name: patientData.name,
        dateOfBirth: patientData.dateOfBirth || null,
        age: parseInt(patientData.age) || 0,
        gender: patientData.gender,
        bloodGroup: patientData.bloodGroup || '',
        maritalStatus: patientData.maritalStatus || 'Single',
        occupation: patientData.occupation || '',
        
        // Contact Information
        contactNumber: patientData.contactNumber || '',
        alternateContactNumber: patientData.alternateContactNumber || '',
        email: patientData.email || '',
        address: {
          street: patientData.address?.street || '',
          city: patientData.address?.city || '',
          state: patientData.address?.state || '',
          postalCode: patientData.address?.postalCode || '',
          country: patientData.address?.country || ''
        },
        
        // Medical Information
        allergies: Array.isArray(patientData.allergies) ? patientData.allergies : [],
        chronicDiseases: Array.isArray(patientData.chronicDiseases) ? patientData.chronicDiseases : [],
        familyHistory: patientData.familyHistory || '',
        pastMedicalHistory: patientData.pastMedicalHistory || '',
        lifestyle: {
          diet: patientData.lifestyle?.diet || '',
          exercise: patientData.lifestyle?.exercise || '',
          addictions: Array.isArray(patientData.lifestyle?.addictions) ? patientData.lifestyle.addictions : [],
          sleep: patientData.lifestyle?.sleep || ''
        },
        
        // Administrative
        registrationDate: patientData.registrationDate || new Date().toISOString(),
        lastVisitDate: patientData.lastVisitDate || null,
        doctorNotes: patientData.doctorNotes || '',
        status: patientData.status || 'Active',
        
        // Custom fields for homeopathic practice
        constitutionalType: patientData.constitutionalType || '',
        miasmaticBackground: Array.isArray(patientData.miasmaticBackground) ? patientData.miasmaticBackground : [],
        mentals: Array.isArray(patientData.mentals) ? patientData.mentals : [],
        physicals: Array.isArray(patientData.physicals) ? patientData.physicals : [],
        modalities: {
          better: Array.isArray(patientData.modalities?.better) ? patientData.modalities.better : [],
          worse: Array.isArray(patientData.modalities?.worse) ? patientData.modalities.worse : []
        },
        
        // Visit information
        visits: Array.isArray(patientData.visits) ? patientData.visits : []
      };
      
      // Process first visit information into visits array if provided
      if (patientData.firstVisitChiefComplaint) {
        // Create a visit object based on the VisitSchema
        const firstVisit = {
          date: new Date().toISOString(),
          chiefComplaint: patientData.firstVisitChiefComplaint,
          symptoms: Array.isArray(patientData.firstVisitSymptoms) ? patientData.firstVisitSymptoms : [],
          diagnosis: patientData.firstVisitDiagnosis || '',
          notes: patientData.firstVisitNotes || '',
          prescriptions: []
        };
        
        // Add next-visit date if provided
        // if (patientData.firstVisitFollowUpDate) {
        //   firstVisit.followUpDate = patientData.firstVisitFollowUpDate;
        // }
        // Add next-visit date if provided
if (patientData.firstVisitFollowUpDate) {
  // Use nextVisitDate as the field name
  firstVisit.nextVisitDate = patientData.firstVisitFollowUpDate;
  // Keep followUpDate for backend compatibility
  firstVisit.followUpDate = patientData.firstVisitFollowUpDate;
}
        // Add prescription if medicine is provided
        if (patientData.firstVisitMedicine) {
          firstVisit.prescriptions.push({
            medicine: patientData.firstVisitMedicine,
            potency: patientData.firstVisitPotency || '',
            dosage: patientData.firstVisitDosage || '',
            frequency: patientData.firstVisitFrequency || '',
            duration: patientData.firstVisitDuration || '',
            instructions: patientData.firstVisitInstructions || ''
          });
        }
        
        // Add the visit to the visits array
        formattedData.visits.push(firstVisit);
        
        // Update lastVisitDate to match the first visit date
        formattedData.lastVisitDate = firstVisit.date;
      }
      
      console.log('Formatted patient data:', formattedData);
      const response = await api.post('/api/patients', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error adding patient:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      throw error;
    }
  },

  /**
   * Update an existing patient
   * @param {string} id - Patient ID
   * @param {Object} patientData - Updated patient data
   * @returns {Promise} Promise with updated patient
   */
  updatePatient: async (id, patientData) => {
    try {
      console.log(`Updating patient with ID: ${id}`);
      console.log('Patient data being sent:', patientData);
      
      // Format the data to match the backend schema
      const formattedData = {
        // Personal Information
        name: patientData.name,
        dateOfBirth: patientData.dateOfBirth || null,
        age: parseInt(patientData.age) || 0,
        gender: patientData.gender,
        bloodGroup: patientData.bloodGroup || '',
        maritalStatus: patientData.maritalStatus || 'Single',
        occupation: patientData.occupation || '',
        
        // Contact Information
        contactNumber: patientData.contactNumber || '',
        alternateContactNumber: patientData.alternateContactNumber || '',
        email: patientData.email || '',
        address: {
          street: patientData.address?.street || '',
          city: patientData.address?.city || '',
          state: patientData.address?.state || '',
          postalCode: patientData.address?.postalCode || '',
          country: patientData.address?.country || ''
        },
        
        // Medical Information
        allergies: Array.isArray(patientData.allergies) ? patientData.allergies : [],
        chronicDiseases: Array.isArray(patientData.chronicDiseases) ? patientData.chronicDiseases : [],
        familyHistory: patientData.familyHistory || '',
        pastMedicalHistory: patientData.pastMedicalHistory || '',
        lifestyle: {
          diet: patientData.lifestyle?.diet || '',
          exercise: patientData.lifestyle?.exercise || '',
          addictions: Array.isArray(patientData.lifestyle?.addictions) ? patientData.lifestyle.addictions : [],
          sleep: patientData.lifestyle?.sleep || ''
        },
        
        // Administrative
        status: patientData.status || 'Active',
        doctorNotes: patientData.doctorNotes || '',
        
        // Custom fields for homeopathic practice
        constitutionalType: patientData.constitutionalType || '',
        miasmaticBackground: Array.isArray(patientData.miasmaticBackground) ? patientData.miasmaticBackground : [],
        mentals: Array.isArray(patientData.mentals) ? patientData.mentals : [],
        physicals: Array.isArray(patientData.physicals) ? patientData.physicals : [],
        modalities: {
          better: Array.isArray(patientData.modalities?.better) ? patientData.modalities.better : [],
          worse: Array.isArray(patientData.modalities?.worse) ? patientData.modalities.worse : []
        }
      };
      
      // Preserve dates if they exist
      if (patientData.registrationDate) {
        formattedData.registrationDate = patientData.registrationDate;
      }
      
      if (patientData.lastVisitDate) {
        formattedData.lastVisitDate = patientData.lastVisitDate;
      }
      
      // Preserve visits if they exist
      if (Array.isArray(patientData.visits)) {
        formattedData.visits = patientData.visits;
      }
      
      // Process first visit information into visits array if provided
      if (patientData.firstVisitChiefComplaint) {
        // Create a visit object based on the VisitSchema
        const firstVisit = {
          date: new Date().toISOString(),
          chiefComplaint: patientData.firstVisitChiefComplaint,
          symptoms: Array.isArray(patientData.firstVisitSymptoms) ? patientData.firstVisitSymptoms : [],
          diagnosis: patientData.firstVisitDiagnosis || '',
          notes: patientData.firstVisitNotes || '',
          prescriptions: []
        };
        
        // // Add next-visit date if provided
        // if (patientData.firstVisitFollowUpDate) {
        //   firstVisit.followUpDate = patientData.firstVisitFollowUpDate;
        // }

        // Add next-visit date if provided
if (patientData.firstVisitFollowUpDate) {
  // Use nextVisitDate as the field name
  firstVisit.nextVisitDate = patientData.firstVisitFollowUpDate;
  // Keep followUpDate for backend compatibility
  firstVisit.followUpDate = patientData.firstVisitFollowUpDate;
}
        
        // Add prescription if medicine is provided
        if (patientData.firstVisitMedicine) {
          firstVisit.prescriptions.push({
            medicine: patientData.firstVisitMedicine,
            potency: patientData.firstVisitPotency || '',
            dosage: patientData.firstVisitDosage || '',
            frequency: patientData.firstVisitFrequency || '',
            duration: patientData.firstVisitDuration || '',
            instructions: patientData.firstVisitInstructions || ''
          });
        }
        
        // Add the visit to the visits array
        formattedData.visits.push(firstVisit);
        
        // Update lastVisitDate to match the first visit date
        formattedData.lastVisitDate = firstVisit.date;
      }
      
      console.log('Formatted patient data for update:', formattedData);
      const response = await api.put(`/api/patients/${id}`, formattedData);
      console.log('API response for updatePatient:', response);
      
      return response.data;
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      
      throw error;
    }
  },

  /**
   * Delete a patient
   * @param {string} id - Patient ID
   * @returns {Promise} Promise with deletion result
   */
  deletePatient: async (id) => {
    try {
      const response = await api.delete(`/api/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting patient ${id}:`, error);
      throw error;
    }
  },
};

export { api as default, medicineApi, patientApi };
