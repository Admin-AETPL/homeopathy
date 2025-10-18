const express = require('express');
const medicinesService = require('./medicines.service');
const router = express.Router();

// Get all medicines with pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const medicines = await medicinesService.getMedicines({}, parseInt(page), parseInt(limit));
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search medicines
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const results = await medicinesService.searchMedicines(q);
    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Filter medicines by section
router.get('/filter', async (req, res) => {
  try {
    const { section_name, section_text } = req.query;
    const medicines = await medicinesService.filterBySection(section_name, section_text);
    res.json(medicines);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get sections with remedy information
router.get('/sections', async (req, res) => {
  try {
    const { remedyId } = req.query;
    const sections = await medicinesService.getSections(remedyId ? parseInt(remedyId) : null);
    res.json(sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get medicine by ID (must be last)
router.get('/:id', async (req, res) => {
  try {
    const medicine = await medicinesService.getMedicineById(req.params.id);
    res.json(medicine);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

module.exports = router;
