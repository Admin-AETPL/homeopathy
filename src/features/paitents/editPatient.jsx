import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientApi } from '../../services/api';

const EditPatientForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Patient form state - match structure with AddPatient
  const [formData, setFormData] = useState({
    // Personal Information
    name: '', // Required by backend
    dateOfBirth: '',
    age: '',
    gender: 'Male', // Valid enum values: Male, Female, Other (capitalized)
    bloodGroup: '',
    maritalStatus: 'Single', // Enum: 'Single', 'Married', 'Divorced', 'Widowed', 'Other'
    occupation: '',
    
    // Contact Information
    contactNumber: '',
    alternateContactNumber: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    
    // Medical Information
    allergies: [], // Array of strings
    chronicDiseases: [], // Array of strings
    familyHistory: '',
    pastMedicalHistory: '',
    symptoms: '', // Current symptoms
    medications: '', // Current medications
    medicalHistory: {
      previousIllnesses: '',
      surgeries: '',
      chronicConditions: ''
    },
    lifestyle: {
      diet: '',
      exercise: '',
      addictions: [],
      sleep: ''
    },
    
    // Administrative
    registrationDate: '',
    lastVisitDate: '',
    doctorNotes: '',
    status: 'Active', // Enum: 'Active', 'Inactive', 'Archived'
    
    // Custom fields for homeopathic practice
    constitutionalType: '',
    miasmaticBackground: [],
    mentals: [], // Mental symptoms and characteristics
    physicals: [], // Physical symptoms and characteristics
    modalities: {
      better: [],
      worse: []
    },
    
    // Treatment information
    treatment: {
      remedy: '',
      potency: '',
      frequency: '',
      duration: '',
      instructions: ''
    },
    
    // Consultation information is handled by firstVisitNotes and firstVisitFollowUpDate
    
    // Visit information (for first visit)
    visits: [],
    
    // First visit fields (will be processed into visits array)
    firstVisitChiefComplaint: '',
    firstVisitSymptoms: [],
    firstVisitDiagnosis: '',
    firstVisitMedicine: '',
    firstVisitPotency: '',
    firstVisitDosage: '',
    firstVisitFrequency: '',
    firstVisitDuration: '',
    firstVisitInstructions: '',
    firstVisitFollowUpDate: '',
    firstVisitNotes: ''
  });

  // Form submission state
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Debug: Log form data changes
  useEffect(() => {
    console.log('Current form data state:', formData);
  }, [formData]);

  // Fetch patient data on component mount
  useEffect(() => {
    const fetchPatientData = async () => {
      setFetchLoading(true);
      setError(null);
      
      try {
        // Fetch patient data using the API service
        console.log(`Fetching patient with ID: ${id}`);
        const patientData = await patientApi.getPatientById(id);
        console.log('Patient data received:', patientData);
        
        if (!patientData || typeof patientData !== 'object') {
          throw new Error('Invalid patient data received');
        }
        
        // Format date fields if they exist
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          } catch (e) {
            console.error('Error formatting date:', e);
            return '';
          }
        };
        
        // Create the form data object with all fields mapped from patient data - match AddPatient structure
        const mappedFormData = {
          // Personal Information
          name: patientData.name || '',
          dateOfBirth: formatDateForInput(patientData.dateOfBirth),
          age: patientData.age?.toString() || '',
          gender: patientData.gender || 'Male',
          bloodGroup: patientData.bloodGroup || '',
          maritalStatus: patientData.maritalStatus || 'Single',
          occupation: patientData.occupation || '',
          
          // Contact Information
          contactNumber: patientData.contactNumber || patientData.phone || '',
          alternateContactNumber: patientData.alternateContactNumber || '',
          email: patientData.email || '',
          address: {
            street: patientData.address?.street || '',
            city: patientData.address?.city || '',
            state: patientData.address?.state || '',
            postalCode: patientData.address?.postalCode || patientData.address?.zipCode || '',
            country: patientData.address?.country || ''
          },
          
          // Medical Information
          allergies: patientData.allergies || [],
          chronicDiseases: patientData.chronicDiseases || [],
          familyHistory: patientData.familyHistory || '',
          pastMedicalHistory: patientData.pastMedicalHistory || '',
          symptoms: patientData.symptoms || '',
          medications: patientData.medications || '',
          medicalHistory: {
            previousIllnesses: patientData.medicalHistory?.previousIllnesses || '',
            surgeries: patientData.medicalHistory?.surgeries || '',
            chronicConditions: patientData.medicalHistory?.chronicConditions || ''
          },
          lifestyle: {
            diet: patientData.lifestyle?.diet || '',
            exercise: patientData.lifestyle?.exercise || '',
            addictions: Array.isArray(patientData.lifestyle?.addictions) ? patientData.lifestyle.addictions : [],
            sleep: patientData.lifestyle?.sleep || ''
          },
          
          // Administrative
          registrationDate: formatDateForInput(patientData.registrationDate),
          lastVisitDate: formatDateForInput(patientData.lastVisitDate),
          doctorNotes: patientData.doctorNotes || '',
          status: patientData.status || 'Active',
          
          // Custom fields for homeopathic practice
          constitutionalType: patientData.constitutionalType || '',
          miasmaticBackground: patientData.miasmaticBackground || [],
          mentals: patientData.mentals || [],
          physicals: patientData.physicals || [],
          modalities: {
            better: Array.isArray(patientData.modalities?.better) ? patientData.modalities.better : [],
            worse: Array.isArray(patientData.modalities?.worse) ? patientData.modalities.worse : []
          },
          
          // Treatment information
          treatment: {
            remedy: patientData.treatment?.remedy || '',
            potency: patientData.treatment?.potency || '',
            frequency: patientData.treatment?.frequency || '',
            duration: patientData.treatment?.duration || '',
            instructions: patientData.treatment?.instructions || ''
          },
          
          // Consultation information is handled by firstVisitNotes and firstVisitFollowUpDate
          
          // Visit information
          visits: patientData.visits || [],
          
          // First visit fields (from most recent visit if available)
          firstVisitChiefComplaint: patientData.visits && patientData.visits.length > 0 ? patientData.visits[0].chiefComplaint || '' : '',
          firstVisitSymptoms: patientData.visits && patientData.visits.length > 0 ? patientData.visits[0].symptoms || [] : [],
          firstVisitDiagnosis: patientData.visits && patientData.visits.length > 0 ? patientData.visits[0].diagnosis || '' : '',
          firstVisitMedicine: patientData.visits && patientData.visits.length > 0 && patientData.visits[0].prescriptions && patientData.visits[0].prescriptions.length > 0 ? 
                             patientData.visits[0].prescriptions[0].medicine || '' : '',
          firstVisitPotency: patientData.visits && patientData.visits.length > 0 && patientData.visits[0].prescriptions && patientData.visits[0].prescriptions.length > 0 ? 
                           patientData.visits[0].prescriptions[0].potency || '' : '',
          firstVisitDosage: patientData.visits && patientData.visits.length > 0 && patientData.visits[0].prescriptions && patientData.visits[0].prescriptions.length > 0 ? 
                          patientData.visits[0].prescriptions[0].dosage || '' : '',
          firstVisitFrequency: patientData.visits && patientData.visits.length > 0 && patientData.visits[0].prescriptions && patientData.visits[0].prescriptions.length > 0 ? 
                             patientData.visits[0].prescriptions[0].frequency || '' : '',
          firstVisitDuration: patientData.visits && patientData.visits.length > 0 && patientData.visits[0].prescriptions && patientData.visits[0].prescriptions.length > 0 ? 
                            patientData.visits[0].prescriptions[0].duration || '' : '',
          firstVisitInstructions: patientData.visits && patientData.visits.length > 0 && patientData.visits[0].prescriptions && patientData.visits[0].prescriptions.length > 0 ? 
                                patientData.visits[0].prescriptions[0].instructions || '' : '',
          firstVisitFollowUpDate: patientData.visits && patientData.visits.length > 0 ? formatDateForInput(patientData.visits[0].followUpDate || patientData.visits[0].nextVisitDate || patientData.nextVisitDate || patientData.nextAppointment) : '',
          firstVisitNotes: patientData.visits && patientData.visits.length > 0 ? patientData.visits[0].notes || patientData.notes || '' : patientData.notes || ''
        };
        
        // Debug: Log the mapped form data
        console.log('Mapped form data:', mappedFormData);
        
        // Set the form data
        setFormData(mappedFormData);
      } catch (err) {
        console.error('Error fetching patient data:', err);
        
        // Provide detailed error message
        let errorMessage = 'Failed to fetch patient data. Please try again.';
        
        if (err.response) {
          errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
        } else if (err.request) {
          errorMessage = 'Network error - no response received from server';
        } else {
          errorMessage = err.message || 'Unknown error occurred';
        }
        
        setError(errorMessage);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects in state
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // We'll use the same handleChange function for all fields to match AddPatient

  // Handle array fields (comma-separated values to array)
  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    const arrayValues = value.split(',').map(item => item.trim()).filter(item => item !== '');
    
    setFormData({
      ...formData,
      [name]: arrayValues
    });
  };

  // Handle nested array fields (for modalities)
  const handleNestedArrayChange = (e) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    const arrayValues = value.split(',').map(item => item.trim()).filter(item => item !== '');
    
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [child]: arrayValues
      }
    });
  };

  // Handle form submission - simplified to match AddPatient approach
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Submit the form data directly - just like in AddPatient
      console.log('Submitting patient data:', formData);
      const response = await patientApi.updatePatient(id, formData);
      console.log('Patient updated successfully:', response);
      setSuccess(true);
      
      // Navigate back to dashboard after short delay
      setTimeout(() => {
        navigate('/patients');
      }, 2000);
    } catch (err) {
      console.error('Error updating patient:', err);
      
      // Provide detailed error message
      let errorMessage = 'Failed to update patient. Please try again.';
      
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Network error - no response received from server';
      } else {
        errorMessage = err.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-patient-container max-w-4xl mx-auto my-8 px-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/patients')}
          className="mr-4 bg-[#568F87] hover:bg-[#3E6A64] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Patients
        </button>
        <h2 className="text-2xl font-bold text-[#568F87]">Edit Patient</h2>
      </div>

      {/* Loading state for initial data fetch */}
      {fetchLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#90D1CA]"></div>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">Patient updated successfully!</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!fetchLoading && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  required
                />
              </div>

              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age*
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  required
                  min="0"
                  max="120"
                />
              </div>
              
              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                />
              </div>
              
              {/* Blood Group */}
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender*
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Marital Status */}
              <div>
                <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status
                </label>
                <select
                  id="maritalStatus"
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              {/* Occupation */}
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </label>
                <input
                  type="text"
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="e.g., Engineer, Teacher, etc."
                />
              </div>

              {/* Contact Number */}
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number*
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  required
                />
              </div>
              
              {/* Alternate Contact Number */}
              <div>
                <label htmlFor="alternateContactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Contact Number
                </label>
                <input
                  type="tel"
                  id="alternateContactNumber"
                  name="alternateContactNumber"
                  value={formData.alternateContactNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                />
              </div>
            </div>

            {/* Address */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="street" className="block text-xs text-gray-600 mb-1">
                    Street
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-xs text-gray-600 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-xs text-gray-600 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-xs text-gray-600 mb-1">
                    Zip/Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="address.postalCode"
                    value={formData.address.postalCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="country" className="block text-xs text-gray-600 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Medical Information</h3>
            
            {/* Chronic Diseases */}
            <div className="mb-4">
              <label htmlFor="chronicDiseases" className="block text-sm font-medium text-gray-700 mb-1">
                Chronic Diseases
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.chronicDiseases.map((disease, index) => (
                  <div key={index} className="bg-[#E8F5F4] px-3 py-1 rounded-full flex items-center">
                    <span className="text-sm text-[#568F87]">{disease}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedDiseases = [...formData.chronicDiseases];
                        updatedDiseases.splice(index, 1);
                        setFormData({ ...formData, chronicDiseases: updatedDiseases });
                      }}
                      className="ml-2 text-[#568F87] hover:text-[#3E6A64]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  id="chronicDiseaseInput"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="Add chronic disease..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      setFormData({
                        ...formData,
                        chronicDiseases: [...formData.chronicDiseases, e.target.value.trim()]
                      });
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = document.getElementById('chronicDiseaseInput');
                    if (input.value.trim()) {
                      setFormData({
                        ...formData,
                        chronicDiseases: [...formData.chronicDiseases, input.value.trim()]
                      });
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-[#90D1CA] text-white rounded-r-md hover:bg-[#568F87]"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Allergies */}
            <div className="mb-4">
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                Allergies
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.allergies.map((allergy, index) => (
                  <div key={index} className="bg-[#E8F5F4] px-3 py-1 rounded-full flex items-center">
                    <span className="text-sm text-[#568F87]">{allergy}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedAllergies = [...formData.allergies];
                        updatedAllergies.splice(index, 1);
                        setFormData({ ...formData, allergies: updatedAllergies });
                      }}
                      className="ml-2 text-[#568F87] hover:text-[#3E6A64]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  id="allergyInput"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="Add allergy..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      setFormData({
                        ...formData,
                        allergies: [...formData.allergies, e.target.value.trim()]
                      });
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = document.getElementById('allergyInput');
                    if (input.value.trim()) {
                      setFormData({
                        ...formData,
                        allergies: [...formData.allergies, input.value.trim()]
                      });
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-[#90D1CA] text-white rounded-r-md hover:bg-[#568F87]"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Family History */}
            <div className="mb-4">
              <label htmlFor="familyHistory" className="block text-sm font-medium text-gray-700 mb-1">
                Family History
              </label>
              <textarea
                id="familyHistory"
                name="familyHistory"
                value={formData.familyHistory}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Family medical history..."
              ></textarea>
            </div>
            
            {/* Past Medical History */}
            <div className="mb-4">
              <label htmlFor="pastMedicalHistory" className="block text-sm font-medium text-gray-700 mb-1">
                Past Medical History
              </label>
              <textarea
                id="pastMedicalHistory"
                name="pastMedicalHistory"
                value={formData.pastMedicalHistory}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Previous illnesses, surgeries, etc..."
              ></textarea>
            </div>

            {/* Lifestyle Section */}
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">Lifestyle Information</h4>
              
              {/* Diet */}
              <div className="mb-3">
                <label htmlFor="diet" className="block text-sm font-medium text-gray-700 mb-1">
                  Diet
                </label>
                <input
                  type="text"
                  id="diet"
                  name="lifestyle.diet"
                  value={formData.lifestyle.diet}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="Dietary habits..."
                />
              </div>
              
              {/* Exercise */}
              <div className="mb-3">
                <label htmlFor="exercise" className="block text-sm font-medium text-gray-700 mb-1">
                  Exercise
                </label>
                <input
                  type="text"
                  id="exercise"
                  name="lifestyle.exercise"
                  value={formData.lifestyle.exercise}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="Exercise routine..."
                />
              </div>
              
              {/* Sleep */}
              <div className="mb-3">
                <label htmlFor="sleep" className="block text-sm font-medium text-gray-700 mb-1">
                  Sleep
                </label>
                <input
                  type="text"
                  id="sleep"
                  name="lifestyle.sleep"
                  value={formData.lifestyle.sleep}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="Sleep patterns..."
                />
              </div>
              
              {/* Addictions */}
              <div>
                <label htmlFor="addictions" className="block text-sm font-medium text-gray-700 mb-1">
                  Addictions
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.lifestyle.addictions.map((addiction, index) => (
                    <div key={index} className="bg-[#E8F5F4] px-3 py-1 rounded-full flex items-center">
                      <span className="text-sm text-[#568F87]">{addiction}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedAddictions = [...formData.lifestyle.addictions];
                          updatedAddictions.splice(index, 1);
                          setFormData({
                            ...formData,
                            lifestyle: {
                              ...formData.lifestyle,
                              addictions: updatedAddictions
                            }
                          });
                        }}
                        className="ml-2 text-[#568F87] hover:text-[#3E6A64]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    id="addictionInput"
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                    placeholder="Add addiction..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        setFormData({
                          ...formData,
                          lifestyle: {
                            ...formData.lifestyle,
                            addictions: [...formData.lifestyle.addictions, e.target.value.trim()]
                          }
                        });
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      const input = document.getElementById('addictionInput');
                      if (input.value.trim()) {
                        setFormData({
                          ...formData,
                          lifestyle: {
                            ...formData.lifestyle,
                            addictions: [...formData.lifestyle.addictions, input.value.trim()]
                          }
                        });
                        input.value = '';
                      }
                    }}
                    className="px-4 py-2 bg-[#90D1CA] text-white rounded-r-md hover:bg-[#568F87]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            {/* Doctor Notes */}
            <div>
              <label htmlFor="doctorNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Notes
              </label>
              <textarea
                id="doctorNotes"
                name="doctorNotes"
                value={formData.doctorNotes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Additional notes about the patient..."
              ></textarea>
            </div>
          </div>

          {/* Mental and Physical Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Homeopathic Information</h3>
            
            {/* Constitutional Type */}
            <div className="mb-4">
              <label htmlFor="constitutionalType" className="block text-sm font-medium text-gray-700 mb-1">
                Constitutional Type
              </label>
              <input
                type="text"
                id="constitutionalType"
                name="constitutionalType"
                value={formData.constitutionalType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="e.g., Phosphorus, Sulphur, etc."
              />
            </div>
            
            {/* Miasmatic Background */}
            <div className="mb-4">
              <label htmlFor="miasmaticBackground" className="block text-sm font-medium text-gray-700 mb-1">
                Miasmatic Background
              </label>
              <textarea
                id="miasmaticBackground"
                name="miasmaticBackground"
                value={Array.isArray(formData.miasmaticBackground) ? formData.miasmaticBackground.join(', ') : ''}
                onChange={handleArrayChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Enter comma-separated values"
              ></textarea>
            </div>
            
            {/* Mentals */}
            <div className="mb-4">
              <label htmlFor="mentals" className="block text-sm font-medium text-gray-700 mb-1">
                Mental Symptoms
              </label>
              <textarea
                id="mentals"
                name="mentals"
                value={Array.isArray(formData.mentals) ? formData.mentals.join(', ') : ''}
                onChange={handleArrayChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Enter comma-separated values"
              ></textarea>
            </div>
            
            {/* Physicals */}
            <div className="mb-4">
              <label htmlFor="physicals" className="block text-sm font-medium text-gray-700 mb-1">
                Physical Symptoms
              </label>
              <textarea
                id="physicals"
                name="physicals"
                value={Array.isArray(formData.physicals) ? formData.physicals.join(', ') : ''}
                onChange={handleArrayChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Enter comma-separated values"
              ></textarea>
            </div>
            
            {/* Modalities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="modalities.better" className="block text-sm font-medium text-gray-700 mb-1">
                  Modalities - Better
                </label>
                <textarea
                  id="modalities.better"
                  name="modalities.better"
                  value={Array.isArray(formData.modalities.better) ? formData.modalities.better.join(', ') : ''}
                  onChange={handleNestedArrayChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="Enter comma-separated values"
                ></textarea>
              </div>
              <div>
                <label htmlFor="modalities.worse" className="block text-sm font-medium text-gray-700 mb-1">
                  Modalities - Worse
                </label>
                <textarea
                  id="modalities.worse"
                  name="modalities.worse"
                  value={Array.isArray(formData.modalities.worse) ? formData.modalities.worse.join(', ') : ''}
                  onChange={handleNestedArrayChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="Enter comma-separated values"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Administrative Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Administrative Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              
              {/* Registration Date - Read Only */}
              <div>
                <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Date
                </label>
                <input
                  type="date"
                  id="registrationDate"
                  name="registrationDate"
                  value={formData.registrationDate}
                  readOnly
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
            </div>
            
            {/* Doctor Notes */}
            <div className="mt-4">
              <label htmlFor="doctorNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Notes
              </label>
              <textarea
                id="doctorNotes"
                name="doctorNotes"
                value={formData.doctorNotes}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Additional notes about the patient..."
              ></textarea>
            </div>
          </div>
          
          {/* Homeopathic Treatment Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Homeopathic Treatment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Remedy */}
              <div>
                <label htmlFor="remedy" className="block text-sm font-medium text-gray-700 mb-1">
                  Remedy
                </label>
                <input
                  type="text"
                  id="remedy"
                  name="treatment.remedy"
                  value={(formData.treatment && formData.treatment.remedy) || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="e.g., ABIES CANADENSIS, Belladonna..."
                />
                {formData.visits && formData.visits.length > 0 && formData.visits[0].prescriptions && formData.visits[0].prescriptions.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last prescribed: {formData.visits[0].prescriptions[0].medicine}
                  </p>
                )}
              </div>

              {/* Potency */}
              <div>
                <label htmlFor="potency" className="block text-sm font-medium text-gray-700 mb-1">
                  Potency
                </label>
                <input
                  type="text"
                  id="potency"
                  name="treatment.potency"
                  value={(formData.treatment && formData.treatment.potency) || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="e.g., 30C, 200C, 1M..."
                />
                {formData.visits && formData.visits.length > 0 && formData.visits[0].prescriptions && formData.visits[0].prescriptions.length > 0 && formData.visits[0].prescriptions[0].potency && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last prescribed: {formData.visits[0].prescriptions[0].potency}
                  </p>
                )}
              </div>

              {/* Frequency */}
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <input
                  type="text"
                  id="frequency"
                  name="treatment.frequency"
                  value={(formData.treatment && formData.treatment.frequency) || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="e.g., Once daily, Twice daily..."
                />
                {formData.visits && formData.visits.length > 0 && formData.visits[0].prescriptions && formData.visits[0].prescriptions.length > 0 && formData.visits[0].prescriptions[0].frequency && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last prescribed: {formData.visits[0].prescriptions[0].frequency}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  name="treatment.duration"
                  value={(formData.treatment && formData.treatment.duration) || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="e.g., 7 days, 2 weeks..."
                />
                {formData.visits && formData.visits.length > 0 && formData.visits[0].prescriptions && formData.visits[0].prescriptions.length > 0 && formData.visits[0].prescriptions[0].duration && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last prescribed: {formData.visits[0].prescriptions[0].duration}
                  </p>
                )}
              </div>
            </div>

            {/* Consultation Notes */}
            <div className="mt-4">
              <label htmlFor="firstVisitNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Consultation Notes
              </label>
              <textarea
                id="firstVisitNotes"
                name="firstVisitNotes"
                value={formData.firstVisitNotes || ''}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Additional notes from consultation..."
              ></textarea>
            </div>

            {/* Next Appointment */}
            <div className="mt-4">
              <label htmlFor="firstVisitFollowUpDate" className="block text-sm font-medium text-gray-700 mb-1">
                Next Visit Date
              </label>
              <input
                type="date"
                id="firstVisitFollowUpDate"
                name="firstVisitFollowUpDate"
                value={formData.firstVisitFollowUpDate || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
              />
              {formData.visits && formData.visits.length > 0 && (formData.visits[0].nextVisitDate || formData.visits[0].followUpDate) && (
                <p className="text-xs text-gray-500 mt-1">
                  Last scheduled: {new Date(formData.visits[0].nextVisitDate || formData.visits[0].followUpDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 bg-[#90D1CA] hover:bg-[#568F87] text-white font-medium rounded-lg transition-colors duration-300 shadow-sm ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Updating Patient...' : 'Update Patient'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditPatientForm;
