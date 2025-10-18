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
        SELECT DISTINCT
          r.id,
          r.url,
          s1.section_text as name,
          s2.id as section_id,
          s2.section_name,
          s2.section_text
        FROM remedies r
        LEFT JOIN sections s1 ON r.id = s1.remedy_id AND s1.section_name = 'Remedy'
        LEFT JOIN sections s2 ON r.id = s2.remedy_id
        WHERE s1.section_text LIKE ?
        OR s2.section_text LIKE ?
        OR s2.section_name LIKE ?
        ORDER BY r.id, s2.section_name
      `;
      const params = Array(3).fill(`%${searchTerm}%`);
      const results = await this.dbManager.all(query, params);

      // Group results by remedy
      const remedyMap = new Map();
      
      results.forEach(row => {
        if (!remedyMap.has(row.id)) {
          remedyMap.set(row.id, {
            id: row.id,
            url: row.url,
            name: row.name,
            sections: []
          });
        }

        if (row.section_id && row.section_name !== 'Remedy') {
          remedyMap.get(row.id).sections.push({
            id: row.section_id,
            section_name: row.section_name,
            section_text: row.section_text
          });
        }
      });

      return Array.from(remedyMap.values());
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
      const query = `
        SELECT 
          r.id,
          r.url,
          s1.section_text as name,
          s2.id as section_id,
          s2.section_name,
          s2.section_text
        FROM remedies r
        LEFT JOIN sections s1 ON r.id = s1.remedy_id AND s1.section_name = 'Remedy'
        LEFT JOIN sections s2 ON r.id = s2.remedy_id
        WHERE r.id = ?
        ORDER BY s2.section_name
      `;

      const results = await this.dbManager.all(query, [id]);
      
      if (results.length === 0) {
        return null;
      }

      // Transform into our standard format
      const medicine = {
        id: results[0].id,
        url: results[0].url,
        name: results[0].name,
        sections: []
      };

      results.forEach(row => {
        if (row.section_id && row.section_name !== 'Remedy') {
          medicine.sections.push({
            id: row.section_id,
            section_name: row.section_name,
            section_text: row.section_text
          });
        }
      });

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
  async filterBySection(sectionName, sectionText = '') {
    try {
      const query = `
        SELECT DISTINCT
          r.id,
          r.url,
          s1.section_text as name,
          s2.id as section_id,
          s2.section_name,
          s2.section_text
        FROM remedies r
        LEFT JOIN sections s1 ON r.id = s1.remedy_id AND s1.section_name = 'Remedy'
        LEFT JOIN sections s2 ON r.id = s2.remedy_id
        WHERE s2.section_name = ?
        ${sectionText ? 'AND s2.section_text LIKE ?' : ''}
        ORDER BY r.id, s2.section_name
      `;
      
      const params = sectionText 
        ? [sectionName, `%${sectionText}%`]
        : [sectionName];

      const results = await this.dbManager.all(query, params);

      // Group results by remedy
      const remedyMap = new Map();
      
      results.forEach(row => {
        if (!remedyMap.has(row.id)) {
          remedyMap.set(row.id, {
            id: row.id,
            url: row.url,
            name: row.name,
            sections: []
          });
        }

        if (row.section_id && row.section_name !== 'Remedy') {
          remedyMap.get(row.id).sections.push({
            id: row.section_id,
            section_name: row.section_name,
            section_text: row.section_text
          });
        }
      });

      return Array.from(remedyMap.values());
    } catch (err) {
      throw new Error(`Failed to filter medicines by section: ${err.message}`);
    }
  }

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

  /**
   * Get sections with their associated remedy information
   * @param {number} [remedyId] - Optional remedy ID to filter sections
   * @returns {Promise<Array>}
   */
  async getSectionsWithRemedies(remedyId) {
    try {
      let query = `
        SELECT 
          s.*, 
          r.url as remedy_url,
          r.id as remedy_id 
        FROM sections s 
        JOIN remedies r ON s.remedy_id = r.id
      `;
      const params = [];

      if (remedyId) {
        query += ' WHERE s.remedy_id = ?';
        params.push(remedyId);
      }

      query += ' ORDER BY r.id, s.section_name';

      return await this.dbManager.all(query, params);
    } catch (err) {
      throw new Error(`Failed to get sections with remedies: ${err.message}`);
    }
  }
}

module.exports = new MedicinesRepository();
