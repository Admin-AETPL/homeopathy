import React, { useState } from 'react';
import { medicineApi } from '../../services/api';

const MedicineSearchForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await medicineApi.searchMedicines(searchQuery);
      setResults(searchResults);
      console.log('Search results:', searchResults);
    } catch (err) {
      console.error('Error searching medicines:', err);
      setError('Failed to search medicines. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="medicine-search-container max-w-3xl mx-auto my-8 px-4">
      <h2 className="text-2xl font-bold text-primary mb-6">Find Homeopathic Medicines</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for medicines, symptoms, or conditions..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#90D1CA] focus:border-transparent shadow-sm"
            aria-label="Search medicines"
            required
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button 
          type="submit"
          className="bg-[#90D1CA] hover:bg-[#568F87] text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 shadow-sm md:w-auto w-full"
        >
          Search
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p>Popular searches: 
          <span 
            className="text-[#90D1CA] hover:text-[#568F87] cursor-pointer mr-2"
            onClick={() => {
              setSearchQuery('Arnica');
              handleSubmit({ preventDefault: () => {} });
            }}
          >
            Arnica
          </span>, 
          <span 
            className="text-[#90D1CA] hover:text-[#568F87] cursor-pointer mr-2"
            onClick={() => {
              setSearchQuery('Allium Cepa');
              handleSubmit({ preventDefault: () => {} });
            }}
          >
            Allium Cepa
          </span>, 
          <span 
            className="text-[#90D1CA] hover:text-[#568F87] cursor-pointer"
            onClick={() => {
              setSearchQuery('Belladonna');
              handleSubmit({ preventDefault: () => {} });
            }}
          >
            Belladonna
          </span>
        </p>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#90D1CA]"></div>
          <p className="mt-2 text-gray-600">Searching...</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Results section - will be populated when API returns data */}
      {!loading && !error && results.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((medicine) => (
              <div 
                key={medicine.id} 
                className="p-4 border border-gray-200 rounded-md hover:shadow-md transition-shadow"
              >
                <h4 className="font-medium text-[#568F87]">{medicine.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{medicine.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineSearchForm;
