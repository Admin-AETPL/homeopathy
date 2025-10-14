const medicinesRepository = require('./medicines.repository');

class MedicinesService {
  /**
   * Get medicines with filtering and pagination
   */
  async getMedicines(filters = {}, page = 1, limit = 10) {
    return medicinesRepository.getAll(filters, page, limit);
  }

  /**
   * Search medicines by term
   */
  async searchMedicines(searchTerm) {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }
    return medicinesRepository.search(searchTerm.trim());
  }

  /**
   * Get medicine by ID
   */
  async getMedicineById(id) {
    if (!id) {
      throw new Error('Medicine ID is required');
    }
    const medicine = await medicinesRepository.getById(id);
    if (!medicine) {
      throw new Error('Medicine not found');
    }
    return medicine;
  }

  /**
   * Get medicines by category
   */
  async getMedicinesByCategory(category) {
    if (!category) {
      throw new Error('Category is required');
    }
    return medicinesRepository.getByCategory(category);
  }

  /**
   * Get medicines by potency
   */
  async getMedicinesByPotency(potency) {
    if (!potency) {
      throw new Error('Potency is required');
    }
    return medicinesRepository.getByPotency(potency);
  }

  /**
   * Get all available categories
   */
  async getCategories() {
    return medicinesRepository.getCategories();
  }

  /**
   * Get all available potencies
   */
  async getPotencies() {
    return medicinesRepository.getPotencies();
  }
}

module.exports = new MedicinesService();
