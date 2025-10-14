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
      const patient = await patientsService.create(req.body);
      res.status(201).json(patient);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const patient = await patientsService.update(req.params.id, req.body);
      res.json(patient);
    } catch (error) {
      res.status(400).json({ message: error.message });
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
