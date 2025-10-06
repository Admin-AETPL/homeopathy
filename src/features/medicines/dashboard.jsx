import React from 'react';
import { Link } from 'react-router-dom';

const MedicineDashboard = () => {
  return (
    <div className="medicine-dashboard max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Homeopathic Medicines Dashboard</h1>
      
      <div className="flex flex-wrap justify-center gap-8">
        {/* View All Medicines Card */}
        <Link
          to="/medicines/all"
          className="bg-[#E7F2EF] shadow-md rounded-lg p-8 w-64 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow no-underline"
        >
          <div className="mb-6 bg-[#F8F8F8] p-4 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#568F87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-center text-gray-800">View All Medicines</h2>
        </Link>

        {/* Search Medicines Card */}
        <Link
          to="/medicines/search"
          className="bg-[#E7F2EF] shadow-md rounded-lg p-8 w-64 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow no-underline"
        >
          <div className="mb-6 bg-[#F8F8F8] p-4 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#568F87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-center text-gray-800">Search Medicines</h2>
        </Link>
      </div>
      
      <div className="mt-12 max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-[#568F87] mb-4">About Homeopathic Medicines</h3>
        <p className="text-gray-700 mb-4">
          Homeopathy is a medical system based on the belief that the body can cure itself. It uses small amounts of natural substances like plants and minerals to stimulate the healing process.
        </p>
        <p className="text-gray-700 mb-4">
          Our database contains hundreds of homeopathic medicines with detailed information about their uses, properties, and dosages. Use the dashboard above to browse or search for specific medicines.
        </p>
        <div className="mt-6 bg-[#F0F9F8] p-4 rounded-md border-l-4 border-[#90D1CA]">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Always consult with a qualified healthcare provider before starting any homeopathic treatment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicineDashboard;
