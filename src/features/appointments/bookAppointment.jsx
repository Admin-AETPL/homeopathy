import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi, appointmentApi } from '../../services/api';

// No longer needed - using async/await with the real API

const BookAppointment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30, // Default duration in minutes
    appointmentType: 'Regular Check-up',
    chiefComplaint: '',
    notes: '',
    status: 'Scheduled' // Default status
  });

  // Fetch patients for dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await patientApi.getAllPatients();
        if (response && Array.isArray(response)) {
          setPatients(response);
          setFilteredPatients(response);
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        patient => patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setFormData({
      ...formData,
      patientId: patient.id,
      patientName: patient.name
    });
    setSearchTerm(patient.name);
    setShowPatientDropdown(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Format date and time for API
      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      
      // Extract date and time components for backend
      const appointmentDate = formData.appointmentDate;
      const appointmentTime = formData.appointmentTime;
      
      // Create appointment payload according to backend schema
      const appointmentData = {
        patientId: formData.patientId,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        durationMinutes: parseInt(formData.duration),
        appointmentType: formData.appointmentType,
        chiefComplaint: formData.chiefComplaint,
        additionalNotes: formData.notes,
        status: formData.status
      };

      console.log('Appointment data to be sent:', appointmentData);
      
      // Call the actual API to create the appointment
      const response = await appointmentApi.createAppointment(appointmentData);
      console.log('Appointment created successfully:', response);
      
      setSuccess(true);
      
      // Redirect to the appointments dashboard after a delay
      setTimeout(() => {
        navigate('/appointments');
      }, 2000);
      
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Using the delay utility function defined at the top of the file

  // Get available time slots (this would typically come from your backend)
  const [timeSlots, setTimeSlots] = useState([]);
  
  // Load available time slots when date changes
  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      if (!formData.appointmentDate) return;
      
      try {
        // For now, we'll generate time slots locally
        // In the future, this could be replaced with:
        // const slots = await appointmentApi.getAvailableTimeSlots(formData.appointmentDate);
        
        const slots = [];
        // Generate time slots from 9 AM to 5 PM in 30-minute increments
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const formattedHour = hour.toString().padStart(2, '0');
            const formattedMinute = minute.toString().padStart(2, '0');
            slots.push(`${formattedHour}:${formattedMinute}`);
          }
        }
        setTimeSlots(slots);
      } catch (err) {
        console.error('Error fetching available time slots:', err);
      }
    };
    
    fetchAvailableTimeSlots();
  }, [formData.appointmentDate]);

  return (
    <div className="max-w-4xl mx-auto my-8 px-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 bg-[#568F87] hover:bg-[#3E6A64] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <h2 className="text-2xl font-bold text-[#568F87]">Book Appointment</h2>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">Appointment booked successfully! Redirecting...</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex justify-between items-start">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Selection */}
          <div className="md:col-span-2">
            <label htmlFor="patientSearch" className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name*
            </label>
            <div className="relative">
              <input
                type="text"
                id="patientSearch"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowPatientDropdown(true);
                }}
                onFocus={() => setShowPatientDropdown(true)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                placeholder="Search for patient by name..."
                required
              />
              {showPatientDropdown && filteredPatients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md max-h-60 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-600">{patient.contact || 'No contact info'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-2 flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {formData.patientId ? `Selected patient ID: ${formData.patientId}` : 'No patient selected'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/patients/add')}
                className="text-sm text-[#568F87] hover:underline"
              >
                + Add New Patient
              </button>
            </div>
          </div>

          {/* Appointment Date */}
          <div>
            <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Date*
            </label>
            <input
              type="date"
              id="appointmentDate"
              name="appointmentDate"
              value={formData.appointmentDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
              required
            />
          </div>

          {/* Appointment Time */}
          <div>
            <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Time*
            </label>
            <select
              id="appointmentTime"
              name="appointmentTime"
              value={formData.appointmentTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
              required
            >
              <option value="">Select a time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>

          {/* Appointment Type */}
          <div>
            <label htmlFor="appointmentType" className="block text-sm font-medium text-gray-700 mb-1">
              Appointment Type
            </label>
            <select
              id="appointmentType"
              name="appointmentType"
              value={formData.appointmentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
            >
              <option value="Regular Check-up">Regular Check-up</option>
              <option value="First Consultation">First Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Emergency">Emergency</option>
              <option value="Prescription Renewal">Prescription Renewal</option>
            </select>
          </div>

          {/* Chief Complaint */}
          <div className="md:col-span-2">
            <label htmlFor="chiefComplaint" className="block text-sm font-medium text-gray-700 mb-1">
              Chief Complaint
            </label>
            <input
              type="text"
              id="chiefComplaint"
              name="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
              placeholder="Main reason for visit..."
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
              placeholder="Any additional information..."
            ></textarea>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-4 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.patientId}
            className={`px-6 py-2 rounded-md text-white transition-colors ${
              loading || !formData.patientId
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#568F87] hover:bg-[#3E6A64]'
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Book Appointment'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookAppointment;
