import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicineApi } from '../../services/api';

const MedicineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicineDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('=== FETCHING MEDICINE DETAILS ===');
        console.log('Medicine ID:', id);
        console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
        console.log('Full URL:', `${import.meta.env.VITE_API_BASE_URL}/api/medicines/${id}`);
        
        const result = await medicineApi.getMedicineById(id);
        
        console.log('=== RESULT RECEIVED ===');
        console.log('Result:', result);
        console.log('Result type:', typeof result);
        console.log('Result keys:', result ? Object.keys(result) : 'null');
        console.log('Has sections?', result?.sections ? 'YES' : 'NO');
        console.log('Sections:', result?.sections);
        console.log('Sections length:', result?.sections?.length);
        
        if (!result) {
          console.error('No result returned from API');
          setError('No medicine data received from server.');
          return;
        }
        
        if (!result.sections || result.sections.length === 0) {
          console.warn('Result has no sections!');
        }
        
        setMedicine(result);
        console.log('Medicine state set successfully');
      } catch (err) {
        console.error('=== ERROR FETCHING MEDICINE ===');
        console.error('Error object:', err);
        console.error('Error message:', err.message);
        console.error('Error response:', err.response);
        console.error('Error response data:', err.response?.data);
        console.error('Error response status:', err.response?.status);
        setError(`Failed to load medicine details: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMedicineDetails();
    } else {
      console.error('No medicine ID provided!');
      setError('No medicine ID provided');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#90D1CA]"></div>
          <span className="ml-3 text-lg text-gray-600">Loading medicine details...</span>
        </div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || 'Medicine not found'}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#568F87] hover:bg-[#3E6A64] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Go Back
        </button>
      </div>
    );
  }

  // Helper function to get section value from array or object format
  const getSectionValue = (sectionName) => {
    if (!medicine) return null;
    
    // Check if sections is an array (new format)
    if (Array.isArray(medicine.sections)) {
      const section = medicine.sections.find(s => s.section_name === sectionName);
      return section ? section.section_text : null;
    }
    // Check if rawSections is an object (old format)
    if (medicine.rawSections && typeof medicine.rawSections === 'object') {
      return medicine.rawSections[sectionName];
    }
    return null;
  };

  // Debug: Log medicine object
  console.log('Medicine object in render:', medicine);
  console.log('Medicine sections:', medicine?.sections);
  console.log('Is sections array?', Array.isArray(medicine?.sections));

  // Get medicine name and common name
  const medicineName = medicine?.name || getSectionValue('Remedy') || 'Unknown Medicine';
  const commonName = medicine?.commonName || getSectionValue('Common Name') || '';
  const generalInfo = medicine?.description || getSectionValue('General') || '';
  
  console.log('Extracted values:', { medicineName, commonName, generalInfo });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-[#568F87] hover:bg-[#3E6A64] text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Go Back
      </button>

      {/* Medicine header */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-[#568F87] mb-2">{medicineName}</h1>
              {commonName && (
                <p className="text-gray-600 italic">Common name: {commonName}</p>
              )}
            </div>
          </div>
          {generalInfo && (
            <div className="mb-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">General</h2>
              <p className="text-gray-700">{generalInfo}</p>
            </div>
          )}
        </div>
      </div>

      {/* All Medicine Information */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Medicine Information</h2>
          <div className="space-y-6">
            {(() => {
              // Track displayed sections to avoid duplication
              const displayedSections = new Set(['Remedy', 'Common Name', 'General']);
              const sections = [];
              
              // Handle array format (new database structure)
              if (Array.isArray(medicine.sections)) {
                medicine.sections
                  .filter(section => section.section_text && !displayedSections.has(section.section_name))
                  .forEach((section, index) => {
                    displayedSections.add(section.section_name);
                    sections.push(
                      <div key={`section-${index}`} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <h3 className="text-md font-medium text-[#568F87] mb-2">
                          {section.section_name}
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">{section.section_text}</p>
                      </div>
                    );
                  });
              }
              // Handle object format (old structure) - fallback
              else if (medicine.rawSections && typeof medicine.rawSections === 'object') {
                Object.entries(medicine.rawSections)
                  .filter(([key, value]) => value && !displayedSections.has(key))
                  .forEach(([key, value]) => {
                    displayedSections.add(key);
                    sections.push(
                      <div key={key} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <h3 className="text-md font-medium text-[#568F87] mb-2">
                          {key}
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">{value}</p>
                      </div>
                    );
                  });
              }
              
              // Then add any properties not already displayed
              if (medicine.properties && typeof medicine.properties === 'object') {
                Object.entries(medicine.properties)
                  .filter(([key, value]) => value && !displayedSections.has(key))
                  .forEach(([key, value]) => {
                    displayedSections.add(key);
                    sections.push(
                      <div key={`prop-${key}`} className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                        <h3 className="text-md font-medium text-[#568F87] mb-2">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </h3>
                        <p className="text-gray-700 whitespace-pre-line">{value}</p>
                      </div>
                    );
                  });
              }
              
              return sections.length > 0 ? sections : (
                <p className="text-gray-500 italic">No additional information available</p>
              );
            })()} 
          </div>
        </div>
      </div>

      {/* Original Data (Debug View) */}
      {/* {medicine.originalData && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <details className="text-sm">
              <summary className="text-lg font-semibold text-gray-800 mb-4 cursor-pointer hover:text-[#568F87]">
                Raw Data (Developer View)
              </summary>
              <pre className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96 text-xs">
                {JSON.stringify(medicine.originalData, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )} */}

      {/* Additional information */}
      {medicine.url && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Source Information</h2>
            <div className="flex items-center">
              <span className="font-medium mr-2">Source:</span>
              <a 
                href={medicine.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#90D1CA] hover:text-[#568F87] hover:underline flex items-center"
              >
                {medicine.url}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineDetail;
