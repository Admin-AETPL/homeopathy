const express = require('express');
const usersController = require('./users.controller');

const router = express.Router();

router.get('/', usersController.getAll);
router.post('/', usersController.create);

module.exports = router;
