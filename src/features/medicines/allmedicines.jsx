import React, { useState, useEffect } from 'react';
import { medicineApi } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

const AllMedicines = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  });
  const [sortBy, setSortBy] = useState('name');

  // Fetch medicines on component mount and when pagination or sort changes
  useEffect(() => {
    fetchMedicines();
  }, [pagination.page, sortBy]);

  const fetchMedicines = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching medicines with params:', {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy
      });
      
      const result = await medicineApi.getAllMedicines({
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy
      });

      console.log('Medicines fetched:', result);

      if (result && result.medicines && Array.isArray(result.medicines)) {
        if (result.medicines.length > 0) {
          console.log('First medicine sample:', result.medicines[0]);
          setMedicines(result.medicines);
          setPagination(prev => ({
            ...prev,
            total: result.pagination?.total || result.medicines.length
          }));
        } else {
          console.log('Medicines array is empty');
          setMedicines([]);
          setError('No medicines found in the database');
        }
      } else {
        console.error('Unexpected data format:', result);
        setMedicines([]);
        setError('Unexpected data format received from server');
      }
    } catch (err) {
      console.error('Error fetching medicines:', err);
      // Provide more detailed error information
      if (err.response) {
        console.error('Error response:', err.response.status, err.response.data);
        setError(`Server error (${err.response.status}): ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response received from server. Please check your network connection.');
      } else {
        setError(`Failed to load medicines: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Calculate total pages
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#568F87] to-[#90D1CA] rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/medicines')}
              className="mr-4 bg-white text-[#568F87] font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-sm flex items-center hover:shadow-md hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {/* Back to Dashboard */}
            </button>
            <h1 className="text-3xl font-bold text-white">Homeopathic Medicines</h1>
          </div>
          <div className="flex items-center bg-white rounded-lg shadow-sm px-3 py-1">
            <label htmlFor="sort" className="text-sm font-medium text-gray-700 mr-2">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={handleSortChange}
              className="rounded-md border-0 py-2 pl-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#90D1CA] bg-transparent"
            >
              <option value="name">Name (A-Z)</option>
              <option value="-name">Name (Z-A)</option>
              <option value="commonName">Common Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* API Status and Error Display */}
      {error && (
        <div className="bg-white border-l-4 border-red-500 rounded-lg shadow-md p-5 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
              <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800">Error Loading Medicines</h3>
              <p className="mt-1 text-sm text-gray-700">{error}</p>
              <button 
                onClick={fetchMedicines} 
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-10 mb-8 flex flex-col justify-center items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#90D1CA] absolute top-0 left-0"></div>
          </div>
          <span className="mt-4 text-lg font-medium text-gray-700">Loading medicines...</span>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      )}

      {/* Medicines Grid */}
      {!loading && medicines.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((medicine) => (
            <div
              key={medicine.id}
              className="bg-white overflow-hidden shadow-md rounded-xl hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#90D1CA] group"
            >
              {/* Card Header with Gradient Accent */}
              <div className="h-2 bg-gradient-to-r from-[#568F87] to-[#90D1CA] group-hover:h-3 transition-all duration-300"></div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#568F87] mb-1 group-hover:text-[#3E6A64] transition-colors">
                      {medicine.name}
                    </h2>
                    
                    {medicine.commonName && (
                      <p className="text-sm text-gray-500 italic">
                        Common name: <span className="font-medium">{medicine.commonName}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                {medicine.description && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {medicine.description}
                    </p>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {/* Display section count for array format */}
                  {Array.isArray(medicine.sections) && medicine.sections.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#568F87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Sections:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {medicine.sections
                          .filter(s => s.section_name !== 'Remedy' && s.section_name !== 'Common Name' && s.section_name !== 'General')
                          .slice(0, 3)
                          .map((section, idx) => (
                            <span 
                              key={idx} 
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E8F5F4] text-[#568F87] shadow-sm"
                            >
                              {section.section_name}
                            </span>
                          ))
                        }
                        {medicine.sections.filter(s => s.section_name !== 'Remedy' && s.section_name !== 'Common Name' && s.section_name !== 'General').length > 3 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 shadow-sm">
                            +{medicine.sections.filter(s => s.section_name !== 'Remedy' && s.section_name !== 'Common Name' && s.section_name !== 'General').length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Fallback for old object format */}
                  {medicine.properties && Object.entries(medicine.properties).some(([_, value]) => value) && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-[#568F87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Properties:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(medicine.properties)
                          .filter(([_, value]) => value)
                          .slice(0, 3)
                          .map(([key]) => (
                            <span 
                              key={key} 
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E8F5F4] text-[#568F87] shadow-sm"
                            >
                              {key}
                            </span>
                          ))
                        }
                        {Object.entries(medicine.properties).filter(([_, value]) => value).length > 3 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 shadow-sm">
                            +{Object.entries(medicine.properties).filter(([_, value]) => value).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* View Details Link */}
                  <div className="flex justify-end mt-2">
                    <Link
                      to={`/medicines/${medicine.id}`}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#90D1CA] hover:bg-[#568F87] transition-colors shadow-sm"
                    >
                      View details
                      <svg className="ml-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && medicines.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow-md p-10 text-center">
          <div className="bg-gray-50 rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center">
            <svg className="h-12 w-12 text-[#90D1CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-bold text-gray-900">No medicines found</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">We couldn't find any medicines matching your criteria. Try changing your search or filters.</p>
          <button
            onClick={() => {
              setSortBy('name');
              setPagination(prev => ({ ...prev, page: 1 }));
              fetchMedicines();
            }}
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#568F87] hover:bg-[#3E6A64] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#90D1CA]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {!loading && medicines.length > 0 && totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-md px-6 py-4 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#568F87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Showing <span className="font-bold mx-1">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-bold mx-1">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-bold mx-1">{pagination.total}</span> medicines
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className={`relative inline-flex items-center rounded-l-md px-3 py-2 text-sm font-medium ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-[#E8F5F4] hover:text-[#568F87]'} transition-colors duration-200`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline ml-1">Previous</span>
                </button>
                
                {/* Page numbers */}
                <div className="hidden md:flex">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    // Logic to show pages around current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${pagination.page === pageNum ? 'bg-[#90D1CA] text-white' : 'bg-white text-gray-700 hover:bg-[#E8F5F4] hover:text-[#568F87]'} transition-colors duration-200`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                {/* Current page indicator for mobile */}
                <div className="flex md:hidden items-center px-4 py-2 text-sm font-medium bg-white">
                  <span>Page {pagination.page} of {totalPages}</span>
                </div>
                
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, pagination.page + 1))}
                  disabled={pagination.page === totalPages}
                  className={`relative inline-flex items-center rounded-r-md px-3 py-2 text-sm font-medium ${pagination.page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-[#E8F5F4] hover:text-[#568F87]'} transition-colors duration-200`}
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMedicines;