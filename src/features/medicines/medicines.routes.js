const express = require('express');
const medicinesService = require('./medicines.service');
const router = express.Router();

// Get medicines with filters and pagination
router.get('/', async (req, res) => {
  try {
    const { name, category, potency, page = 1, limit = 10 } = req.query;
    const filters = { name, category, potency };
    const medicines = await medicinesService.getMedicines(filters, parseInt(page), parseInt(limit));
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

// Get medicine by ID
router.get('/:id', async (req, res) => {
  try {
    const medicine = await medicinesService.getMedicineById(req.params.id);
    res.json(medicine);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Get medicines by category
router.get('/category/:category', async (req, res) => {
  try {
    const medicines = await medicinesService.getMedicinesByCategory(req.params.category);
    res.json(medicines);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get medicines by potency
router.get('/potency/:potency', async (req, res) => {
  try {
    const medicines = await medicinesService.getMedicinesByPotency(req.params.potency);
    res.json(medicines);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await medicinesService.getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all potencies
router.get('/meta/potencies', async (req, res) => {
  try {
    const potencies = await medicinesService.getPotencies();
    res.json(potencies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
