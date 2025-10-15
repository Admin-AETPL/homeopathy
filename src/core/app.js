const express = require('express');
const usersRoutes = require('../features/users/users.routes');
const patientsRoutes = require('../features/patients/patients.routes');
const medicinesRoutes = require('../features/medicines/medicines.routes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/users', usersRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/medicines', medicinesRoutes);

module.exports = app;
