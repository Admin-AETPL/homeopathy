const databaseManager = require('../../core/database-manager');

class PatientsRepository {
  constructor() {
    this.dbManager = databaseManager;
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

  async create({ name, age, gender, contact, address }) {
    try {
      const result = await this.dbManager.run(
        'INSERT INTO patients (name, age, gender, contact, address) VALUES (?, ?, ?, ?, ?)', 
        [name, age, gender, contact, address]
      );
      return { id: result.lastID, name, age, gender, contact, address };
    } catch (err) {
      throw new Error(`Failed to create patient: ${err.message}`);
    }
  }

  async update(id, { name, age, gender, contact, address }) {
    try {
      await this.dbManager.run(
        'UPDATE patients SET name = ?, age = ?, gender = ?, contact = ?, address = ? WHERE id = ?', 
        [name, age, gender, contact, address, id]
      );
      return { id, name, age, gender, contact, address };
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
      const rows = await this.dbManager.all('SELECT * FROM patients WHERE name LIKE ?', [`%${query}%`]);
      return rows;
    } catch (err) {
      throw new Error(`Failed to search patients: ${err.message}`);
    }
  }
}

module.exports = new PatientsRepository();
