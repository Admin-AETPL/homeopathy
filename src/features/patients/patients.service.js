const patientsRepository = require('./patients.repository');

class PatientsService {
  getAll() {
    return patientsRepository.getAll();
  }

  getById(id) {
    return patientsRepository.getById(id);
  }

  create({ name, age, gender, contact, address }) {
    if (!name) {
      throw new Error('Name is required');
    }
    return patientsRepository.create({ name, age, gender, contact, address });
  }

  update(id, { name, age, gender, contact, address }) {
    if (!name) {
      throw new Error('Name is required');
    }
    return patientsRepository.update(id, { name, age, gender, contact, address });
  }

  delete(id) {
    return patientsRepository.delete(id);
  }

  search(query) {
    return patientsRepository.search(query);
  }
}

module.exports = new PatientsService();
