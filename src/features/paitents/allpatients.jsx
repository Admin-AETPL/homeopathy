import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientApi } from '../../services/api';

const AllPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const patientsPerPage = 10;

  // Fetch patients on component mount and when page changes
  useEffect(() => {
    fetchPatients();
  }, [currentPage]);

  // Fetch patients from API
  const fetchPatients = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, try to fetch with server-side pagination
      let response;
      try {
        response = await patientApi.getAllPatients({
          page: currentPage,
          limit: patientsPerPage,
          filters: searchTerm ? { search: searchTerm } : {}
        });
      } catch (err) {
        console.warn('Error with paginated request, falling back to client-side pagination:', err);
        // If paginated request fails, fetch all and handle pagination client-side
        response = await patientApi.getAllPatients();
      }

      console.log('API response:', response);

      // Handle different response formats
      let patientsData = [];
      let totalCount = 0;

      // Case 1: Response has data.patients (expected format with pagination)
      if (response && response.data && response.data.patients) {
        patientsData = response.data.patients;
        totalCount = response.data.total || response.data.patients.length;
      } 
      // Case 2: Response is a direct array (no pagination)
      else if (Array.isArray(response)) {
        patientsData = response;
        totalCount = response.length;
      }
      // Case 3: Response has data as array (alternative format)
      else if (response && Array.isArray(response.data)) {
        patientsData = response.data;
        totalCount = response.data.length;
      } else {
        console.warn('Unexpected API response structure:', response);
        setPatients([]);
        setTotalPages(1);
        return;
      }

      // Apply client-side search if needed
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        patientsData = patientsData.filter(patient => 
          (patient.name?.toLowerCase().includes(searchLower) ||
           patient.contactNumber?.includes(searchTerm) ||
           patient.email?.toLowerCase().includes(searchLower))
        );
        totalCount = patientsData.length;
      }

      // Apply client-side pagination if we have more than one page of data
      const totalPages = Math.ceil(totalCount / patientsPerPage);
      let paginatedPatients = patientsData;
      
      if (patientsData.length > patientsPerPage) {
        const startIndex = (currentPage - 1) * patientsPerPage;
        paginatedPatients = patientsData.slice(startIndex, startIndex + patientsPerPage);
      }

      setPatients(paginatedPatients);
      setTotalPages(totalPages > 0 ? totalPages : 1);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patient data. Please try again.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle patient search
  const handleSearch = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    // Reset to first page when search term changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      // If already on first page, trigger a new search
      fetchPatients();
    }
  };

  // Use all patients for display (filtering is now done server-side)
  const filteredPatients = patients;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4 bg-[#568F87] hover:bg-[#3E6A64] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm flex items-center">
          <Link to="/patients" className="text-white hover:underline flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {/* Back to Patient Dashboard */}
          </Link>
          <h1 className="text-2xl font-bold text-white">All Patients List</h1>
        </div>
        <Link
          to="/patients/add"
          className="bg-[#90D1CA] hover:bg-[#568F87] text-white px-4 py-2 rounded-md transition-colors"
        >
          Add New Patient
        </Link>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Search and filter */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search patients by name, email or phone..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#90D1CA] pl-10"
            value={searchTerm}
            onChange={handleSearch}
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#90D1CA]"></div>
        </div>
      ) : (
        <>
          {/* Patients table */}
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.gender || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {patient.age || (patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 'N/A')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.contact || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{patient.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {patient.lastVisitDate ? formatDate(patient.lastVisitDate) : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/patients/${patient.id}`}
                          className="text-[#568F87] hover:text-[#90D1CA] mr-3"
                          onClick={() => console.log('Viewing patient with ID:', patient.id, 'Full patient:', patient)}
                        >
                          View
                        </Link>
                        <Link
                          to={`/patients/edit/${patient.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          onClick={() => console.log('Editing patient with ID:', patient.id, 'Full patient:', patient)}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      {searchTerm ? 'No patients match your search.' : 'No patients found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="First page"
                >
                  &laquo;
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  &lsaquo;
                </button>
                
                {/* Show page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculate which page numbers to show based on current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md border ${
                        currentPage === pageNum 
                          ? 'bg-[#90D1CA] text-white border-[#90D1CA] font-medium' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      aria-current={currentPage === pageNum ? 'page' : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  &rsaquo;
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Last page"
                >
                  &raquo;
                </button>
                
                <div className="ml-4 text-sm text-gray-600 flex items-center">
                  <span>Page {currentPage} of {totalPages}</span>
                  <span className="mx-2">•</span>
                  <span>Showing {patients.length} patients</span>
                </div>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllPatients;
