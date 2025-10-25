import React, { useState, useEffect } from 'react';
import { patientApi } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const EditPatient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  console.log('Patient ID from URL params:', id);
  // Patient form state
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
    contact: '', // Using 'contact' to match backend field name
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
    lifestyle: {
      diet: '',
      exercise: '',
      addictions: [],
      sleep: ''
    },
    
    // Administrative
    registrationDate: new Date().toISOString(),
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Clear error when form data is successfully loaded
  useEffect(() => {
    if (formData.name && !loading) {
      // If we have patient name and not loading, data loaded successfully
      setError(null);
      console.log('✅ Form data detected, clearing any stale errors');
    }
  }, [formData.name, loading]);

  // Helper function to safely parse JSON strings
  const parseJsonField = (field) => {
    if (!field) return null;
    if (typeof field === 'object') return field;
    
    try {
      return JSON.parse(field);
    } catch (e) {
      console.error(`Error parsing JSON field:`, e);
      return null;
    }
  };

  // Fetch patient data on component mount
  useEffect(() => {
    // Clear error immediately when component mounts or ID changes
    setError(null);
    
    const fetchPatientData = async () => {
      setLoading(true);

      try {
        console.log('Fetching patient with ID:', id);
        const patientData = await patientApi.getPatientById(id);
        console.log('Fetched patient data for editing:', patientData);
        
        if (!patientData) {
          throw new Error('No patient data received');
        }
        
        console.log('Patient data loaded successfully');
        
        // Parse visits data to get the most recent visit
        const visitsArray = parseJsonField(patientData.visits) || [];
        const mostRecentVisit = visitsArray.length > 0 ? visitsArray[0] : null;
        
        // Extract prescription data from the most recent visit if available
        const mostRecentPrescription = mostRecentVisit && mostRecentVisit.prescriptions && mostRecentVisit.prescriptions.length > 0 
          ? mostRecentVisit.prescriptions[0] 
          : null;
        
        // Populate form with existing patient data
        setFormData({
          name: patientData.name || '',
          dateOfBirth: patientData.dateOfBirth ? patientData.dateOfBirth.split('T')[0] : '',
          age: patientData.age || '',
          gender: patientData.gender || 'Male',
          bloodGroup: patientData.bloodGroup || '',
          maritalStatus: patientData.maritalStatus || 'Single',
          occupation: patientData.occupation || '',
          
          contact: patientData.contact || '',
          alternateContactNumber: patientData.alternateContactNumber || '',
          email: patientData.email || '',
          address: parseJsonField(patientData.address) || {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: ''
          },
          
          allergies: parseJsonField(patientData.allergies) || [],
          chronicDiseases: parseJsonField(patientData.chronicDiseases) || [],
          familyHistory: patientData.familyHistory || '',
          pastMedicalHistory: patientData.pastMedicalHistory || '',
          lifestyle: parseJsonField(patientData.lifestyle) || {
            diet: '',
            exercise: '',
            addictions: [],
            sleep: ''
          },
          
          registrationDate: patientData.registrationDate || '',
          lastVisitDate: patientData.lastVisitDate || '',
          doctorNotes: patientData.doctorNotes || '',
          status: patientData.status || 'Active',
          
          constitutionalType: patientData.constitutionalType || '',
          miasmaticBackground: parseJsonField(patientData.miasmaticBackground) || [],
          mentals: parseJsonField(patientData.mentals) || [],
          physicals: parseJsonField(patientData.physicals) || [],
          modalities: parseJsonField(patientData.modalities) || {
            better: [],
            worse: []
          },
          visits: parseJsonField(patientData.visits) || [],
          
          // Populate first visit fields from the most recent visit if available
          firstVisitChiefComplaint: mostRecentVisit ? mostRecentVisit.chiefComplaint || '' : '',
          firstVisitSymptoms: mostRecentVisit && mostRecentVisit.symptoms ? [...mostRecentVisit.symptoms] : [],
          firstVisitDiagnosis: mostRecentVisit ? mostRecentVisit.diagnosis || '' : '',
          firstVisitMedicine: mostRecentPrescription ? mostRecentPrescription.medicine || '' : '',
          firstVisitPotency: mostRecentPrescription ? mostRecentPrescription.potency || '' : '',
          firstVisitDosage: mostRecentPrescription ? mostRecentPrescription.dosage || '' : '',
          firstVisitFrequency: mostRecentPrescription ? mostRecentPrescription.frequency || '' : '',
          firstVisitDuration: mostRecentPrescription ? mostRecentPrescription.duration || '' : '',
          firstVisitInstructions: mostRecentPrescription ? mostRecentPrescription.instructions || '' : '',
          firstVisitFollowUpDate: mostRecentVisit && (mostRecentVisit.nextVisitDate || mostRecentVisit.followUpDate) ? 
            (mostRecentVisit.nextVisitDate || mostRecentVisit.followUpDate).split('T')[0] : '',
          firstVisitNotes: mostRecentVisit ? mostRecentVisit.notes || '' : ''
        });
        
        console.log('Most recent visit data loaded:', mostRecentVisit);
        
        // Force clear error after successful data load
        setError(null);
        console.log('✅ Patient data loaded successfully, error cleared');
      } catch (err) {
        console.error('Error fetching patient data:', err);
        console.error('Error details:', err.response || err.message);
        
        // Provide detailed error message
        let errorMessage = 'Failed to load patient data.';
        
        if (err.response) {
          if (err.response.status === 404) {
            errorMessage = `Patient with ID ${id} not found. Please check the patient ID.`;
          } else {
            errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
          }
        } else if (err.request) {
          errorMessage = 'Network error - no response received from server. Please check your connection.';
        } else {
          errorMessage = err.message || 'Unknown error occurred';
        }
        
        console.log('Setting error message:', errorMessage);
        setError(errorMessage);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    if (id) {
      fetchPatientData();
    } else {
      setError('No patient ID provided');
      setLoading(false);
    }
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Create a copy of the form data for submission
      const submissionData = { ...formData };
      
      // Check if we need to update the most recent visit
      if (formData.firstVisitChiefComplaint || formData.firstVisitSymptoms.length > 0) {
        // Get the visits array
        const visitsArray = parseJsonField(formData.visits) || [];
        
        // Create a new visit object with the form data
        const updatedVisit = {
          date: new Date().toISOString(),
          chiefComplaint: formData.firstVisitChiefComplaint,
          symptoms: formData.firstVisitSymptoms,
          diagnosis: formData.firstVisitDiagnosis || '',
          notes: formData.firstVisitNotes || '',
          nextVisitDate: formData.firstVisitFollowUpDate || null,
          followUpDate: formData.firstVisitFollowUpDate || null,
          prescriptions: []
        };
        
        // Add prescription if medicine is provided
        if (formData.firstVisitMedicine) {
          updatedVisit.prescriptions.push({
            medicine: formData.firstVisitMedicine,
            potency: formData.firstVisitPotency || '',
            dosage: formData.firstVisitDosage || '',
            frequency: formData.firstVisitFrequency || '',
            duration: formData.firstVisitDuration || '',
            instructions: formData.firstVisitInstructions || ''
          });
        }
        
        // If there are existing visits, update the most recent one
        if (visitsArray.length > 0) {
          // Replace the first (most recent) visit with our updated one
          visitsArray[0] = updatedVisit;
        } else {
          // Add as a new visit if there are none
          visitsArray.push(updatedVisit);
        }
        
        // Update the visits array in the submission data
        submissionData.visits = visitsArray;
        
        // Update lastVisitDate to match the updated visit date
        submissionData.lastVisitDate = updatedVisit.date;
      }
      
      console.log('Submitting update for patient ID:', id);
      console.log('Data being sent:', submissionData);
      const response = await patientApi.updatePatient(id, submissionData);
      console.log('Patient updated successfully:', response);
      setSuccess(true);
      
      // Redirect to patient view page after 1.5 seconds
      setTimeout(() => {
        navigate(`/patients/${id}`);
      }, 1500);
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
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#90D1CA]"></div>
      </div>
    );
  }

  return (
    <div className="add-patient-container max-w-4xl mx-auto my-8 px-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/patients/${id}`)}
          className="mr-4 bg-[#568F87] hover:bg-[#3E6A64] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Patient
        </button>
        <h2 className="text-2xl font-bold text-[#568F87]">
          {formData.name ? `Edit Patient: ${formData.name}` : 'Edit Patient Information'}
        </h2>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">Patient updated successfully! Redirecting...</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex justify-between items-start">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 font-bold ml-4"
            type="button"
          >
            ×
          </button>
        </div>
      )}

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
              />
            </div>

            {/* Contact Number */}
            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number*
              </label>
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
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

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
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
                  Postal Code
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

        {/* Homeopathic Details Section */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Homeopathic Details</h3>
          
          {/* Constitutional Type */}
          <div className="mb-6">
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
              placeholder="Patient's constitutional type..."
            />
          </div>
          
          {/* Miasmatic Background */}
          <div className="mb-6">
            <label htmlFor="miasmaticBackground" className="block text-sm font-medium text-gray-700 mb-1">
              Miasmatic Background
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.miasmaticBackground.map((miasm, index) => (
                <div key={index} className="bg-[#E8F5F4] px-3 py-1 rounded-full flex items-center">
                  <span className="text-sm text-[#568F87]">{miasm}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedMiasms = [...formData.miasmaticBackground];
                      updatedMiasms.splice(index, 1);
                      setFormData({ ...formData, miasmaticBackground: updatedMiasms });
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
                id="miasmInput"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Add miasmatic background..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    setFormData({
                      ...formData,
                      miasmaticBackground: [...formData.miasmaticBackground, e.target.value.trim()]
                    });
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = document.getElementById('miasmInput');
                  if (input.value.trim()) {
                    setFormData({
                      ...formData,
                      miasmaticBackground: [...formData.miasmaticBackground, input.value.trim()]
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

          {/* Mentals */}
          <div className="mb-6">
            <label htmlFor="mentals" className="block text-sm font-medium text-gray-700 mb-1">
              Mentals
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.mentals.map((mental, index) => (
                <div key={index} className="bg-[#E8F5F4] px-3 py-1 rounded-full flex items-center">
                  <span className="text-sm text-[#568F87]">{mental}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedMentals = [...formData.mentals];
                      updatedMentals.splice(index, 1);
                      setFormData({ ...formData, mentals: updatedMentals });
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
                id="mentalInput"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Add mental symptom..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    setFormData({
                      ...formData,
                      mentals: [...formData.mentals, e.target.value.trim()]
                    });
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = document.getElementById('mentalInput');
                  if (input.value.trim()) {
                    setFormData({
                      ...formData,
                      mentals: [...formData.mentals, input.value.trim()]
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

          {/* Physicals */}
          <div className="mb-6">
            <label htmlFor="physicals" className="block text-sm font-medium text-gray-700 mb-1">
              Physicals
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.physicals.map((physical, index) => (
                <div key={index} className="bg-[#E8F5F4] px-3 py-1 rounded-full flex items-center">
                  <span className="text-sm text-[#568F87]">{physical}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedPhysicals = [...formData.physicals];
                      updatedPhysicals.splice(index, 1);
                      setFormData({ ...formData, physicals: updatedPhysicals });
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
                id="physicalInput"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Add physical symptom..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    setFormData({
                      ...formData,
                      physicals: [...formData.physicals, e.target.value.trim()]
                    });
                    e.target.value = '';
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = document.getElementById('physicalInput');
                  if (input.value.trim()) {
                    setFormData({
                      ...formData,
                      physicals: [...formData.physicals, input.value.trim()]
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

          {/* Modalities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Better */}
            <div>
              <label htmlFor="better" className="block text-sm font-medium text-gray-700 mb-1">
                Modalities - Better
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.modalities.better.map((item, index) => (
                  <div key={index} className="bg-[#E8F5F4] px-3 py-1 rounded-full flex items-center">
                    <span className="text-sm text-[#568F87]">{item}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedItems = [...formData.modalities.better];
                        updatedItems.splice(index, 1);
                        setFormData({
                          ...formData,
                          modalities: {
                            ...formData.modalities,
                            better: updatedItems
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
                  id="betterInput"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="Add better modality..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      setFormData({
                        ...formData,
                        modalities: {
                          ...formData.modalities,
                          better: [...formData.modalities.better, e.target.value.trim()]
                        }
                      });
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = document.getElementById('betterInput');
                    if (input.value.trim()) {
                      setFormData({
                        ...formData,
                        modalities: {
                          ...formData.modalities,
                          better: [...formData.modalities.better, input.value.trim()]
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

            {/* Worse */}
            <div>
              <label htmlFor="worse" className="block text-sm font-medium text-gray-700 mb-1">
                Modalities - Worse
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.modalities.worse.map((item, index) => (
                  <div key={index} className="bg-[#E8F5F4] px-3 py-1 rounded-full flex items-center">
                    <span className="text-sm text-[#568F87]">{item}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedItems = [...formData.modalities.worse];
                        updatedItems.splice(index, 1);
                        setFormData({
                          ...formData,
                          modalities: {
                            ...formData.modalities,
                            worse: updatedItems
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
                  id="worseInput"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="Add worse modality..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      setFormData({
                        ...formData,
                        modalities: {
                          ...formData.modalities,
                          worse: [...formData.modalities.worse, e.target.value.trim()]
                        }
                      });
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = document.getElementById('worseInput');
                    if (input.value.trim()) {
                      setFormData({
                        ...formData,
                        modalities: {
                          ...formData.modalities,
                          worse: [...formData.modalities.worse, input.value.trim()]
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

          {/* Administrative Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Last Visit Date */}
            <div>
              <label htmlFor="lastVisitDate" className="block text-sm font-medium text-gray-700 mb-1">
                Last Visit Date
              </label>
              <input
                type="date"
                id="lastVisitDate"
                name="lastVisitDate"
                value={formData.lastVisitDate ? new Date(formData.lastVisitDate).toISOString().split('T')[0] : ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
              />
            </div>

            {/* Registration Date */}
            <div>
              <label htmlFor="registrationDate" className="block text-sm font-medium text-gray-700 mb-1">
                Registration Date
              </label>
              <input
                type="date"
                id="registrationDate"
                name="registrationDate"
                value={formData.registrationDate ? new Date(formData.registrationDate).toISOString().split('T')[0] : ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
              />
            </div>
          </div>
          
          {/* Visit History Summary */}
          {formData.visits && formData.visits.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h4 className="text-md font-medium text-gray-800 mb-4">Visit History Summary</h4>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm">
                  <span className="font-medium">Total Visits:</span>{' '}
                  <span className="px-2 py-1 bg-[#E8F5F4] text-[#568F87] rounded-full text-xs">
                    {formData.visits.length}
                  </span>
                </p>
                <p className="text-sm mt-2">
                  <span className="font-medium">Last Visit Date:</span>{' '}
                  {formData.lastVisitDate ? new Date(formData.lastVisitDate).toLocaleDateString() : 'N/A'}
                </p>
                <p className="text-sm mt-2 text-gray-600">
                  The form below is pre-populated with data from the most recent visit.
                </p>
              </div>
            </div>
          )}
          
          {/* First Visit Information */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h4 className="text-md font-medium text-gray-800 mb-4">Visit Information</h4>
            <p className="text-sm text-gray-600 mb-4">
              You can update the visit details below. For existing patients, this information is pre-populated from the most recent visit.
            </p>
            
            <div className="mb-4">
              <label htmlFor="firstVisitChiefComplaint" className="block text-sm font-medium text-gray-700 mb-1">
                Chief Complaint*
              </label>
              <input
                type="text"
                id="firstVisitChiefComplaint"
                name="firstVisitChiefComplaint"
                value={formData.firstVisitChiefComplaint || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    firstVisitChiefComplaint: e.target.value
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Main reason for visit..."
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="firstVisitSymptoms" className="block text-sm font-medium text-gray-700 mb-1">
                Symptoms
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.firstVisitSymptoms && formData.firstVisitSymptoms.map((symptom, index) => (
                  <div key={index} className="bg-[#E8F5F4] px-3 py-1 rounded-full flex items-center">
                    <span className="text-sm text-[#568F87]">{symptom}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedSymptoms = [...formData.firstVisitSymptoms];
                        updatedSymptoms.splice(index, 1);
                        setFormData({ ...formData, firstVisitSymptoms: updatedSymptoms });
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
                  id="symptomInput"
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                  placeholder="Add symptom..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      e.preventDefault();
                      setFormData({
                        ...formData,
                        firstVisitSymptoms: [...(formData.firstVisitSymptoms || []), e.target.value.trim()]
                      });
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = document.getElementById('symptomInput');
                    if (input.value.trim()) {
                      setFormData({
                        ...formData,
                        firstVisitSymptoms: [...(formData.firstVisitSymptoms || []), input.value.trim()]
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
            
            <div className="mb-4">
              <label htmlFor="firstVisitDiagnosis" className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis
              </label>
              <textarea
                id="firstVisitDiagnosis"
                name="firstVisitDiagnosis"
                value={formData.firstVisitDiagnosis || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    firstVisitDiagnosis: e.target.value
                  });
                }}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Diagnosis details..."
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescription
              </label>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstVisitMedicine" className="block text-xs text-gray-600 mb-1">
                      Medicine*
                    </label>
                    <input
                      type="text"
                      id="firstVisitMedicine"
                      name="firstVisitMedicine"
                      value={formData.firstVisitMedicine || ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          firstVisitMedicine: e.target.value
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                      placeholder="Medicine name..."
                    />
                  </div>
                  <div>
                    <label htmlFor="firstVisitPotency" className="block text-xs text-gray-600 mb-1">
                      Potency
                    </label>
                    <input
                      type="text"
                      id="firstVisitPotency"
                      name="firstVisitPotency"
                      value={formData.firstVisitPotency || ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          firstVisitPotency: e.target.value
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                      placeholder="e.g., 30C, 200C..."
                    />
                  </div>
                  <div>
                    <label htmlFor="firstVisitDosage" className="block text-xs text-gray-600 mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      id="firstVisitDosage"
                      name="firstVisitDosage"
                      value={formData.firstVisitDosage || ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          firstVisitDosage: e.target.value
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                      placeholder="e.g., 3 pills..."
                    />
                  </div>
                  <div>
                    <label htmlFor="firstVisitFrequency" className="block text-xs text-gray-600 mb-1">
                      Frequency
                    </label>
                    <input
                      type="text"
                      id="firstVisitFrequency"
                      name="firstVisitFrequency"
                      value={formData.firstVisitFrequency || ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          firstVisitFrequency: e.target.value
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                      placeholder="e.g., Twice daily..."
                    />
                  </div>
                  <div>
                    <label htmlFor="firstVisitDuration" className="block text-xs text-gray-600 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      id="firstVisitDuration"
                      name="firstVisitDuration"
                      value={formData.firstVisitDuration || ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          firstVisitDuration: e.target.value
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                      placeholder="e.g., 7 days..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="firstVisitInstructions" className="block text-xs text-gray-600 mb-1">
                      Instructions
                    </label>
                    <textarea
                      id="firstVisitInstructions"
                      name="firstVisitInstructions"
                      value={formData.firstVisitInstructions || ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          firstVisitInstructions: e.target.value
                        });
                      }}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                      placeholder="Special instructions..."
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="firstVisitFollowUpDate" className="block text-sm font-medium text-gray-700 mb-1">
                Next-Visit Date
              </label>
              <input
                type="date"
                id="firstVisitFollowUpDate"
                name="firstVisitFollowUpDate"
                value={formData.firstVisitFollowUpDate || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    firstVisitFollowUpDate: e.target.value
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
              />
            </div>
            
            <div>
              <label htmlFor="firstVisitNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="firstVisitNotes"
                name="firstVisitNotes"
                value={formData.firstVisitNotes || ''}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    firstVisitNotes: e.target.value
                  });
                }}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Additional notes about this visit..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-3 bg-[#90D1CA] hover:bg-[#568F87] text-white font-medium rounded-lg transition-colors duration-300 shadow-sm ${
              submitting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Updating Patient...' : 'Update Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPatient;