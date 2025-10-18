const medicinesRepository = require('./medicines.repository');

class MedicinesService {
  /**
   * Get medicines with pagination
   */
  async getMedicines(filters = {}, page = 1, limit = 10) {
    const remedies = await medicinesRepository.getAll(filters, page, limit);
    const sectionsData = await medicinesRepository.getSectionsWithRemedies();
    
    // Map sections to their respective remedies with restructured format
    const remediesWithSections = remedies.map(remedy => {
      const sections = sectionsData.filter(section => section.remedy_id === remedy.id);
      
      // Find the Remedy section to get the medicine name
      const remedySection = sections.find(s => s.section_name === 'Remedy');
      
      // Filter out Remedy section and clean up section objects
      const cleanedSections = sections
        .filter(s => s.section_name !== 'Remedy')
        .map(s => ({
          id: s.id,
          section_name: s.section_name,
          section_text: s.section_text
        }));

      return {
        id: remedy.id,
        url: remedy.url,
        name: remedySection ? remedySection.section_text : '',
        sections: cleanedSections
      };
    });

    return remediesWithSections;
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
   * Filter medicines by section name and optional text
   */
  async filterBySection(sectionName, sectionText) {
    if (!sectionName) {
      throw new Error('Section name is required');
    }
    return medicinesRepository.filterBySection(sectionName, sectionText);
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

  /**
   * Get sections with their associated remedy information
   */
  async getSections(remedyId) {
    return medicinesRepository.getSectionsWithRemedies(remedyId);
  }
}

module.exports = new MedicinesService();
