import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { patientApi } from '../../services/api';

const ViewPatient = () => {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch patient data on component mount
  useEffect(() => {
    fetchPatientData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Helper function to safely parse JSON strings
  const parseJsonField = (field) => {
    if (!field) return null;
    if (typeof field === 'object') return field;
    
    try {
      return JSON.parse(field);
    } catch (e) {
      console.error(`Error parsing JSON field:`, e);
      return null;
    }
  };

  // Fetch patient data from API
  const fetchPatientData = async () => {
    setLoading(true);
    setError(null);

    try {
      const patientData = await patientApi.getPatientById(id);
      console.log('Fetched patient data:', patientData);
      setPatient(patientData);
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError('Failed to load patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#90D1CA]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
        <Link to="/patients" className="text-[#568F87] hover:underline">
          &larr; Back to Patients
        </Link>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <p className="text-yellow-600">Patient not found.</p>
        </div>
        <Link to="/patients" className="text-[#568F87] hover:underline">
          &larr; Back to Patients
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
          <p className="text-sm text-gray-500">Patient ID: {id.substring(id.length - 12)}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/patients/edit/${id}`}
            className="bg-[#90D1CA] hover:bg-[#568F87] text-white px-4 py-2 rounded-md transition-colors text-sm"
          >
            Edit Patient
          </Link>
          <Link
            to="/patients/all"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            Back to All Patients
          </Link>
        </div>
      </div>

      {/* Debug section */}
      {/* <div className="mb-6 p-3 bg-gray-100 rounded-md">
        <details>
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">Debug: Show Raw Patient Data</summary>
          <pre className="mt-2 text-xs overflow-auto max-h-40 p-2 bg-gray-50 rounded">
            {JSON.stringify(patient, null, 2)}
          </pre>
        </details>
      </div> */}

      {/* Patient header with name and age */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-xl font-semibold text-gray-800">{patient.name}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <p>Patient ID: {id.substring(id.length - 12)}</p>
          <p>Age: {patient.age || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Personal Information</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Gender:</span> {patient.gender || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Age:</span> {patient.age || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Date of Birth:</span> {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'N/A'}
            </p>
            <p>
              <span className="font-medium">Blood Group:</span> {patient.bloodGroup || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Marital Status:</span> {patient.maritalStatus || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Occupation:</span> {patient.occupation || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Registration Date:</span> {patient.registrationDate ? formatDate(patient.registrationDate) : 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Contact Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Contact Information</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Phone:</span> {patient.contact || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Alternate Phone:</span> {patient.alternateContactNumber || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Email:</span> {patient.email || 'N/A'}
            </p>
            {patient.address && (
              <div>
                <span className="font-medium">Address:</span>
                {(() => {
                  const addressObj = parseJsonField(patient.address);
                  if (addressObj) {
                    return (
                      <p className="ml-4">
                        {addressObj.street && `${addressObj.street}, `}
                        {addressObj.city && `${addressObj.city}, `}
                        {addressObj.state && `${addressObj.state}, `}
                        {addressObj.postalCode && `${addressObj.postalCode}, `}
                        {addressObj.country || ''}
                      </p>
                    );
                  } else {
                    return <p className="ml-4">Address information unavailable</p>;
                  }
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Medical Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Medical Information</h3>
          <div className="space-y-2">
            <p>
              <span className="font-medium">Allergies:</span>
              <span className="block ml-4 text-sm">
                {(() => {
                  const allergiesArr = parseJsonField(patient.allergies);
                  if (allergiesArr && allergiesArr.length > 0) {
                    return allergiesArr.join(', ');
                  }
                  return 'None recorded';
                })()}
              </span>
            </p>
            <p>
              <span className="font-medium">Chronic Diseases:</span>
              <span className="block ml-4 text-sm">
                {(() => {
                  const diseasesArr = parseJsonField(patient.chronicDiseases);
                  if (diseasesArr && diseasesArr.length > 0) {
                    return diseasesArr.join(', ');
                  }
                  return 'None recorded';
                })()}
              </span>
            </p>
            <p>
              <span className="font-medium">Family History:</span>
              <span className="block ml-4 text-sm">{patient.familyHistory || 'None recorded'}</span>
            </p>
            <p>
              <span className="font-medium">Past Medical History:</span>
              <span className="block ml-4 text-sm">{patient.pastMedicalHistory || 'None recorded'}</span>
            </p>
          </div>
        </div>
        
        {/* Lifestyle Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Lifestyle Information</h3>
          <div className="space-y-2">
            {(() => {
              const lifestyle = parseJsonField(patient.lifestyle);
              if (lifestyle) {
                return (
                  <>
                    <p>
                      <span className="font-medium">Diet:</span>
                      <span className="block ml-4 text-sm">{lifestyle.diet || 'None recorded'}</span>
                    </p>
                    <p>
                      <span className="font-medium">Exercise:</span>
                      <span className="block ml-4 text-sm">{lifestyle.exercise || 'None recorded'}</span>
                    </p>
                    <p>
                      <span className="font-medium">Sleep:</span>
                      <span className="block ml-4 text-sm">{lifestyle.sleep || 'None recorded'}</span>
                    </p>
                    <p>
                      <span className="font-medium">Addictions:</span>
                      <span className="block ml-4 text-sm">
                        {lifestyle.addictions && lifestyle.addictions.length > 0 
                          ? lifestyle.addictions.join(', ') 
                          : 'None recorded'}
                      </span>
                    </p>
                  </>
                );
              }
              return <p>No lifestyle information available</p>;
            })()}
          </div>
        </div>

        {/* Medical History */}
        {patient.medicalHistory && (
          patient.medicalHistory.previousIllnesses ||
          patient.medicalHistory.surgeries ||
          patient.medicalHistory.chronicConditions
        ) && (
          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Medical History</h3>
            <div className="space-y-2">
              {patient.medicalHistory.previousIllnesses && (
                <p>
                  <span className="font-medium">Previous Illnesses:</span>
                  <span className="block ml-4 text-sm">
                    {patient.medicalHistory.previousIllnesses}
                  </span>
                </p>
              )}
              {patient.medicalHistory.surgeries && (
                <p>
                  <span className="font-medium">Surgeries:</span>
                  <span className="block ml-4 text-sm">
                    {patient.medicalHistory.surgeries}
                  </span>
                </p>
              )}
              {patient.medicalHistory.chronicConditions && (
                <p>
                  <span className="font-medium">Chronic Conditions:</span>
                  <span className="block ml-4 text-sm">
                    {patient.medicalHistory.chronicConditions}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Homeopathic Details */}
        <div className="bg-gray-50 p-4 rounded-lg md:col-span-3">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Homeopathic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p>
              <span className="font-medium">Constitutional Type:</span> {patient.constitutionalType || 'N/A'}
            </p>
            
            <p>
              <span className="font-medium">Miasmatic Background:</span>{' '}
              {(() => {
                const miasmaticArr = parseJsonField(patient.miasmaticBackground);
                if (miasmaticArr && miasmaticArr.length > 0) {
                  return miasmaticArr.join(', ');
                }
                return 'N/A';
              })()}
            </p>
            
            <div className="md:col-span-2">
              <span className="font-medium">Mentals:</span>{' '}
              <span className="block ml-4 text-sm">
                {(() => {
                  const mentalsArr = parseJsonField(patient.mentals);
                  if (mentalsArr && mentalsArr.length > 0) {
                    return mentalsArr.join(', ');
                  }
                  return 'None recorded';
                })()}
              </span>
            </div>
            
            <div className="md:col-span-2">
              <span className="font-medium">Physicals:</span>{' '}
              <span className="block ml-4 text-sm">
                {(() => {
                  const physicalsArr = parseJsonField(patient.physicals);
                  if (physicalsArr && physicalsArr.length > 0) {
                    return physicalsArr.join(', ');
                  }
                  return 'None recorded';
                })()}
              </span>
            </div>
            
            {(() => {
              const modalities = parseJsonField(patient.modalities);
              if (modalities) {
                return (
                  <div className="md:col-span-2">
                    <span className="font-medium">Modalities:</span>
                    <div className="ml-4">
                      <p>
                        <span className="font-medium text-sm">Better:</span>{' '}
                        <span className="text-sm">
                          {modalities.better && modalities.better.length > 0
                            ? modalities.better.join(', ')
                            : 'None recorded'}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-sm">Worse:</span>{' '}
                        <span className="text-sm">
                          {modalities.worse && modalities.worse.length > 0
                            ? modalities.worse.join(', ')
                            : 'None recorded'}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>

        {/* Visit Information */}
        <div className="bg-gray-50 p-4 rounded-lg md:col-span-3">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Visit Information</h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-4">
              <p>
                <span className="font-medium">Last Visit Date:</span>{' '}
                {patient.lastVisitDate
                  ? formatDate(patient.lastVisitDate)
                  : 'No visits recorded'}
              </p>
              
              {/* Display the most recent visit's next visit date */}
              {patient.visits && patient.visits.length > 0 && (
                <p>
                  <span className="font-medium">Next Visit Date:</span>{' '}
                  {patient.visits[0].nextVisitDate || patient.visits[0].followUpDate
                    ? formatDate(patient.visits[0].nextVisitDate || patient.visits[0].followUpDate)
                    : 'No next visit scheduled'}
                </p>
              )}
              
              {/* Show total number of visits */}
              <p>
                <span className="font-medium">Total Visits:</span>{' '}
                <span className="px-2 py-1 bg-[#E8F5F4] text-[#568F87] rounded-full text-xs">
                  {(() => {
                    const visitsArr = parseJsonField(patient.visits);
                    return visitsArr ? visitsArr.length : 0;
                  })()}
                </span>
              </p>
            </div>
            
            {/* Visit history section */}
            {(() => {
              const visitsArr = parseJsonField(patient.visits);
              if (visitsArr && visitsArr.length > 0) {
                return (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-700 mb-4">Visit History</h4>
                    <div className="space-y-6">
                  {(() => {
                    const visits = parseJsonField(patient.visits) || [];
                    return visits.map((visit, index) => (
                    <div key={index} className="border-l-2 border-[#90D1CA] pl-4 pb-6">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-800">
                          Visit on {formatDate(visit.date)}
                        </h5>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {index === 0 ? 'Latest' : `Visit #${visits.length - index}`}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Chief Complaint</p>
                          <p className="text-sm">{visit.chiefComplaint || 'Not recorded'}</p>
                        </div>
                        
                        {visit.diagnosis && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">Diagnosis</p>
                            <p className="text-sm">{visit.diagnosis}</p>
                          </div>
                        )}
                        
                        {visit.symptoms && visit.symptoms.length > 0 && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-600">Symptoms</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {visit.symptoms.map((symptom, idx) => (
                                <span key={idx} className="bg-[#E8F5F4] px-2 py-1 rounded-full text-xs text-[#568F87]">
                                  {symptom}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {visit.prescriptions && visit.prescriptions.length > 0 && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-600 mb-1">Prescription</p>
                            <div className="bg-white p-3 rounded border border-gray-100">
                              {visit.prescriptions.map((prescription, idx) => (
                                <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                                  <div>
                                    <span className="text-gray-500">Medicine:</span>{' '}
                                    <span className="font-medium">{prescription.medicine}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Potency:</span>{' '}
                                    <span>{prescription.potency || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Frequency:</span>{' '}
                                    <span>{prescription.frequency || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Duration:</span>{' '}
                                    <span>{prescription.duration || 'N/A'}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {visit.notes && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-600">Notes</p>
                            <p className="text-sm bg-gray-50 p-2 rounded">{visit.notes}</p>
                          </div>
                        )}
                        
                        {(visit.nextVisitDate || visit.followUpDate) && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">Follow-up Date</p>
                            <p className="text-sm">{formatDate(visit.nextVisitDate || visit.followUpDate)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    ));
                  })()}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPatient;