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

// MIS TURNOS (PACIENTE LOGUEADO)

const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id

    const [patientRows] = await pool.query(
      `
      SELECT id
      FROM patients
      WHERE userId = ?
      `,
      [userId]
    )

    if (patientRows.length === 0) {
      return res.status(404).json({
        message: 'Paciente no encontrado'
      })
    }

    const patientId = patientRows[0].id

    const [rows] = await pool.query(
      `
      SELECT
        appointments.id,
        appointments.date,
        appointments.time,
        appointments.status,
        specialists.specialty,
        specialist_user.name,
        specialist_user.lastName
      FROM appointments
      JOIN specialists ON appointments.specialistId = specialists.id
      JOIN users AS specialist_user ON specialists.userId = specialist_user.id
      WHERE appointments.patientId = ?
      ORDER BY appointments.date DESC
      `,
      [patientId]
    )

    res.json(rows)
  } catch (error) {
    console.error('Error al obtener mis turnos:', error)

    res.status(500).json({
      message: 'Error al obtener mis turnos'
    })
  }
}

// ACTUALIZAR TURNO

const updateAppointment = async (req, res) => {
  const { id } = req.params

  const { status } = req.body

  try {
    const [appointmentRows] = await pool.query(
      `
      SELECT
        appointments.id,
        appointments.date,
        appointments.time,
        appointments.status,
        patients.userId AS patientUserId,
        specialist_user.name AS specialistName,
        specialist_user.lastName AS specialistLastName
      FROM appointments
      JOIN patients ON appointments.patientId = patients.id
      JOIN specialists ON appointments.specialistId = specialists.id
      JOIN users AS specialist_user ON specialists.userId = specialist_user.id
      WHERE appointments.id = ?
      `,
      [id]
    )

    if (appointmentRows.length === 0) {
      return res.status(404).json({
        message: 'Turno no encontrado'
      })
    }

    const appointment = appointmentRows[0]

    const [result] = await pool.query(
      `
      UPDATE appointments
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Turno no encontrado'
      })
    }

    if (status === 'confirmed' || status === 'cancelled') {
      const notificationTitle =
        status === 'confirmed'
          ? 'Turno confirmado'
          : 'Turno cancelado'

      const notificationMessage =
        status === 'confirmed'
          ? `Tu turno con ${appointment.specialistName} ${appointment.specialistLastName} fue confirmado.`
          : `Tu turno con ${appointment.specialistName} ${appointment.specialistLastName} fue cancelado.`

      const notificationType =
        status === 'confirmed'
          ? 'success'
          : 'error'

      await pool.query(
        `
        INSERT INTO notifications
        (
          userId,
          title,
          message,
          type
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          appointment.patientUserId,
          notificationTitle,
          notificationMessage,
          notificationType
        ]
      )
    }

    res.json({
      message: 'Turno actualizado correctamente'
    })
  } catch (error) {
    console.error('Error al actualizar turno:', error)

    res.status(500).json({
      message: 'Error al actualizar turno'
    })
  }
}

// CANCELAR TURNO

const cancelMyAppointment = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const [appointmentRows] = await pool.query(
      `
      SELECT
        appointments.id,
        appointments.status,
        patients.userId
      FROM appointments
      JOIN patients ON appointments.patientId = patients.id
      WHERE appointments.id = ?
      `,
      [id]
    )

    if (appointmentRows.length === 0) {
      return res.status(404).json({
        message: 'Turno no encontrado'
      })
    }

    const appointment = appointmentRows[0]

    if (appointment.userId !== userId) {
      return res.status(403).json({
        message: 'No tenés permiso para cancelar este turno'
      })
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        message: 'El turno ya está cancelado'
      })
    }

    await pool.query(
      `
      UPDATE appointments
      SET status = 'cancelled'
      WHERE id = ?
      `,
      [id]
    )

    res.json({
      message: 'Turno cancelado correctamente'
    })
  } catch (error) {
    console.error('Error al cancelar turno:', error)

    res.status(500).json({
      message: 'Error al cancelar turno'
    })
  }
}

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
  deleteAppointment,
  getMyAppointments,
  cancelMyAppointment
};