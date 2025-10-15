const databaseManager = require('../../core/database-manager');

class MedicinesRepository {
  constructor() {
    this.dbManager = databaseManager;
    this.dbManager.getConnection();
  }

  /**
   * Get all medicines with optional filtering
   * @param {Object} filters - Filter criteria
   * @param {string} filters.name - Filter by medicine name
   * @param {string} filters.potency - Filter by potency
   * @param {string} filters.category - Filter by category
   * @param {number} page - Page number for pagination
   * @param {number} limit - Number of items per page
   * @returns {Promise<Array>}
   */
  async getAll(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM remedies WHERE 1=1';
      const params = [];

      // Add filters if provided
      if (filters.name) {
        query += ' AND name LIKE ?';
        params.push(`%${filters.name}%`);
      }
      if (filters.potency) {
        query += ' AND potency = ?';
        params.push(filters.potency);
      }
      if (filters.category) {
        query += ' AND category = ?';
        params.push(filters.category);
      }

      // Add pagination
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const rows = await this.dbManager.all(query, params);
      return rows;
    } catch (err) {
      throw new Error(`Failed to get medicines: ${err.message}`);
    }
  }

  /**
   * Search medicines by name or symptoms
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>}
   */
  async search(searchTerm) {
    try {
      const query = `
        SELECT * FROM remedies 
        WHERE name LIKE ? 
        OR symptoms LIKE ? 
        OR indications LIKE ?
      `;
      const params = Array(3).fill(`%${searchTerm}%`);
      return await this.dbManager.all(query, params);
    } catch (err) {
      throw new Error(`Failed to search medicines: ${err.message}`);
    }
  }

  /**
   * Get medicine by ID
   * @param {number} id - Medicine ID
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const medicine = await this.dbManager.get(
        'SELECT * FROM remedies WHERE id = ?',
        [id]
      );
      return medicine;
    } catch (err) {
      throw new Error(`Failed to get medicine by id: ${err.message}`);
    }
  }

  /**
   * Get medicines by category
   * @param {string} category - Medicine category
   * @returns {Promise<Array>}
   */
  async getByCategory(category) {
    try {
      return await this.dbManager.all(
        'SELECT * FROM remedies WHERE category = ?',
        [category]
      );
    } catch (err) {
      throw new Error(`Failed to get medicines by category: ${err.message}`);
    }
  }

  /**
   * Get medicines by potency
   * @param {string} potency - Medicine potency
   * @returns {Promise<Array>}
   */
  async getByPotency(potency) {
    try {
      return await this.dbManager.all(
        'SELECT * FROM remedies WHERE potency = ?',
        [potency]
      );
    } catch (err) {
      throw new Error(`Failed to get medicines by potency: ${err.message}`);
    }
  }

  /**
   * Get available categories
   * @returns {Promise<Array>}
   */
  async getCategories() {
    try {
      return await this.dbManager.all(
        'SELECT DISTINCT category FROM remedies ORDER BY category'
      );
    } catch (err) {
      throw new Error(`Failed to get categories: ${err.message}`);
    }
  }

  /**
   * Get available potencies
   * @returns {Promise<Array>}
   */
  async getPotencies() {
    try {
      return await this.dbManager.all(
        'SELECT DISTINCT potency FROM remedies ORDER BY potency'
      );
    } catch (err) {
      throw new Error(`Failed to get potencies: ${err.message}`);
    }
  }
}

module.exports = new MedicinesRepository();
