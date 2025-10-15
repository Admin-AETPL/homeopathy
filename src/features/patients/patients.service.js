const patientsRepository = require('./patients.repository');

class PatientsService {
  getAll() {
    return patientsRepository.getAll();
  }

  getById(id) {
    return patientsRepository.getById(id);
  }

  validatePatientData(patientData, isUpdate = false) {
    const errors = [];
    
    // Required fields
    if (!patientData.name) errors.push('Name is required');
    if (!isUpdate && !patientData.dateOfBirth) errors.push('Date of Birth is required');
    if (!patientData.contact) errors.push('Contact number is required');
    
    // Field type validations
    if (patientData.age && !Number.isInteger(patientData.age)) errors.push('Age must be a number');
    if (patientData.gender && ![0, 1, 2].includes(patientData.gender)) errors.push('Invalid gender value');
    if (patientData.email && !patientData.email.includes('@')) errors.push('Invalid email format');
    if (patientData.alternateContactNumber && typeof patientData.alternateContactNumber !== 'number') {
      errors.push('Alternate contact number must be a number');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join('; '));
    }
  }

  create(patientData) {
    // this.validatePatientData(patientData);
    
    // Set default values for dates if not provided
    if (!patientData.registrationDate) {
      patientData.registrationDate = new Date().toISOString();
    }
    if (!patientData.lastVisitDate) {
      patientData.lastVisitDate = patientData.registrationDate;
    }
    
    return patientsRepository.create(patientData);
  }

  update(id, patientData) {
    this.validatePatientData(patientData, true);
    return patientsRepository.update(id, patientData);
  }

  delete(id) {
    return patientsRepository.delete(id);
  }

  search(query) {
    return patientsRepository.search(query);
  }
}

module.exports = new PatientsService();
