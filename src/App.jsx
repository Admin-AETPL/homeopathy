import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MedicineSearchForm from './features/medicines/formpage'
import AllMedicines from './features/medicines/allmedicines'
import MedicineDashboard from './features/medicines/dashboard'
import MedicineDetail from './features/medicines/medicineDetail'
import AddPatientForm from './features/paitents/addpaitents'
import EditPatient from './features/paitents/editpatient'
import ViewPatient from './features/paitents/viewpaitent'
import PatientDashboard from './features/paitents/dashboard'
import AllPatients from './features/paitents/allpatients'
import BookAppointment from './features/appointments/bookAppointment'
import AppointmentDashboard from './features/appointments/dashboard'


const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 
            {/* Routes will go here */}
            <Routes>
              <Route path="/" element={<MedicineDashboard />} />
              <Route path="/medicines" element={<MedicineDashboard />} />
              <Route path="/medicines/all" element={<AllMedicines />} />
              <Route path="/medicines/search" element={<MedicineSearchForm />} />
              <Route path="/medicines/:id" element={<MedicineDetail />} />
              <Route path="/patients" element={<PatientDashboard />} />
              <Route path="/patients/all" element={<AllPatients />} />
              <Route path="/patients/add" element={<AddPatientForm />} />
              <Route path="/patients/edit/:id" element={<EditPatient />} />
              <Route path="/patients/:id" element={<ViewPatient />} />
              <Route path="/appointments" element={<AppointmentDashboard />} />
              <Route path="/appointments/book" element={<BookAppointment />} />
              <Route path="/about" element={<div>About Page Content</div>} />
              <Route path="/contact" element={<div>Contact Page Content</div>} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App