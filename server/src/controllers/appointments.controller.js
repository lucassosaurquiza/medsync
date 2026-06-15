const pool = require("../config/db");

// CREAR TURNO

const createAppointment = async (req, res) => {
  const {
    specialistId,
    patientId,
    date,
    time,
    healthInsurance,
    reason
  } = req.body

  try {
    const [result] = await pool.query(
      `
      INSERT INTO appointments
      (
        specialistId,
        patientId,
        date,
        time,
        healthInsurance,
        reason,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        specialistId,
        patientId,
        date,
        time,
        healthInsurance || null,
        reason || null,
        'pending'
      ]
    )

    res.status(201).json({
      message: 'Turno creado',
      id: result.insertId
    })
  } catch (error) {
    console.error('Error al crear turno:', error)

    res.status(500).json({
      message: 'Error al crear turno'
    })
  }
}

// BUSCAR UN TURNO

const getAppointments = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        appointments.id,
        specialist_user.name AS specialist,
        specialists.specialty,
        patient_user.name AS patient,
        appointments.date,
        appointments.time,
        appointments.status,
        appointments.healthInsurance,
        appointments.reason,
        patients.dni,
        patients.phone,
        patient_user.lastName AS patientLastName,
        specialist_user.lastName AS specialistLastName
      FROM appointments
      JOIN specialists ON appointments.specialistId = specialists.id
      JOIN users AS specialist_user ON specialists.userId = specialist_user.id
      JOIN patients ON appointments.patientId = patients.id
      JOIN users AS patient_user ON patients.userId = patient_user.id
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener turnos:", error);
    res.status(500).json({
      message: "Error al obtener turnos"
    });
  }
};

// BUSCAR TURNO POR ID

const getAppointmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        appointments.id,
        specialist_user.name AS specialist,
        specialists.specialty,
        patient_user.name AS patient,
        appointments.date,
        appointments.time,
        appointments.status,
        appointments.healthInsurance,
        appointments.reason,
        patients.dni,
        patients.phone,
        patient_user.lastName AS patientLastName,
        specialist_user.lastName AS specialistLastName
      FROM appointments
      JOIN specialists ON appointments.specialistId = specialists.id
      JOIN users AS specialist_user ON specialists.userId = specialist_user.id
      JOIN patients ON appointments.patientId = patients.id
      JOIN users AS patient_user ON patients.userId = patient_user.id
      WHERE appointments.id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el turno" });
  }
};

// ACTUALIZAR TURNO

const updateAppointment = async (req, res) => {
  const { id } = req.params;

  const {
    specialistId,
    patientId,
    date,
    time,
    status
  } = req.body;

  try {
    const [result] = await pool.query(
      `
      UPDATE appointments
      SET
        specialistId = ?,
        patientId = ?,
        date = ?,
        time = ?,
        status = ?
      WHERE id = ?
      `,
      [
        specialistId,
        patientId,
        date,
        time,
        status,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Turno no encontrado"
      });
    }

    res.json({
      message: "Turno actualizado correctamente"
    });
  } catch (error) {
    console.error("Error al actualizar turno:", error);

    res.status(500).json({
      message: "Error al actualizar turno"
    });
  }
};

// ELIMINAR TURNO

const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM appointments WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Turno no encontrado"
      });
    }

    res.json({
      message: "Turno eliminado correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar turno:", error);

    res.status(500).json({
      message: "Error al eliminar turno"
    });
  }
};


module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
};