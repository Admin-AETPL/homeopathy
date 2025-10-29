const express = require('express');
const usersRoutes = require('../features/users/users.routes');
const patientsRoutes = require('../features/patients/patients.routes');
const medicinesRoutes = require('../features/medicines/medicines.routes');
const appointmentsRoutes = require('../features/appointments/appointments.routes');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/users', usersRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/appointments', appointmentsRoutes);

module.exports = app;
