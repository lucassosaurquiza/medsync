const datePattern = /^\d{4}-\d{2}-\d{2}$/
const timePattern = /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/

class AvailabilityError extends Error {
  constructor (message, statusCode = 400) {
    super(message)
    this.name = 'AvailabilityError'
    this.statusCode = statusCode
  }
}

const isValidDate = value => {
  if (typeof value !== 'string' || !datePattern.test(value)) return false

  const [year, month, day] = value.split('-').map(Number)
  const parsedDate = new Date(Date.UTC(year, month - 1, day))

  return parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
}

const normalizeTime = value => {
  if (typeof value !== 'string' || !timePattern.test(value)) return null
  return value.slice(0, 5)
}

const timeToMinutes = time => {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours * 60) + minutes
}

const minutesToTime = minutes => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0')
  const remainingMinutes = String(minutes % 60).padStart(2, '0')
  return `${hours}:${remainingMinutes}`
}

const getArgentinaNow = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date())
  const values = Object.fromEntries(
    parts.map(part => [part.type, part.value])
  )

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: (Number(values.hour) * 60) + Number(values.minute)
  }
}

const getIsoDayOfWeek = date => {
  const [year, month, day] = date.split('-').map(Number)
  const jsDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return jsDay === 0 ? 7 : jsDay
}

const rangesOverlap = (firstStart, firstEnd, secondStart, secondEnd) => (
  firstStart < secondEnd && firstEnd > secondStart
)

const getAvailabilityForDate = async (db, specialistId, date) => {
  const normalizedSpecialistId = Number(specialistId)

  if (!Number.isInteger(normalizedSpecialistId) || normalizedSpecialistId <= 0) {
    throw new AvailabilityError('Especialista invalido')
  }

  if (!isValidDate(date)) {
    throw new AvailabilityError('Fecha invalida')
  }

  const argentinaNow = getArgentinaNow()

  if (date < argentinaNow.date) {
    throw new AvailabilityError('No se pueden consultar fechas pasadas')
  }

  const dayOfWeek = getIsoDayOfWeek(date)
  const [specialists] = await db.query(
    `
    SELECT
      specialists.id,
      specialists.appointmentDuration,
      TIME_FORMAT(specialist_availability.startTime, '%H:%i') AS startTime,
      TIME_FORMAT(specialist_availability.endTime, '%H:%i') AS endTime
    FROM specialists
    LEFT JOIN specialist_availability
      ON specialist_availability.specialistId = specialists.id
      AND specialist_availability.dayOfWeek = ?
    WHERE specialists.id = ?
    LIMIT 1
    `,
    [dayOfWeek, normalizedSpecialistId]
  )

  if (specialists.length === 0) {
    throw new AvailabilityError('Especialista no encontrado', 404)
  }

  const specialist = specialists[0]
  const appointmentDuration = Number(specialist.appointmentDuration)

  if (!specialist.startTime || !specialist.endTime) {
    return {
      specialistId: normalizedSpecialistId,
      date,
      appointmentDuration,
      workingHours: null,
      slots: []
    }
  }

  const [blocks] = await db.query(
    `
    SELECT
      TIME_FORMAT(startTime, '%H:%i') AS startTime,
      TIME_FORMAT(endTime, '%H:%i') AS endTime
    FROM specialist_blocks
    WHERE specialistId = ?
      AND blockedDate = ?
    `,
    [normalizedSpecialistId, date]
  )
  const [appointments] = await db.query(
    `
    SELECT TIME_FORMAT(time, '%H:%i') AS time
    FROM appointments
    WHERE specialistId = ?
      AND date = ?
      AND status IN ('pending', 'confirmed')
    `,
    [normalizedSpecialistId, date]
  )

  const scheduleStart = timeToMinutes(specialist.startTime)
  const scheduleEnd = timeToMinutes(specialist.endTime)
  const fullDayBlocked = blocks.some(block => block.startTime === null)
  const blockRanges = blocks
    .filter(block => block.startTime !== null)
    .map(block => ({
      start: timeToMinutes(block.startTime),
      end: timeToMinutes(block.endTime)
    }))
  const appointmentRanges = appointments.map(appointment => {
    const start = timeToMinutes(appointment.time)
    return {
      start,
      end: start + appointmentDuration
    }
  })
  const slots = []

  for (
    let slotStart = scheduleStart;
    slotStart + appointmentDuration <= scheduleEnd;
    slotStart += appointmentDuration
  ) {
    const slotEnd = slotStart + appointmentDuration
    const isBlocked = fullDayBlocked || blockRanges.some(block => (
      rangesOverlap(slotStart, slotEnd, block.start, block.end)
    ))
    const hasAppointment = appointmentRanges.some(appointment => (
      rangesOverlap(slotStart, slotEnd, appointment.start, appointment.end)
    ))
    const hasPassed = date === argentinaNow.date && slotStart <= argentinaNow.minutes

    slots.push({
      time: minutesToTime(slotStart),
      available: !isBlocked && !hasAppointment && !hasPassed
    })
  }

  return {
    specialistId: normalizedSpecialistId,
    date,
    appointmentDuration,
    workingHours: {
      startTime: specialist.startTime,
      endTime: specialist.endTime
    },
    slots
  }
}

module.exports = {
  AvailabilityError,
  getArgentinaNow,
  getAvailabilityForDate,
  normalizeTime
}
