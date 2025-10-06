import React from 'react';
import { Link } from 'react-router-dom';

const PatientDashboard = () => {
  return (
    <div className="patient-dashboard max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Patient Management</h1>
      
      <div className="flex flex-wrap justify-center gap-8">
        {/* View All Patients Card */}
        <Link
          to="/patients/all"
          className="bg-[#E7F2EF] shadow-md rounded-lg p-8 w-64 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow no-underline"
        >
          <div className="mb-6 bg-[#F8F8F8] p-4 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#568F87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-center text-gray-800">View All Patients</h2>
          <p className="mt-2 text-center text-gray-600">Access and manage your patient records</p>
        </Link>

        {/* Add New Patient Card */}
        <Link
          to="/patients/add"
          className="bg-[#E7F2EF] shadow-md rounded-lg p-8 w-64 flex flex-col items-center cursor-pointer hover:shadow-lg transition-shadow no-underline"
        >
          <div className="mb-6 bg-[#F8F8F8] p-4 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#568F87]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-center text-gray-800">Add New Patient</h2>
          <p className="mt-2 text-center text-gray-600">Create a new patient record</p>
        </Link>
      </div>
    </div>
  );
};

export default PatientDashboard;
