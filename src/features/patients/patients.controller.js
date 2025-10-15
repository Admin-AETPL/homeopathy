 const patientsService = require('./patients.service');

class PatientsController {
  async getAll(req, res) {
    try {
      const patients = await patientsService.getAll();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const patient = await patientsService.getById(req.params.id);
      if (patient) {
        res.json(patient);
      } else {
        res.status(404).json({ message: 'Patient not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const patientData = {
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender,
        contact: req.body.contact,
        address: req.body.address,
        dateOfBirth: req.body.dateOfBirth,
        bloodGroup: req.body.bloodGroup,
        maritalStatus: req.body.maritalStatus,
        occupation: req.body.occupation,
        alternateContactNumber: req.body.alternateContactNumber,
        email: req.body.email,
        allergies: req.body.allergies,
        chronicDiseases: req.body.chronicDiseases,
        familyHistory: req.body.familyHistory,
        pastMedicalHistory: req.body.pastMedicalHistory,
        lifestyle: req.body.lifestyle,
        registrationDate: req.body.registrationDate,
        lastVisitDate: req.body.lastVisitDate
      };

      const patient = await patientsService.create(patientData);
      res.status(201).json(patient);
    } catch (error) {
      res.status(400).json({ 
        message: error.message,
        errors: error.message.split('; ')
      });
    }
  }

  async update(req, res) {
    try {
      const patientData = {
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender,
        contact: req.body.contact,
        address: req.body.address,
        dateOfBirth: req.body.dateOfBirth,
        bloodGroup: req.body.bloodGroup,
        maritalStatus: req.body.maritalStatus,
        occupation: req.body.occupation,
        alternateContactNumber: req.body.alternateContactNumber,
        email: req.body.email,
        allergies: req.body.allergies,
        chronicDiseases: req.body.chronicDiseases,
        familyHistory: req.body.familyHistory,
        pastMedicalHistory: req.body.pastMedicalHistory,
        lifestyle: req.body.lifestyle,
        registrationDate: req.body.registrationDate,
        lastVisitDate: req.body.lastVisitDate
      };

      const patient = await patientsService.update(req.params.id, patientData);
      res.json(patient);
    } catch (error) {
      res.status(400).json({ 
        message: error.message,
        errors: error.message.split('; ')
      });
    }
  }

  async delete(req, res) {
    try {
      await patientsService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async search(req, res) {
    try {
      const patients = await patientsService.search(req.query.q);
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new PatientsController();
