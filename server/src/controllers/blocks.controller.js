const pool = require('../config/db')

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/

const isValidDate = value => {
  if (typeof value !== 'string' || !datePattern.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
}

const getTodayInArgentina = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date())
  const values = Object.fromEntries(
    parts.map(part => [part.type, part.value])
  )

  return `${values.year}-${values.month}-${values.day}`
}

const timeToMinutes = time => {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours * 60) + minutes
}

const getMyBlocks = async (req, res) => {
  try {
    const [blocks] = await pool.query(
      `
      SELECT
        specialist_blocks.id,
        DATE_FORMAT(specialist_blocks.blockedDate, '%Y-%m-%d') AS blockedDate,
        TIME_FORMAT(specialist_blocks.startTime, '%H:%i') AS startTime,
        TIME_FORMAT(specialist_blocks.endTime, '%H:%i') AS endTime,
        specialist_blocks.reason
      FROM specialist_blocks
      JOIN specialists
        ON specialist_blocks.specialistId = specialists.id
      WHERE specialists.userId = ?
        AND specialist_blocks.blockedDate >= CURDATE()
      ORDER BY
        specialist_blocks.blockedDate ASC,
        specialist_blocks.startTime ASC
      `,
      [req.user.id]
    )

    res.json(blocks)
  } catch (error) {
    console.error('Error al obtener los bloqueos:', error)

    res.status(500).json({
      message: 'Error al obtener los bloqueos'
    })
  }
}

const createMyBlock = async (req, res) => {
  const { blockedDate } = req.body
  const startTime = req.body.startTime || null
  const endTime = req.body.endTime || null

  if (!isValidDate(blockedDate) || blockedDate < getTodayInArgentina()) {
    return res.status(400).json({
      message: 'La fecha del bloqueo no es valida'
    })
  }

  if ((startTime === null) !== (endTime === null)) {
    return res.status(400).json({
      message: 'Debes indicar ambas horas o bloquear el dia completo'
    })
  }

  if (
    startTime !== null &&
    (
      typeof startTime !== 'string' ||
      typeof endTime !== 'string' ||
      !timePattern.test(startTime) ||
      !timePattern.test(endTime) ||
      timeToMinutes(startTime) >= timeToMinutes(endTime)
    )
  ) {
    return res.status(400).json({
      message: 'El rango horario no es valido'
    })
  }

  if (
    req.body.reason !== undefined &&
    req.body.reason !== null &&
    typeof req.body.reason !== 'string'
  ) {
    return res.status(400).json({
      message: 'El motivo del bloqueo no es valido'
    })
  }

  const reason = req.body.reason?.trim() || null

  if (reason && reason.length > 255) {
    return res.status(400).json({
      message: 'El motivo no puede superar los 255 caracteres'
    })
  }

  let connection
  let transactionStarted = false

  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [specialists] = await connection.query(
      `
      SELECT id, appointmentDuration
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

    const specialist = specialists[0]
    const [overlappingBlocks] = await connection.query(
      `
      SELECT id
      FROM specialist_blocks
      WHERE specialistId = ?
        AND blockedDate = ?
        AND (
          startTime IS NULL
          OR ? IS NULL
          OR (startTime < ? AND endTime > ?)
        )
      LIMIT 1
      FOR UPDATE
      `,
      [specialist.id, blockedDate, startTime, endTime, startTime]
    )

    if (overlappingBlocks.length > 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(409).json({
        message: 'Ese dia u horario ya tiene un bloqueo'
      })
    }

    const appointmentParams = [specialist.id, blockedDate]
    let appointmentCondition = ''

    if (startTime !== null) {
      appointmentCondition = `
        AND TIME_TO_SEC(time) < TIME_TO_SEC(?)
        AND TIME_TO_SEC(time) + (? * 60) > TIME_TO_SEC(?)
      `
      appointmentParams.push(
        endTime,
        specialist.appointmentDuration,
        startTime
      )
    }

    const [activeAppointments] = await connection.query(
      `
      SELECT id
      FROM appointments
      WHERE specialistId = ?
        AND date = ?
        AND status IN ('pending', 'confirmed')
        ${appointmentCondition}
      LIMIT 1
      FOR UPDATE
      `,
      appointmentParams
    )

    if (activeAppointments.length > 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(409).json({
        message: 'No puedes bloquear un horario que ya tiene un turno activo'
      })
    }

    const [result] = await connection.query(
      `
      INSERT INTO specialist_blocks
        (specialistId, blockedDate, startTime, endTime, reason)
      VALUES (?, ?, ?, ?, ?)
      `,
      [specialist.id, blockedDate, startTime, endTime, reason]
    )

    await connection.commit()
    transactionStarted = false

    res.status(201).json({
      message: 'Bloqueo creado correctamente',
      block: {
        id: result.insertId,
        blockedDate,
        startTime,
        endTime,
        reason
      }
    })
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback()
    }

    console.error('Error al crear el bloqueo:', error)

    res.status(500).json({
      message: 'Error al crear el bloqueo'
    })
  } finally {
    connection?.release()
  }
}

const deleteMyBlock = async (req, res) => {
  const blockId = Number(req.params.id)

  if (!Number.isInteger(blockId) || blockId <= 0) {
    return res.status(400).json({
      message: 'Identificador de bloqueo invalido'
    })
  }

  try {
    const [result] = await pool.query(
      `
      DELETE specialist_blocks
      FROM specialist_blocks
      JOIN specialists
        ON specialist_blocks.specialistId = specialists.id
      WHERE specialist_blocks.id = ?
        AND specialists.userId = ?
      `,
      [blockId, req.user.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Bloqueo no encontrado'
      })
    }

    res.json({
      message: 'Bloqueo eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar el bloqueo:', error)

    res.status(500).json({
      message: 'Error al eliminar el bloqueo'
    })
  }
}

module.exports = {
  getMyBlocks,
  createMyBlock,
  deleteMyBlock
}
