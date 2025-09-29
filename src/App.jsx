import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MedicineSearchForm from './features/medicines/formpage'

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 
            {/* Routes will go here */}
            <Routes>
              <Route path="/" element={ <MedicineSearchForm />} />
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