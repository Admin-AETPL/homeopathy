const appointmentsRepository = require('./appointments.repository');

const appointmentsService = {
    createAppointment: async (appointmentData) => {
        try {
            // Validate required fields
            if (!appointmentData.patientId || !appointmentData.appointmentDate || 
                !appointmentData.appointmentTime || !appointmentData.durationMinutes ||
                !appointmentData.appointmentType) {
                throw new Error('Missing required appointment fields');
            }
            console.log(appointmentData);

            // Create appointment - repository.create() now returns the full appointment object
            const appointment = await appointmentsRepository.create(appointmentData);
            return appointment;
        } catch (error) {
            throw error;
        }
    },

    getAllAppointments: async () => {
        try {
            return await appointmentsRepository.getAll();
        } catch (error) {
            throw error;
        }
    },

    getAppointmentById: async (id) => {
        try {
            const appointment = await appointmentsRepository.getById(id);
            if (!appointment) {
                throw new Error('Appointment not found');
            }
            return appointment;
        } catch (error) {
            throw error;
        }
    },

    updateAppointment: async (id, appointmentData) => {
        try {
            const appointment = await appointmentsRepository.getById(id);
            if (!appointment) {
                throw new Error('Appointment not found');
            }

            await appointmentsRepository.update(id, appointmentData);
            return await appointmentsRepository.getById(id);
        } catch (error) {
            throw error;
        }
    },

    deleteAppointment: async (id) => {
        try {
            const appointment = await appointmentsRepository.getById(id);
            if (!appointment) {
                throw new Error('Appointment not found');
            }

            await appointmentsRepository.delete(id);
            return { message: 'Appointment deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = appointmentsService;
