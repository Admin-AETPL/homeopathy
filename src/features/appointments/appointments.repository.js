const databaseManager = require('../../core/database-manager');

class AppointmentsRepository {
  constructor() {
    this.dbManager = databaseManager;
    this.dbManager.getConnection();
  }

  async create(appointment) {
    try {
      const query = `
        INSERT INTO bookAppointment (
          patientId,
          appointmentDate,
          appointmentTime,
          durationMinutes,
          appointmentType,
          chiefComplaint,
          additionalNotes,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;
      
      const params = [
        appointment.patientId,
        appointment.appointmentDate,
        appointment.appointmentTime,
        appointment.durationMinutes,
        appointment.appointmentType,
        appointment.chiefComplaint,
        appointment.additionalNotes
      ];

      console.log(query);
      console.log(params);

      const result = await this.dbManager.run(query, params);
      
      // Fetch the created appointment
      const createdAppointment = await this.getById(result.lastID);
      return createdAppointment;
    } catch (err) {
      throw new Error(`Failed to create appointment: ${err.message}`);
    }
  }

  async getAll() {
    try {
      const query = `
        SELECT a.*, p.name as patient_name 
        FROM bookAppointment a
        LEFT JOIN patients p ON a.patientId = p.id
        ORDER BY a.appointmentDate, a.appointmentTime
      `;
      
      const rows = await this.dbManager.all(query);
      return rows;
    } catch (err) {
      throw new Error(`Failed to get all appointments: ${err.message}`);
    }
  }

  async getById(id) {
    try {
      const query = `
        SELECT a.*, p.name as patient_name 
        FROM bookAppointment a
        LEFT JOIN patients p ON a.patientId = p.id
        WHERE a.id = ?
      `;
      
      const row = await this.dbManager.get(query, [id]);
      return row;
    } catch (err) {
      throw new Error(`Failed to get appointment by id: ${err.message}`);
    }
  }

  async update(id, appointment) {
    try {
      const query = `
        UPDATE bookAppointment 
        SET patientId = ?,
            appointmentDate = ?,
            appointmentTime = ?,
            durationMinutes = ?,
            appointmentType = ?,
            chiefComplaint = ?,
            additionalNotes = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `;
      
      const params = [
        appointment.patientId,
        appointment.appointmentDate,
        appointment.appointmentTime,
        appointment.durationMinutes,
        appointment.appointmentType,
        appointment.chiefComplaint,
        appointment.additionalNotes,
        id
      ];

      await this.dbManager.run(query, params);
      
      // Fetch the updated appointment
      const updatedAppointment = await this.getById(id);
      return updatedAppointment;
    } catch (err) {
      throw new Error(`Failed to update appointment: ${err.message}`);
    }
  }

  async delete(id) {
    try {
      const query = 'DELETE FROM bookAppointment WHERE id = ?';
      await this.dbManager.run(query, [id]);
      return { id };
    } catch (err) {
      throw new Error(`Failed to delete appointment: ${err.message}`);
    }
  }
}

module.exports = new AppointmentsRepository();
