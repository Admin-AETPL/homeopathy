const databaseManager = require('../../core/database-manager');

class UsersRepository {
  constructor() {
    this.dbManager = databaseManager;
  }

  async getAll() {
    try {
      const rows = await this.dbManager.all('SELECT * FROM users');
      return rows;
    } catch (err) {
      throw new Error(`Failed to get all users: ${err.message}`);
    }
  }

  async create({ name, email }) {
    try {
      const result = await this.dbManager.run(
        'INSERT INTO users (name, email) VALUES (?, ?)', 
        [name, email]
      );
      return { id: result.lastID, name, email };
    } catch (err) {
      throw new Error(`Failed to create user: ${err.message}`);
    }
  }
}

module.exports = new UsersRepository();
