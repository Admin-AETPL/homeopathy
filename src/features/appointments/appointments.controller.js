const appointmentsService = require('./appointments.service');

const appointmentsController = {
    create: async (req, res) => {
        try {
            const appointmentData = {
                patientId: req.body.patientId,
                appointmentDate: req.body.appointmentDate,
                appointmentTime: req.body.appointmentTime,
                durationMinutes: req.body.durationMinutes || 30,
                appointmentType: req.body.appointmentType,
                chiefComplaint: req.body.chiefComplaint,
                additionalNotes: req.body.additionalNotes
            };

            console.log(appointmentData);

            const appointment = await appointmentsService.createAppointment(appointmentData);
            res.status(201).json(appointment);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    getAll: async (req, res) => {
        try {
            const appointments = await appointmentsService.getAllAppointments();
            res.json(appointments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    getById: async (req, res) => {
        try {
            const appointment = await appointmentsService.getAppointmentById(req.params.id);
            res.json(appointment);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const appointmentData = {
                patientId: req.body.patientId,
                appointmentDate: req.body.appointmentDate,
                appointmentTime: req.body.appointmentTime,
                durationMinutes: req.body.durationMinutes,
                appointmentType: req.body.appointmentType,
                chiefComplaint: req.body.chiefComplaint,
                additionalNotes: req.body.additionalNotes
            };

            const appointment = await appointmentsService.updateAppointment(req.params.id, appointmentData);
            res.json(appointment);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    delete: async (req, res) => {
        try {
            const result = await appointmentsService.deleteAppointment(req.params.id);
            res.json(result);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
};

module.exports = appointmentsController;
