const express = require('express');
const usersRoutes = require('../features/users/users.routes');
const patientsRoutes = require('../features/patients/patients.routes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/users', usersRoutes);
app.use('/api/patients', patientsRoutes);

module.exports = app;
