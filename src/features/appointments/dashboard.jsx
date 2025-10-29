import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentApi, patientApi } from '../../services/api';

const AppointmentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('upcoming');
  const [patients, setPatients] = useState({});

  // Fetch appointments and patients data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchAppointments(), fetchPatients()]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      const response = await appointmentApi.getAllAppointments();
      console.log('API response for appointments:', response);
      
      let appointmentsData = [];
      
      if (Array.isArray(response)) {
        appointmentsData = response;
      } else if (response && Array.isArray(response.data)) {
        appointmentsData = response.data;
      } else if (response && typeof response === 'object') {
        appointmentsData = [response];
      }
      
      // Format appointment data to match our component's expectations
      const formattedAppointments = appointmentsData.map(appointment => {
        // Ensure ID is properly handled
        let appointmentId = appointment.id;
        if (typeof appointmentId === 'string' && /^\d+$/.test(appointmentId)) {
          appointmentId = parseInt(appointmentId, 10);
        }
        
        // Ensure patientId is properly handled
        let patientId = appointment.patientId;
        if (typeof patientId === 'string' && /^\d+$/.test(patientId)) {
          patientId = parseInt(patientId, 10);
        }
        
        // Combine date and time into a single datetime string
        const dateStr = appointment.appointmentDate;
        const timeStr = appointment.appointmentTime;
        const appointmentDateTime = new Date(`${dateStr}T${timeStr}`);
        
        return {
          id: appointmentId,
          patientId: patientId,
          patientName: appointment.patient_name || 'Unknown Patient',
          appointmentDateTime: appointmentDateTime.toISOString(),
          duration: appointment.durationMinutes || 30,
          appointmentType: appointment.appointmentType || 'Regular Check-up',
          chiefComplaint: appointment.chiefComplaint || '',
          notes: appointment.additionalNotes || '',
          status: appointment.status || 'Scheduled',
          created_at: appointment.created_at
        };
      });
      
      console.log('Formatted appointments with proper IDs:', formattedAppointments);
      setAppointments(formattedAppointments);
      applyFilters(formattedAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      throw err;
    }
  };
  
  // Fetch patients data to get names
  const fetchPatients = async () => {
    try {
      const response = await patientApi.getAllPatients();
      if (response && Array.isArray(response)) {
        const patientsMap = {};
        response.forEach(patient => {
          patientsMap[patient.id] = patient.name;
        });
        setPatients(patientsMap);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      throw err;
    }
  };

  // Apply filters when filter settings or appointments change
  useEffect(() => {
    applyFilters(appointments);
  }, [filterStatus, filterDate, appointments]);
  
  // Filter appointments based on status and date
  const applyFilters = (appointmentsList) => {
    const filtered = appointmentsList.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDateTime);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Filter by status
      if (filterStatus !== 'all' && appointment.status !== filterStatus) {
        return false;
      }
      
      // Filter by date
      if (filterDate === 'upcoming' && appointmentDate < today) {
        return false;
      } else if (filterDate === 'past' && appointmentDate >= today) {
        return false;
      } else if (filterDate === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return appointmentDate >= today && appointmentDate < tomorrow;
      }
      
      return true;
    });
    
    setFilteredAppointments(filtered);
  };

  // Format date and time
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  // Delete an appointment
  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        
        // Ensure we have a valid ID
        if (!id && id !== 0) {
          throw new Error('Invalid appointment ID');
        }
        
        // Convert ID to number if it's a numeric string
        const numericId = typeof id === 'string' && /^\d+$/.test(id) ? parseInt(id, 10) : id;
        
        console.log(`Dashboard requesting deletion of appointment ID: ${numericId} (type: ${typeof numericId})`);
        const result = await appointmentApi.deleteAppointment(numericId);
        console.log('Delete appointment result:', result);
        
        // Show success message
        setError(null);
        setSuccess('Appointment deleted successfully!');
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
        
        // Refresh appointments after deletion
        await fetchAppointments();
      } catch (err) {
        console.error('Error deleting appointment:', err);
        
        // Provide more specific error message if available
        if (err.response && err.response.data && err.response.data.message) {
          setError(`Failed to delete appointment: ${err.response.data.message}`);
        } else if (err.message) {
          setError(`Failed to delete appointment: ${err.message}`);
        } else {
          setError('Failed to delete appointment. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Update appointment status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Ensure we have a valid ID
      if (!id && id !== 0) {
        throw new Error('Invalid appointment ID');
      }
      
      // Convert ID to number if it's a numeric string
      const numericId = typeof id === 'string' && /^\d+$/.test(id) ? parseInt(id, 10) : id;
      
      // Get the current appointment data
      const appointment = appointments.find(app => app.id === numericId);
      if (!appointment) {
        throw new Error('Appointment not found');
      }
      
      console.log(`Updating appointment ${numericId} (type: ${typeof numericId}) status to ${newStatus}`);
      
      // Ensure patientId is properly handled
      let patientId = appointment.patientId;
      if (typeof patientId === 'string' && /^\d+$/.test(patientId)) {
        patientId = parseInt(patientId, 10);
      }
      
      // Prepare the update data - include all required fields from the backend schema
      const updateData = {
        status: newStatus,
        // Include other necessary fields from the original appointment
        // to ensure we don't lose data during the update
        patientId: patientId,
        appointmentDate: new Date(appointment.appointmentDateTime).toISOString().split('T')[0],
        appointmentTime: new Date(appointment.appointmentDateTime).toTimeString().slice(0, 5),
        durationMinutes: appointment.duration,
        appointmentType: appointment.appointmentType,
        chiefComplaint: appointment.chiefComplaint || '',
        additionalNotes: appointment.notes || ''
      };
      
      console.log('Update data being sent:', updateData);
      
      // Call the API to update the appointment
      const result = await appointmentApi.updateAppointment(numericId, updateData);
      console.log('Update appointment result:', result);
      
      // Show success message
      setError(null);
      setSuccess(`Appointment status updated to ${newStatus} successfully!`);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      // Refresh appointments list
      await fetchAppointments();
    } catch (err) {
      console.error('Error updating appointment status:', err);
      
      // Provide more specific error message if available
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to update status: ${err.response.data.message}`);
      } else if (err.message) {
        setError(`Failed to update status: ${err.message}`);
      } else {
        setError('Failed to update appointment status. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'No-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#90D1CA]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#568F87] mb-2">Appointments</h2>
          <p className="text-gray-600">Manage and view all patient appointments</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/appointments/book"
            className="bg-[#568F87] hover:bg-[#3E6A64] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Book New Appointment
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 flex justify-between items-start">
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
      
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 flex justify-between items-start">
          <p className="text-green-600">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <div>
                <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                >
                  <option value="all">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="No-show">No-show</option>
                </select>
              </div>
              <div>
                <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <select
                  id="filterDate"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA]"
                >
                  <option value="all">All Dates</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="today">Today</option>
                  <option value="past">Past</option>
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <span className="text-sm text-gray-600">
                Showing {filteredAppointments.length} of {appointments.length} appointments
              </span>
            </div>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-4 text-gray-600">No appointments found matching your filters.</p>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterDate('all');
              }}
              className="mt-2 text-[#568F87] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => {
                  const { date, time } = formatDateTime(appointment.appointmentDateTime);
                  return (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientName || patients[appointment.patientId] || 'Unknown Patient'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {appointment.patientId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{date}</div>
                        <div className="text-sm text-gray-500">{time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.appointmentType}</div>
                        <div className="text-sm text-gray-500">{appointment.chiefComplaint}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link
                            to={`/patients/${appointment.patientId}`}
                            className="text-[#568F87] hover:text-[#3E6A64]"
                            title="View Patient"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Appointment"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDashboard;
