const express = require('express');
const patientsController = require('./patients.controller');

const router = express.Router();

router.get('/search', patientsController.search);
router.get('/', patientsController.getAll);
router.get('/:id', patientsController.getById);
router.post('/', patientsController.create);
router.put('/:id', patientsController.update);
router.delete('/:id', patientsController.delete);

module.exports = router;
