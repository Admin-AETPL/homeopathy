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
      console.log('Search options:', options);
      
      // Fetch all medicines and filter client-side
      // This is more reliable than trying different search endpoints
      console.log('Fetching all medicines for client-side filtering...');
      const allResponse = await api.get('/api/medicines', {
        params: {
          limit: 200, // Get more medicines for better search results
          page: 1,
        },
      });
      
      console.log('All medicines response:', allResponse.data);
      
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
      
      console.log('Total medicines fetched:', allMedicines.length);
      
      // Filter medicines by name, common name, and sections (case insensitive)
      const lowerQuery = query.toLowerCase();
      const nameMatches = allMedicines.filter(med => {
        // Check if name property exists (from formatted data)
        if (med.name && med.name.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        
        // Check if commonName exists (from formatted data)
        if (med.commonName && med.commonName.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        
        // Check sections array (new format)
        if (Array.isArray(med.sections)) {
          return med.sections.some(section => {
            if (section.section_name && section.section_text) {
              return section.section_text.toLowerCase().includes(lowerQuery) ||
                     section.section_name.toLowerCase().includes(lowerQuery);
            }
            return false;
          });
        }
        
        // Check sections object (old format)
        if (med.sections && typeof med.sections === 'object') {
          return Object.values(med.sections).some(value => 
            value && typeof value === 'string' && value.toLowerCase().includes(lowerQuery)
          );
        }
        
        return false;
      });
      
      console.log('Filtered matches found:', nameMatches.length);
      
      // Format and return results
      const formattedData = nameMatches.map(formatMedicineData);
      return formattedData;
      
    } catch (error) {
      console.error('Error searching medicines:', error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
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
      
      // WORKAROUND: If backend getMedicineById doesn't return sections,
      // fetch from the list endpoint and find the medicine
      try {
        const response = await api.get(`/api/medicines/${id}`);
        console.log('API response for getMedicineById:', response);
        console.log('API response data:', response.data);
        
        // Check if we have the expected data structure
        let medicineData = null;
        
        if (response.data) {
          // Handle different response structures
          if (response.data.data && response.data.data.medicine) {
            console.log('Structure: data.data.medicine');
            medicineData = response.data.data.medicine;
          } else if (response.data.medicine) {
            console.log('Structure: data.medicine');
            medicineData = response.data.medicine;
          } else if (response.data.data && typeof response.data.data === 'object') {
            console.log('Structure: data.data (object)');
            medicineData = response.data.data;
          } else if (response.data.id && response.data.sections) {
            // Direct medicine object with id and sections
            console.log('Structure: direct medicine object with sections');
            medicineData = response.data;
          } else if (response.data.id) {
            // Medicine object without sections - need to fetch from list
            console.log('Structure: medicine without sections - will fetch from list');
            medicineData = null;
          } else {
            // Fallback - try to use response.data directly
            console.log('Structure: fallback to response.data');
            medicineData = response.data;
          }
        }
        
        // If medicineData has sections, use it
        if (medicineData && medicineData.sections && Array.isArray(medicineData.sections) && medicineData.sections.length > 0) {
          console.log('Medicine has sections, using it');
          const formatted = formatMedicineData(medicineData);
          console.log('Formatted medicine data:', formatted);
          return formatted;
        }
        
        // If no sections, fall through to workaround below
        console.warn('Medicine data has no sections, trying workaround...');
      } catch (singleError) {
        console.warn('Single medicine endpoint failed, trying workaround:', singleError.message);
      }
      
      // WORKAROUND: Fetch from list and find the medicine
      console.log('Fetching from list endpoint as workaround...');
      const listResponse = await api.get('/api/medicines', {
        params: { limit: 100, page: 1 }
      });
      
      console.log('List response:', listResponse.data);
      
      let medicines = [];
      if (Array.isArray(listResponse.data)) {
        medicines = listResponse.data;
      } else if (listResponse.data.medicines && Array.isArray(listResponse.data.medicines)) {
        medicines = listResponse.data.medicines;
      } else if (listResponse.data.data && Array.isArray(listResponse.data.data)) {
        medicines = listResponse.data.data;
      }
      
      console.log('Found medicines:', medicines.length);
      
      // Find the medicine by ID
      const medicine = medicines.find(m => m.id == id || m._id == id);
      
      if (!medicine) {
        throw new Error(`Medicine with ID ${id} not found`);
      }
      
      console.log('Found medicine in list:', medicine);
      
      const formatted = formatMedicineData(medicine);
      console.log('Formatted medicine data:', formatted);
      return formatted;
      
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
      url: '',
      sections: []
    };
  }
  
  // Helper function to extract section value from array format
  const getSectionFromArray = (sections, sectionName) => {
    if (Array.isArray(sections)) {
      const section = sections.find(s => s.section_name === sectionName);
      return section ? section.section_text : '';
    }
    return '';
  };
  
  // Handle NEW database structure with sections as ARRAY
  if (medicine.sections && Array.isArray(medicine.sections)) {
    // Check if medicine already has a 'name' field (from getMedicines endpoint)
    let medicineName = medicine.name || getSectionFromArray(medicine.sections, 'Remedy') || 'Unknown Medicine';
    const commonName = getSectionFromArray(medicine.sections, 'Common Name') || '';
    const description = getSectionFromArray(medicine.sections, 'General') || '';
    
    console.log(`Extracted from array - medicine: "${medicineName}", common: "${commonName}"`);
    
    return {
      id: medicine.id || medicine._id || Math.random().toString(36).substring(2),
      name: medicineName,
      commonName: commonName,
      description: description,
      url: medicine.url || '',
      sections: medicine.sections, // Keep array format for detail page
      originalData: medicine
    };
  }
  
  // If the medicine already has the expected format, return it as is but ensure all fields are present
  if (medicine.name && medicine.description) {
    return {
      ...medicine,
      id: medicine._id || medicine.id || Math.random().toString(36).substring(2),
      commonName: medicine.commonName || '',
      properties: medicine.properties || {},
      rawSections: medicine.rawSections || medicine.sections || {},
      sections: medicine.sections || []
    };
  }
  
  // Handle OLD structure with sections as OBJECT
  if (medicine._id && medicine.sections && typeof medicine.sections === 'object' && !Array.isArray(medicine.sections)) {
    const { sections } = medicine;
    
    // Extract common name and remedy name from sections object
    const commonName = sections['Common Name'] || '';
    const medicineName = sections.Remedy || 'Unknown Remedy';
    console.log(`Extracted from object - medicine: "${medicineName}", common: "${commonName}"`);
    
    return {
      id: medicine._id,
      name: medicineName,
      commonName: commonName,
      description: sections.General || '',
      url: medicine.url || '',
      rawSections: sections,
      sections: medicine.sections,
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
      url: medicine.url || '',
      rawSections: medicine.sections || {},
      sections: medicine.sections || [],
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
    // Validate and clean the ID outside the try block so it's available in catch
    if (!id) {
      throw new Error('Invalid patient ID: ID is empty');
    }
    
    // Clean the ID - remove any trailing slashes or whitespace
    const cleanId = id.trim();
    
    try {
      
      console.log(`Fetching patient with ID: ${cleanId}`);
      console.log(`API Base URL: ${import.meta.env.VITE_API_BASE_URL}`);
      console.log(`Full API URL: ${import.meta.env.VITE_API_BASE_URL}/api/patients/${cleanId}`);
      
      let response;
      
      // Try with /api prefix first
      try {
        response = await api.get(`/api/patients/${cleanId}`);
        console.log('GET request with /api prefix completed with status:', response.status);
      } catch (prefixError) {
        console.log('Error with /api prefix, trying without prefix:', prefixError.message);
        // Try without the /api prefix as fallback
        response = await api.get(`/patients/${cleanId}`);
        console.log('GET request without /api prefix completed with status:', response.status);
      }
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
      console.error(`Error fetching patient ${cleanId}:`, error);
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
        contact: patientData.contact || patientData.contactNumber || '',
        alternateContactNumber: patientData.alternateContactNumber || '',
        email: patientData.email || '',
        // Stringify the address object to prevent [object Object] issue
        address: JSON.stringify({
          street: patientData.address?.street || '',
          city: patientData.address?.city || '',
          state: patientData.address?.state || '',
          postalCode: patientData.address?.postalCode || '',
          country: patientData.address?.country || ''
        }),
        
        // Medical Information
        // Stringify arrays and objects to prevent [object Object] issue
        allergies: JSON.stringify(Array.isArray(patientData.allergies) ? patientData.allergies : []),
        chronicDiseases: JSON.stringify(Array.isArray(patientData.chronicDiseases) ? patientData.chronicDiseases : []),
        familyHistory: patientData.familyHistory || '',
        pastMedicalHistory: patientData.pastMedicalHistory || '',
        lifestyle: JSON.stringify({
          diet: patientData.lifestyle?.diet || '',
          exercise: patientData.lifestyle?.exercise || '',
          addictions: Array.isArray(patientData.lifestyle?.addictions) ? patientData.lifestyle.addictions : [],
          sleep: patientData.lifestyle?.sleep || ''
        }),
        
        // Administrative
        registrationDate: patientData.registrationDate || new Date().toISOString(),
        lastVisitDate: patientData.lastVisitDate || null,
        doctorNotes: patientData.doctorNotes || '',
        status: patientData.status || 'Active',
        
        // Custom fields for homeopathic practice
        constitutionalType: patientData.constitutionalType || '',
        miasmaticBackground: JSON.stringify(Array.isArray(patientData.miasmaticBackground) ? patientData.miasmaticBackground : []),
        mentals: JSON.stringify(Array.isArray(patientData.mentals) ? patientData.mentals : []),
        physicals: JSON.stringify(Array.isArray(patientData.physicals) ? patientData.physicals : []),
        modalities: JSON.stringify({
          better: Array.isArray(patientData.modalities?.better) ? patientData.modalities.better : [],
          worse: Array.isArray(patientData.modalities?.worse) ? patientData.modalities.worse : []
        }),
        
        // Visit information
        visits: JSON.stringify(Array.isArray(patientData.visits) ? patientData.visits : [])
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
        
        // Parse the existing visits JSON string, add the new visit, and stringify again
        let visitsArray = [];
        try {
          if (formattedData.visits) {
            visitsArray = JSON.parse(formattedData.visits);
          }
        } catch (e) {
          console.error('Error parsing visits JSON:', e);
        }
        
        visitsArray.push(firstVisit);
        formattedData.visits = JSON.stringify(visitsArray);
        
        // Update lastVisitDate to match the first visit date
        formattedData.lastVisitDate = firstVisit.date;
      }
      
      console.log('Formatted patient data (with stringified objects):', formattedData);
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
    // Validate the ID and clean it outside the try block so it's available in catch
    if (!id) {
      throw new Error('Invalid patient ID for update: ID is empty');
    }
    
    // Clean the ID - remove any trailing slashes or whitespace
    const cleanId = id.trim();
    
    try {
      console.log(`Updating patient with ID: ${cleanId}`);
      console.log(`Full API URL: ${import.meta.env.VITE_API_BASE_URL}/api/patients/${cleanId}`);
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
        contact: patientData.contact || patientData.contactNumber || '',
        alternateContactNumber: patientData.alternateContactNumber || '',
        email: patientData.email || '',
        // Stringify the address object to prevent [object Object] issue
        address: JSON.stringify({
          street: patientData.address?.street || '',
          city: patientData.address?.city || '',
          state: patientData.address?.state || '',
          postalCode: patientData.address?.postalCode || '',
          country: patientData.address?.country || ''
        }),
        
        // Medical Information
        // Stringify arrays and objects to prevent [object Object] issue
        allergies: JSON.stringify(Array.isArray(patientData.allergies) ? patientData.allergies : []),
        chronicDiseases: JSON.stringify(Array.isArray(patientData.chronicDiseases) ? patientData.chronicDiseases : []),
        familyHistory: patientData.familyHistory || '',
        pastMedicalHistory: patientData.pastMedicalHistory || '',
        lifestyle: JSON.stringify({
          diet: patientData.lifestyle?.diet || '',
          exercise: patientData.lifestyle?.exercise || '',
          addictions: Array.isArray(patientData.lifestyle?.addictions) ? patientData.lifestyle.addictions : [],
          sleep: patientData.lifestyle?.sleep || ''
        }),
        
        // Administrative
        status: patientData.status || 'Active',
        doctorNotes: patientData.doctorNotes || '',
        
        // Custom fields for homeopathic practice
        constitutionalType: patientData.constitutionalType || '',
        miasmaticBackground: JSON.stringify(Array.isArray(patientData.miasmaticBackground) ? patientData.miasmaticBackground : []),
        mentals: JSON.stringify(Array.isArray(patientData.mentals) ? patientData.mentals : []),
        physicals: JSON.stringify(Array.isArray(patientData.physicals) ? patientData.physicals : []),
        modalities: JSON.stringify({
          better: Array.isArray(patientData.modalities?.better) ? patientData.modalities.better : [],
          worse: Array.isArray(patientData.modalities?.worse) ? patientData.modalities.worse : []
        })
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
        formattedData.visits = JSON.stringify(patientData.visits);
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
        
        // Parse the existing visits JSON string, add the new visit, and stringify again
        let visitsArray = [];
        try {
          if (formattedData.visits) {
            visitsArray = JSON.parse(formattedData.visits);
          }
        } catch (e) {
          console.error('Error parsing visits JSON:', e);
        }
        
        visitsArray.push(firstVisit);
        formattedData.visits = JSON.stringify(visitsArray);
        
        // Update lastVisitDate to match the first visit date
        formattedData.lastVisitDate = firstVisit.date;
      }
      
      console.log('Formatted patient data for update:', formattedData);
      console.log(`API Base URL: ${import.meta.env.VITE_API_BASE_URL}`);
      console.log(`Making PUT request to: ${import.meta.env.VITE_API_BASE_URL}/api/patients/${cleanId}`);
      
      let response;
      
      // Try with /api prefix first
      try {
        response = await api.put(`/api/patients/${cleanId}`, formattedData);
        console.log('PUT request with /api prefix completed with status:', response.status);
      } catch (prefixError) {
        console.log('Error with /api prefix, trying without prefix:', prefixError.message);
        // Try without the /api prefix as fallback
        response = await api.put(`/patients/${cleanId}`, formattedData);
        console.log('PUT request without /api prefix completed with status:', response.status);
      }
      
      console.log('API response for updatePatient:', response);
      return response.data;
    } catch (error) {
      console.error(`Error updating patient ${cleanId}:`, error);
      
      // Log more details about the error
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        console.error('Request URL:', error.config?.url);
        console.error('Request method:', error.config?.method);
        console.error('Request data:', error.config?.data);
        
        // Try one more approach - if we're getting 404, try with a different API structure
        if (error.response.status === 404) {
          console.log('Got 404, trying direct endpoint without /api prefix...');
          try {
            const directResponse = await api.put(`/patients/${cleanId}`, formattedData);
            console.log('Direct endpoint worked!', directResponse);
            return directResponse.data;
          } catch (directError) {
            console.error('Direct endpoint also failed:', directError.message);
          }
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        console.error('Request URL:', error.config?.url);
        console.error('Request method:', error.config?.method);
        console.error('Request data:', error.config?.data);
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
    // Validate and clean the ID outside the try block so it's available in catch
    if (!id) {
      throw new Error('Invalid patient ID: ID is empty');
    }
    
    // Clean the ID - remove any trailing slashes or whitespace
    const cleanId = id.trim();
    
    try {
      const response = await api.delete(`/api/patients/${cleanId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting patient ${cleanId}:`, error);
      throw error;
    }
  },
};

// Appointment API functions
const appointmentApi = {
  /**
   * Get all appointments
   * @returns {Promise} Promise with appointments list
   */
  getAllAppointments: async () => {
    try {
      const response = await api.get('/api/appointments');
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  /**
   * Get appointments by patient ID
   * @param {string} patientId - Patient ID
   * @returns {Promise} Promise with patient's appointments
   */
  getAppointmentsByPatient: async (patientId) => {
    if (!patientId) {
      throw new Error('Invalid patient ID: ID is empty');
    }
    
    try {
      const response = await api.get(`/api/appointments/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointments for patient ${patientId}:`, error);
      throw error;
    }
  },

  /**
   * Get appointment by ID
   * @param {string} id - Appointment ID
   * @returns {Promise} Promise with appointment details
   */
  getAppointmentById: async (id) => {
    if (!id) {
      throw new Error('Invalid appointment ID: ID is empty');
    }
    
    const cleanId = id.trim();
    
    try {
      const response = await api.get(`/api/appointments/${cleanId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment ${cleanId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise} Promise with created appointment
   */
  createAppointment: async (appointmentData) => {
    try {
      console.log('Creating appointment with data:', appointmentData);
      const response = await api.post('/api/appointments', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  /**
   * Update an existing appointment
   * @param {string} id - Appointment ID
   * @param {Object} appointmentData - Updated appointment data
   * @returns {Promise} Promise with updated appointment
   */
  updateAppointment: async (id, appointmentData) => {
    if (!id) {
      throw new Error('Invalid appointment ID: ID is empty');
    }
    
    const cleanId = id.trim();
    
    try {
      const response = await api.put(`/api/appointments/${cleanId}`, appointmentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating appointment ${cleanId}:`, error);
      throw error;
    }
  },

  /**
   * Delete an appointment
   * @param {string} id - Appointment ID
   * @returns {Promise} Promise with deletion result
   */
  deleteAppointment: async (id) => {
    if (!id) {
      throw new Error('Invalid appointment ID: ID is empty');
    }
    
    const cleanId = id.trim();
    
    try {
      const response = await api.delete(`/api/appointments/${cleanId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting appointment ${cleanId}:`, error);
      throw error;
    }
  },

  /**
   * Get available time slots for a specific date
   * @param {string} date - Date in ISO format
   * @returns {Promise} Promise with available time slots
   */
  getAvailableTimeSlots: async (date) => {
    if (!date) {
      throw new Error('Invalid date: Date is empty');
    }
    
    try {
      const response = await api.get(`/api/appointments/available-slots?date=${date}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching available time slots for ${date}:`, error);
      throw error;
    }
  }
};

export { api as default, medicineApi, patientApi, appointmentApi };
