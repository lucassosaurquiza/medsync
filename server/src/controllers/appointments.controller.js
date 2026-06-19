const pool = require("../config/db");
const {
  AvailabilityError,
  getArgentinaNow,
  getAvailabilityForDate,
  normalizeTime
} = require('../services/availability.service')

// CREAR TURNO

const createAppointment = async (req, res) => {
  const { specialistId, date, time, healthInsurance, reason } = req.body
  const normalizedSpecialistId = Number(specialistId)
  const normalizedTime = normalizeTime(time)

  if (
    !Number.isInteger(normalizedSpecialistId) ||
    normalizedSpecialistId <= 0 ||
    !date ||
    !normalizedTime
  ) {
    return res.status(400).json({
      message: 'Especialista, fecha y horario son obligatorios'
    })
  }

  let connection
  let transactionStarted = false

  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [patientRows] = await connection.query(
      `
      SELECT
        patients.id,
        users.name,
        users.lastName
      FROM patients
      JOIN users ON patients.userId = users.id
      WHERE patients.userId = ?
      `,
      [req.user.id]
    )

    if (patientRows.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        message: 'Paciente no encontrado'
      })
    }

    const [specialistRows] = await connection.query(
      `
      SELECT
        specialists.userId,
        users.name,
        users.lastName
      FROM specialists
      JOIN users ON specialists.userId = users.id
      WHERE specialists.id = ?
      FOR UPDATE
      `,
      [normalizedSpecialistId]
    )

    if (specialistRows.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        message: 'Especialista no encontrado'
      })
    }

    const patient = patientRows[0]
    const specialist = specialistRows[0]

    let availability

    try {
      availability = await getAvailabilityForDate(
        connection,
        normalizedSpecialistId,
        date
      )
    } catch (error) {
      if (error instanceof AvailabilityError) {
        await connection.rollback()
        transactionStarted = false

        return res.status(error.statusCode).json({
          message: error.message
        })
      }

      throw error
    }

    const selectedSlot = availability.slots.find(slot => (
      slot.time === normalizedTime
    ))

    if (!selectedSlot?.available) {
      await connection.rollback()
      transactionStarted = false

      return res.status(409).json({
        message: 'Ese horario no esta disponible'
      })
    }

    const [result] = await connection.query(
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
        normalizedSpecialistId,
        patient.id,
        date,
        normalizedTime,
        healthInsurance || null,
        reason || null,
        'pending'
      ]
    )

    const patientName = `${patient.name} ${patient.lastName}`

    await connection.query(
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
        specialist.userId,
        'Nueva solicitud de turno',
        `${patientName} solicitó un turno para el ${date} a las ${normalizedTime}.`,
        'info'
      ]
    )

    await connection.commit()
    transactionStarted = false

    res.status(201).json({
      message: 'Turno creado',
      id: result.insertId
    })
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback()
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Ese horario ya no está disponible'
      })
    }

    console.error('Error al crear turno:', error)

    res.status(500).json({
      message: 'Error al crear turno'
    })
  } finally {
    connection?.release()
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

// TRAER LOS TURNOS DEL ESPECIALISTA

const getSpecialistAppointments = async (req, res) => {
  const userId = req.user.id


  try {
    const [specialistRows] = await pool.query(
      `
      SELECT id
      FROM specialists
      WHERE userId = ?
      `,
      [userId]
    )

    if (specialistRows.length === 0) {
      return res.status(404).json({
        message: 'Especialista no encontrado'
      })
    }

    const specialistId = specialistRows[0].id

    const [rows] = await pool.query(
      `
      SELECT
        appointments.id,
        DATE_FORMAT(appointments.date, '%Y-%m-%d') AS date,
        TIME_FORMAT(appointments.time, '%H:%i') AS time,
        appointments.status,
        appointments.healthInsurance,
        appointments.reason,
        patients.dni,
        patients.phone,
        patient_user.name AS patientName,
        patient_user.lastName AS patientLastName,
        patient_user.email AS patientEmail
      FROM appointments
      JOIN patients ON appointments.patientId = patients.id
      JOIN users AS patient_user ON patients.userId = patient_user.id
      WHERE appointments.specialistId = ?
      ORDER BY appointments.date ASC, appointments.time ASC
      `,
      [specialistId]
    )

    res.json(rows)
    // Después de obtener turnos
    console.log("TURNOS:", rows)
  } catch (error) {
    console.error('Error al obtener turnos del especialista:', error)

    res.status(500).json({
      message: 'Error al obtener turnos del especialista'
    })
  }

}

const getSpecialistAgenda = async (req, res) => {
  const userId = req.user.id
  const today = getArgentinaNow().date

  try {
    const [specialistRows] = await pool.query(
      `
      SELECT id
      FROM specialists
      WHERE userId = ?
      `,
      [userId]
    )

    if (specialistRows.length === 0) {
      return res.status(404).json({
        message: 'Especialista no encontrado'
      })
    }

    const [appointments] = await pool.query(
      `
      SELECT
        appointments.id,
        DATE_FORMAT(appointments.date, '%Y-%m-%d') AS date,
        TIME_FORMAT(appointments.time, '%H:%i') AS time,
        appointments.status,
        appointments.healthInsurance,
        appointments.reason,
        patients.dni,
        patients.phone,
        patient_user.name AS patientName,
        patient_user.lastName AS patientLastName
      FROM appointments
      JOIN patients ON appointments.patientId = patients.id
      JOIN users AS patient_user ON patients.userId = patient_user.id
      WHERE appointments.specialistId = ?
        AND appointments.date >= ?
        AND appointments.status IN ('pending', 'confirmed')
      ORDER BY appointments.date ASC, appointments.time ASC
      `,
      [specialistRows[0].id, today]
    )

    res.json({
      today,
      appointments
    })
  } catch (error) {
    console.error('Error al obtener la agenda del especialista:', error)

    res.status(500).json({
      message: 'Error al obtener la agenda del especialista'
    })
  }
}

// ACTUALIZAR TURNO

const updateAppointment = async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const allowedStatuses = ['confirmed', 'cancelled']

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: 'Estado de turno inválido'
    })
  }

  let connection

  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()

    const [appointmentRows] = await connection.query(
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
        AND specialists.userId = ?
      FOR UPDATE
      `,
      [id, req.user.id]
    )

    if (appointmentRows.length === 0) {
      await connection.rollback()

      return res.status(404).json({
        message: 'Turno no encontrado'
      })
    }

    const appointment = appointmentRows[0]

    if (appointment.status !== 'pending') {
      await connection.rollback()

      return res.status(409).json({
        message: 'El turno ya fue procesado'
      })
    }

    await connection.query(
      `
      UPDATE appointments
      SET status = ?
      WHERE id = ?
      `,
      [status, id]
    )

    const notificationTitle =
      status === 'confirmed' ? 'Turno confirmado' : 'Turno cancelado'

    const notificationMessage =
      status === 'confirmed'
        ? `Tu turno con ${appointment.specialistName} ${appointment.specialistLastName} fue confirmado.`
        : `Tu turno con ${appointment.specialistName} ${appointment.specialistLastName} fue cancelado.`

    const notificationType = status === 'confirmed' ? 'success' : 'error'

    await connection.query(
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

    await connection.commit()

    res.json({
      message: 'Turno actualizado correctamente'
    })
  } catch (error) {
    if (connection) {
      await connection.rollback()
    }

    console.error('Error al actualizar turno:', error)

    res.status(500).json({
      message: 'Error al actualizar turno'
    })
  } finally {
    connection?.release()
  }
}

// CANCELAR TURNO

const cancelMyAppointment = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  let connection
  let transactionStarted = false

  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [appointmentRows] = await connection.query(
      `
      SELECT
        appointments.id,
        appointments.status,
        DATE_FORMAT(appointments.date, '%Y-%m-%d') AS date,
        TIME_FORMAT(appointments.time, '%H:%i') AS time,
        specialists.userId AS specialistUserId,
        patient_user.name AS patientName,
        patient_user.lastName AS patientLastName
      FROM appointments
      JOIN patients ON appointments.patientId = patients.id
      JOIN users AS patient_user ON patients.userId = patient_user.id
      JOIN specialists ON appointments.specialistId = specialists.id
      WHERE appointments.id = ?
        AND patients.userId = ?
      FOR UPDATE
      `,
      [id, userId]
    )

    if (appointmentRows.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        message: 'Turno no encontrado'
      })
    }

    const appointment = appointmentRows[0]

    if (appointment.status === 'cancelled') {
      await connection.rollback()
      transactionStarted = false

      return res.status(409).json({
        message: 'El turno ya está cancelado'
      })
    }

    await connection.query(
      `
      UPDATE appointments
      SET status = 'cancelled'
      WHERE id = ?
      `,
      [id]
    )

    const patientName =
      `${appointment.patientName} ${appointment.patientLastName}`

    await connection.query(
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
        appointment.specialistUserId,
        'Turno cancelado por el paciente',
        `${patientName} canceló el turno del ${appointment.date} a las ${appointment.time}.`,
        'warning'
      ]
    )

    await connection.commit()
    transactionStarted = false

    res.json({
      message: 'Turno cancelado correctamente'
    })
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback()
    }

    console.error('Error al cancelar turno:', error)

    res.status(500).json({
      message: 'Error al cancelar turno'
    })
  } finally {
    connection?.release()
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
  cancelMyAppointment,
  getSpecialistAppointments,
  getSpecialistAgenda
};
