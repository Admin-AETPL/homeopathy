import React, { useState, useEffect } from 'react';
import { medicineApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MedicineSearchForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState({ tested: false, working: false, message: '' });
  const navigate = useNavigate();

  // Test API connection on component mount
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        console.log('Testing API connection to:', apiUrl);

        // Try a direct axios call to test the connection with more detailed options
        // Use the correct endpoint format: /api/medicines/common-name?name=test
        const response = await axios.get(`${apiUrl}/api/medicines/common-name`, {
          params: {
            name: 'test' // Use the required 'name' parameter based on the example
          },
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          withCredentials: false
        });

        console.log('API test response:', response.data);

        setApiStatus({
          tested: true,
          working: true,
          message: 'API connection successful!'
        });
      } catch (err) {
        console.error('API connection test failed:', err);

        // Try fallback to the general medicines endpoint
        try {
          const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
          console.log('Testing fallback API connection to:', apiUrl);

          const fallbackResponse = await axios.get(`${apiUrl}/api/medicines`, {
            params: {
              q: 'test' // Use the 'q' parameter as fallback
            },
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            withCredentials: false
          });

          console.log('Fallback API test response:', fallbackResponse.data);

          setApiStatus({
            tested: true,
            working: true,
            message: 'API connection successful (using fallback endpoint)!'
          });
          return;
        } catch (fallbackErr) {
          console.error('Fallback API connection test also failed:', fallbackErr);
        }

        // Provide more detailed error information
        let errorMessage = 'Unknown error';

        if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Connection refused - server may be down or unreachable';
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = 'Connection timed out - server took too long to respond';
        } else if (err.response) {
          // The server responded with a status code outside of 2xx range
          errorMessage = `Server error: ${err.response.status} ${err.response.statusText}`;
        } else if (err.request) {
          // The request was made but no response was received
          errorMessage = 'Network error - no response received from server';
        } else {
          // Something happened in setting up the request
          errorMessage = err.message || 'Request setup error';
        }

        setApiStatus({
          tested: true,
          working: false,
          message: `API connection failed: ${errorMessage}`
        });
      }
    };

    testApiConnection();
  }, []);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      console.log('Searching for:', searchQuery);
      console.log('API URL:', import.meta.env.VITE_API_BASE_URL);

      // Call the API with the search query
      console.log('Calling API with query:', searchQuery);
      // The API will search using the correct endpoint format: /api/medicines/common-name?name=query
      const searchResults = await medicineApi.searchMedicines(searchQuery);
      console.log('Search results:', searchResults);

      // Log the structure of the first result if available
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        console.log('First result structure:', Object.keys(searchResults[0]));
        console.log('First result sample:', searchResults[0]);
        console.log('Common name available:', searchResults.some(med => med.commonName));
        console.log('Medicine names found:', searchResults.map(med => med.name).join(', '));
      }

      // Our API service now handles formatting the data
      if (Array.isArray(searchResults) && searchResults.length > 0) {
        setResults(searchResults);
      } else {
        // Provide more specific feedback based on the search query
        const isLikelyMedicineName = searchQuery.toUpperCase() === searchQuery ||
          /^[A-Z]/.test(searchQuery);

        if (isLikelyMedicineName) {
          setError(
            <div>
              <p>No medicines found with name "{searchQuery}".</p>
              <p className="mt-2">Try:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>Checking the spelling</li>
                <li>Searching by common name instead</li>
                <li>Using a partial name (e.g., "ABIES" instead of "ABIES CANADENSIS")</li>
              </ul>
            </div>
          );
        } else {
          setError(
            <div>
              <p>No medicines found matching "{searchQuery}".</p>
              <p className="mt-2">Try searching for:</p>
              <ul className="list-disc ml-5 mt-1">
                <li>A specific medicine name (e.g., "ABIES CANADENSIS")</li>
                <li>A common name (e.g., "Hemlock Spruce")</li>
                <li>A shorter, more general term</li>
              </ul>
            </div>
          );
        }

        setResults([]);
      }
    } catch (err) {
      console.error('Error searching medicines:', err);

      // Provide a more user-friendly error message
      let errorMessage = 'Unknown error';

      if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
        errorMessage = 'Cannot connect to the medicine database. Please try again later.';
      } else if (err.response && err.response.status === 404) {
        errorMessage = 'The medicine you searched for could not be found.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(
        <div>
          <p>Failed to search medicines: {errorMessage}</p>
          <p className="mt-2 text-sm">If this problem persists, please check your network connection or contact support.</p>
        </div>
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medicine-search-container max-w-5xl mx-auto my-8 px-4 bg-gray-50 min-h-screen pb-12">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#568F87] to-[#90D1CA] rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Find Homeopathic Medicines</h2>
            <p className="text-white text-opacity-90">Search our comprehensive database of homeopathic remedies</p>
          </div>
          <button
            onClick={() => navigate('/medicines')}
            className="bg-white text-[#568F87] font-medium py-2 px-4 rounded-lg transition-all duration-300 shadow-sm flex items-center hover:shadow-md hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by medicine name (e.g., 'ABIES CANADENSIS') or common name (e.g., 'Hemlock Spruce')..."
              className="w-full pl-12 pr-10 py-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#90D1CA] focus:border-transparent shadow-sm text-gray-700"
              aria-label="Search medicines"
              required
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full h-6 w-6 flex items-center justify-center"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-[#568F87] hover:bg-[#3E6A64] text-white font-medium py-4 px-8 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg md:w-auto w-full flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </form>
      </div>

      {/* API Status Indicator
      {apiStatus.tested && (
        <div className={`mb-8 rounded-xl shadow-md overflow-hidden ${apiStatus.working ? 'bg-white border-l-4 border-green-500' : 'bg-white border-l-4 border-yellow-500'}`}>
          <div className="p-4">
            <div className="flex items-center">
              {apiStatus.working ? (
                <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-6 w-6 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              <div>
                <h3 className={`text-lg font-semibold ${apiStatus.working ? 'text-green-700' : 'text-yellow-700'}`}>API Status</h3>
                <p className="text-gray-600">{apiStatus.message}</p>
              </div>
            </div>

            {apiStatus.working && (
              <div className="mt-2 bg-green-50 p-3 rounded-md">
                <p className="text-sm text-green-700 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Using API endpoint: <code className="ml-1 bg-green-100 px-1 py-0.5 rounded">{import.meta.env.VITE_API_BASE_URL}/api/medicines/common-name</code>
                </p>
              </div>
            )}

            {!apiStatus.working && (
              <div className="mt-3">
                <p className="text-sm text-yellow-700">
                  Make sure your backend server is running and supports the endpoint:
                  <code className="block mt-1 bg-yellow-50 px-2 py-1 rounded">
                    {import.meta.env.VITE_API_BASE_URL}/api/medicines/common-name?name=value
                  </code>
                </p>
                <div className="mt-3 bg-yellow-50 p-3 rounded-md">
                  <p className="font-medium text-yellow-700 mb-2">Troubleshooting steps:</p>
                  <ol className="list-decimal ml-5 space-y-1 text-sm text-yellow-800">
                    <li>Verify the backend server is running on {import.meta.env.VITE_API_BASE_URL.split('//')[1].split(':')[0]}</li>
                    <li>Check that port {import.meta.env.VITE_API_BASE_URL.split(':')[2] || '3000'} is open and accessible</li>
                    <li>Ensure the API supports the <code className="bg-yellow-100 px-1 py-0.5 rounded">/api/medicines/common-name</code> endpoint</li>
                    <li>Try accessing the API directly in a browser or Postman: <code className="bg-yellow-100 px-1 py-0.5 rounded">{import.meta.env.VITE_API_BASE_URL}/api/medicines/common-name?name=test</code></li>
                    <li>Check network connectivity between the client and server</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )} */}

      {/* Quick Search Options */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#568F87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Search
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 bg-[#568F87] rounded-full mr-2"></span>
              Popular Medicine Names
            </h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {['ABIES CANADENSIS', 'ABIES NIGRA', 'ABROTANUM', 'ABSINTHIUM'].map(name => (
                <button
                  key={name}
                  className="text-[#568F87] hover:text-white hover:bg-[#568F87] cursor-pointer bg-[#E8F5F4] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
                  onClick={() => {
                    setSearchQuery(name);
                    handleSubmit({ preventDefault: () => { } });
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 bg-[#90D1CA] rounded-full mr-2"></span>
              Popular Common Names
            </h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {['Hemlock Spruce', 'Black Spruce', 'Southernwood', 'Common Wormwood'].map(name => (
                <button
                  key={name}
                  className="text-[#568F87] hover:text-white hover:bg-[#568F87] cursor-pointer bg-[#E8F5F4] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
                  onClick={() => {
                    setSearchQuery(name);
                    handleSubmit({ preventDefault: () => { } });
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 bg-[#3E6A64] rounded-full mr-2"></span>
              Search by Symptoms
            </h4>
            <div className="flex flex-wrap gap-2">
              {['Stomach', 'Fever', 'Head', 'Cough'].map(symptom => (
                <button
                  key={symptom}
                  className="text-[#568F87] hover:text-white hover:bg-[#568F87] cursor-pointer bg-[#E8F5F4] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
                  onClick={() => {
                    setSearchQuery(symptom.toLowerCase());
                    handleSubmit({ preventDefault: () => { } });
                  }}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500 border-t border-gray-100 pt-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Click any suggestion above or type your search term in the search box
        </p>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="bg-white rounded-xl shadow-md p-10 mb-8 flex flex-col justify-center items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#90D1CA] absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-lg font-medium text-gray-700">Searching for medicines...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-white border-l-4 border-red-500 rounded-xl shadow-md p-5 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-2">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-800">No Results Found</h3>
              <div className="mt-1 text-sm text-gray-700">{error}</div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setError(null);
                }}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Another Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results section - will be populated when API returns data */}
      {!loading && !error && results.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-[#568F87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Search Results
              <span className="ml-2 text-sm bg-[#E8F5F4] text-[#568F87] px-2 py-0.5 rounded-full">{results.length}</span>
            </h3>
            <button
              onClick={() => {
                setSearchQuery('');
                setResults([]);
              }}
              className="text-sm text-gray-500 hover:text-[#568F87] flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Results
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {results.map((medicine, index) => (
              <div
                key={medicine.id || `medicine-${index}`}
                className="border border-gray-200 rounded-xl hover:shadow-xl transition-all duration-300 bg-white cursor-pointer relative group overflow-hidden"
                onClick={() => navigate(`/medicines/${medicine.id}`)}
              >
                {/* Card Header with Gradient Accent */}
                <div className="h-2 bg-gradient-to-r from-[#568F87] to-[#90D1CA] group-hover:h-3 transition-all duration-300"></div>

                <div className="p-6">
                  {/* Medicine Header */}
                  <div className="border-b border-gray-100 pb-4 mb-4">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div>
                        <h4 className="text-xl font-bold text-[#568F87] group-hover:text-[#3E6A64] transition-colors">{medicine.name}</h4>

                        {medicine.commonName && (
                          <p className="text-md text-gray-700 mt-1 font-medium">Common name: <span className="italic">{medicine.commonName}</span></p>
                        )}
                      </div>
                      {medicine.rawSections?.Remedy && (
                        <div className="mt-2 md:mt-0 md:ml-4 bg-[#E8F5F4] px-3 py-1.5 rounded-lg inline-block shadow-sm">
                          <p className="text-sm font-medium text-[#568F87]">Remedy: <span className="font-bold">{medicine.rawSections.Remedy}</span></p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* General Description */}
                  {medicine.description && (
                    <div className="mb-4 bg-gray-50 rounded-lg p-3">
                      <h5 className="text-md font-semibold text-[#568F87] mb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        General
                      </h5>
                      <p className="text-sm text-gray-700 line-clamp-3">{medicine.description}</p>
                    </div>
                  )}

                  {/* All Properties/Sections */}
                  <div className="mt-4">
                    {/* Use IIFE to track displayed sections and avoid duplication */}
                    {(() => {
                      // Track displayed sections to avoid duplication
                      const displayedSections = new Set(['Remedy', 'Common Name', 'General']);
                      const sections = [];
                      let sectionCount = 0;
                      const maxSections = 3; // Limit to 3 sections for cleaner UI

                      // First add sections from rawSections
                      if (medicine.rawSections) {
                        Object.entries(medicine.rawSections)
                          .filter(([key, value]) => value && !displayedSections.has(key))
                          .slice(0, maxSections)
                          .forEach(([key, value]) => {
                            displayedSections.add(key);
                            sectionCount++;
                            sections.push(
                              <div key={key} className="mb-4 pb-3 border-b border-gray-100 last:border-b-0">
                                <h5 className="text-md font-semibold text-[#568F87] mb-1 flex items-center">
                                  <span className="w-2 h-2 bg-[#568F87] rounded-full mr-2"></span>
                                  {key}
                                </h5>
                                <p className="text-sm text-gray-700 line-clamp-2">{value}</p>
                              </div>
                            );
                          });
                      }

                      // Then add any properties not already displayed
                      if (medicine.properties && sectionCount < maxSections) {
                        Object.entries(medicine.properties)
                          .filter(([key, value]) => value && !displayedSections.has(key))
                          .slice(0, maxSections - sectionCount)
                          .forEach(([key, value]) => {
                            displayedSections.add(key);
                            sectionCount++;
                            sections.push(
                              <div key={key} className="mb-4 pb-3 border-b border-gray-100 last:border-b-0">
                                <h5 className="text-md font-semibold text-[#568F87] mb-1 capitalize flex items-center">
                                  <span className="w-2 h-2 bg-[#90D1CA] rounded-full mr-2"></span>
                                  {key}
                                </h5>
                                <p className="text-sm text-gray-700 line-clamp-2">{value}</p>
                              </div>
                            );
                          });
                      }

                      // Add a "View more" indicator if there are more sections
                      const totalSections = (
                        (medicine.rawSections ? Object.keys(medicine.rawSections).filter(key => !['Remedy', 'Common Name', 'General'].includes(key)).length : 0) +
                        (medicine.properties ? Object.keys(medicine.properties).filter(key => !displayedSections.has(key)).length : 0)
                      );

                      if (totalSections > maxSections) {
                        sections.push(
                          <div key="more" className="text-center mt-2 pt-2 border-t border-gray-100">
                            <p className="text-sm text-[#568F87] font-medium">
                              + {totalSections - maxSections} more sections
                            </p>
                          </div>
                        );
                      }

                      return sections;
                    })()}
                  </div>

                  {/* Footer with Source URL and View Indicator */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    {medicine.url ? (
                      <a
                        href={medicine.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#90D1CA] hover:text-[#568F87] hover:underline inline-flex items-center"
                        onClick={(e) => e.stopPropagation()} // Prevent the card's click event from triggering
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Source
                      </a>
                    ) : (
                      <span></span> // Empty span to maintain flex layout
                    )}

                    <span className="text-sm text-gray-400 group-hover:text-[#568F87] transition-colors flex items-center">
                      View Details
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineSearchForm;
