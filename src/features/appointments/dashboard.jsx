import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { appointmentApi } from '../../services/api';

const AppointmentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('upcoming');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call the API
        // const response = await appointmentApi.getAllAppointments();
        
        // For now, we'll use mock data
        const mockAppointments = [
          {
            id: '1',
            patientId: '101',
            patientName: 'John Smith',
            appointmentDateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            duration: 30,
            appointmentType: 'Regular Check-up',
            chiefComplaint: 'Headache',
            status: 'Scheduled'
          },
          {
            id: '2',
            patientId: '102',
            patientName: 'Jane Doe',
            appointmentDateTime: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
            duration: 45,
            appointmentType: 'Follow-up',
            chiefComplaint: 'Fever',
            status: 'Scheduled'
          },
          {
            id: '3',
            patientId: '103',
            patientName: 'Robert Johnson',
            appointmentDateTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            duration: 30,
            appointmentType: 'First Consultation',
            chiefComplaint: 'Cough',
            status: 'Completed'
          }
        ];
        
        setAppointments(mockAppointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Filter appointments based on status and date
  const filteredAppointments = appointments.filter(appointment => {
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

  // Format date and time
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
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
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
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
                              {appointment.patientName}
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
                        <Link
                          to={`/patients/${appointment.patientId}`}
                          className="text-[#568F87] hover:text-[#3E6A64] mr-4"
                        >
                          View Patient
                        </Link>
                        {/* Additional actions would go here */}
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
