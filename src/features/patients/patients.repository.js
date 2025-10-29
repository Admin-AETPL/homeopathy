const databaseManager = require('../../core/database-manager');

class PatientsRepository {
  constructor() {
    this.dbManager = databaseManager;
    this.dbManager.getConnection();
  }

  async getAll() {
    try {
      const rows = await this.dbManager.all('SELECT * FROM patients');
      return rows;
    } catch (err) {
      throw new Error(`Failed to get all patients: ${err.message}`);
    }
  }

  async getById(id) {
    try {
      const row = await this.dbManager.get('SELECT * FROM patients WHERE id = ?', [id]);
      return row;
    } catch (err) {
      throw new Error(`Failed to get patient by id: ${err.message}`);
    }
  }

  async create(patientData) {
    try {
      const fields = [
        'name', 'age', 'gender', 'contact', 'address', 'dateOfBirth',
        'bloodGroup', 'maritalStatus', 'occupation', 'alternateContactNumber',
        'email', 'allergies', 'chronicDiseases', 'familyHistory',
        'pastMedicalHistory', 'lifestyle', 'registrationDate', 'lastVisitDate',
        'doctorNotes', 'status', 'constitutionalType', 'miasmaticBackground',
        'mentals', 'modalities', 'physicals', 'visits'
      ];
      
      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map(field => patientData[field]);
      
      const result = await this.dbManager.run(
        `INSERT INTO patients (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      return { id: result.lastID, ...patientData };
    } catch (err) {
      throw new Error(`Failed to create patient: ${err.message}`);
    }
  }

  async update(id, patientData) {
    try {
      const fields = [
        'name', 'age', 'gender', 'contact', 'address', 'dateOfBirth',
        'bloodGroup', 'maritalStatus', 'occupation', 'alternateContactNumber',
        'email', 'allergies', 'chronicDiseases', 'familyHistory',
        'pastMedicalHistory', 'lifestyle', 'registrationDate', 'lastVisitDate',
        'doctorNotes', 'status', 'constitutionalType', 'miasmaticBackground',
        'mentals', 'modalities', 'physicals', 'visits'
      ];
      
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = [...fields.map(field => patientData[field]), id];
      
      await this.dbManager.run(
        `UPDATE patients SET ${setClause} WHERE id = ?`,
        values
      );
      
      return { id, ...patientData };
    } catch (err) {
      throw new Error(`Failed to update patient: ${err.message}`);
    }
  }

  async delete(id) {
    try {
      await this.dbManager.run('DELETE FROM patients WHERE id = ?', [id]);
      return { id };
    } catch (err) {
      throw new Error(`Failed to delete patient: ${err.message}`);
    }
  }

  async search(query) {
    try {
      console.log(query);
      const rows = await this.dbManager.all(
        'SELECT * FROM patients WHERE id = ? OR name LIKE ?',
        [query, `%${query}%`]
      );
      return rows;
    } catch (err) {
      throw new Error(`Failed to search patients: ${err.message}`);
    }
  }
}

module.exports = new PatientsRepository();
