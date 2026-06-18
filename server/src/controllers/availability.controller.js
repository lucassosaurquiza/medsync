const pool = require('../config/db')
const {
  AvailabilityError,
  getAvailabilityForDate
} = require('../services/availability.service')

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

const timeToMinutes = time => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const getMyAvailability = async (req, res) => {
  try {
    const [specialists] = await pool.query(
      `
      SELECT id, appointmentDuration
      FROM specialists
      WHERE userId = ?
      LIMIT 1
      `,
      [req.user.id]
    )

    if (specialists.length === 0) {
      return res.status(404).json({
        message: 'Perfil de especialista no encontrado'
      })
    }

    const specialist = specialists[0]
    const [days] = await pool.query(
      `
      SELECT
        dayOfWeek,
        TIME_FORMAT(startTime, '%H:%i') AS startTime,
        TIME_FORMAT(endTime, '%H:%i') AS endTime
      FROM specialist_availability
      WHERE specialistId = ?
      ORDER BY dayOfWeek ASC
      `,
      [specialist.id]
    )

    res.json({
      appointmentDuration: specialist.appointmentDuration,
      days
    })
  } catch (error) {
    console.error('Error al obtener la disponibilidad:', error)

    res.status(500).json({
      message: 'Error al obtener la disponibilidad'
    })
  }
}

const updateMyAvailability = async (req, res) => {
  const { appointmentDuration, days } = req.body
  const normalizedDuration = Number(appointmentDuration)

  if (
    !Number.isInteger(normalizedDuration) ||
    normalizedDuration < 10 ||
    normalizedDuration > 240
  ) {
    return res.status(400).json({
      message: 'La duracion debe ser un numero entero entre 10 y 240 minutos'
    })
  }

  if (!Array.isArray(days) || days.length > 7) {
    return res.status(400).json({
      message: 'La disponibilidad semanal no es valida'
    })
  }

  const usedDays = new Set()

  for (const day of days) {
    if (
      !day ||
      !Number.isInteger(day.dayOfWeek) ||
      day.dayOfWeek < 1 ||
      day.dayOfWeek > 7 ||
      usedDays.has(day.dayOfWeek) ||
      typeof day.startTime !== 'string' ||
      typeof day.endTime !== 'string' ||
      !timePattern.test(day.startTime) ||
      !timePattern.test(day.endTime)
    ) {
      return res.status(400).json({
        message: 'Hay dias u horarios invalidos o repetidos'
      })
    }

    const startMinutes = timeToMinutes(day.startTime)
    const endMinutes = timeToMinutes(day.endTime)

    if (
      startMinutes >= endMinutes ||
      endMinutes - startMinutes < normalizedDuration
    ) {
      return res.status(400).json({
        message: 'Cada franja debe permitir al menos un turno completo'
      })
    }

    usedDays.add(day.dayOfWeek)
  }

  let connection
  let transactionStarted = false

  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [specialists] = await connection.query(
      `
      SELECT id
      FROM specialists
      WHERE userId = ?
      FOR UPDATE
      `,
      [req.user.id]
    )

    if (specialists.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        message: 'Perfil de especialista no encontrado'
      })
    }

    const specialistId = specialists[0].id

    await connection.query(
      `
      UPDATE specialists
      SET appointmentDuration = ?
      WHERE id = ?
      `,
      [normalizedDuration, specialistId]
    )

    await connection.query(
      'DELETE FROM specialist_availability WHERE specialistId = ?',
      [specialistId]
    )

    if (days.length > 0) {
      const placeholders = days.map(() => '(?, ?, ?, ?)').join(', ')
      const values = days.flatMap(day => [
        specialistId,
        day.dayOfWeek,
        day.startTime,
        day.endTime
      ])

      await connection.query(
        `
        INSERT INTO specialist_availability
          (specialistId, dayOfWeek, startTime, endTime)
        VALUES ${placeholders}
        `,
        values
      )
    }

    await connection.commit()
    transactionStarted = false

    res.json({
      message: 'Disponibilidad actualizada correctamente',
      appointmentDuration: normalizedDuration,
      days
    })
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback()
    }

    console.error('Error al actualizar la disponibilidad:', error)

    res.status(500).json({
      message: 'Error al actualizar la disponibilidad'
    })
  } finally {
    connection?.release()
  }
}

const getAvailableSlots = async (req, res) => {
  try {
    const availability = await getAvailabilityForDate(
      pool,
      req.params.specialistId,
      req.query.date
    )

    res.json(availability)
  } catch (error) {
    if (error instanceof AvailabilityError) {
      return res.status(error.statusCode).json({
        message: error.message
      })
    }

    console.error('Error al obtener los horarios disponibles:', error)

    res.status(500).json({
      message: 'Error al obtener los horarios disponibles'
    })
  }
}

module.exports = {
  getMyAvailability,
  updateMyAvailability,
  getAvailableSlots
}
