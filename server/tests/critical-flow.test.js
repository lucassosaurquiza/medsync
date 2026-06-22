const { after, before, test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const dotenv = require('dotenv')
const mysql = require('mysql2/promise')
const supertest = require('supertest')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const developmentDatabase = process.env.DB_NAME
const testDatabase = process.env.TEST_DB_NAME || `${developmentDatabase}_test`

if (!developmentDatabase) {
  throw new Error('DB_NAME no esta configurado')
}

if (!/^[a-zA-Z0-9_]+_test$/.test(testDatabase)) {
  throw new Error('TEST_DB_NAME debe finalizar en _test')
}

process.env.NODE_ENV = 'test'
process.env.DB_NAME = testDatabase
process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

let app
let pool
let request

const getFutureAppointment = () => {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + 14)

  const dateValue = date.toISOString().slice(0, 10)
  const jsDay = date.getUTCDay()

  return {
    date: dateValue,
    dayOfWeek: jsDay === 0 ? 7 : jsDay
  }
}

before(async () => {
  const connectionOptions = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  }
  const adminConnection = await mysql.createConnection(connectionOptions)

  await adminConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${testDatabase}\`
      CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`
  )
  await adminConnection.end()

  const schema = await fs.readFile(
    path.resolve(__dirname, '../../database/schema.sql'),
    'utf8'
  )
  const schemaConnection = await mysql.createConnection({
    ...connectionOptions,
    database: testDatabase,
    multipleStatements: true
  })

  await schemaConnection.query(schema)
  await schemaConnection.end()

  app = require('../src/app')
  pool = require('../src/config/db')
  request = supertest(app)
})

after(async () => {
  await pool?.end()
})

test('health responde sin consultar la base de datos', async () => {
  const response = await request.get('/api/health')

  assert.equal(response.status, 200)
  assert.equal(response.body.status, 'ok')
  assert.equal(typeof response.body.uptimeSeconds, 'number')
})

test('ready confirma la conexion con MySQL', async () => {
  const response = await request.get('/api/ready')

  assert.equal(response.status, 200, JSON.stringify(response.body))
  assert.equal(response.body.status, 'ready')
  assert.equal(response.body.database, 'connected')
})

test('flujo critico de turnos', async t => {
  const appointmentDate = getFutureAppointment()
  let specialistToken
  let specialistId
  let patientToken
  let appointmentId

  await t.test('registra un especialista', async () => {
    const response = await request
      .post('/api/auth/register')
      .send({
        name: 'Especialista',
        lastName: 'Prueba',
        email: 'especialista.test@medsync.local',
        password: 'TestPassword123!',
        role: 'specialist',
        specialty: 'Clinica medica',
        professionalLicense: 'TEST-001',
        workplace: 'Consultorio de prueba',
        price: 10000
      })

    assert.equal(response.status, 201, JSON.stringify(response.body))
    assert.ok(response.body.token)
    assert.ok(response.body.profileId)

    specialistToken = response.body.token
    specialistId = response.body.profileId
  })

  await t.test('inicia sesion', async () => {
    const response = await request
      .post('/api/auth/login')
      .send({
        email: 'especialista.test@medsync.local',
        password: 'TestPassword123!'
      })

    assert.equal(response.status, 200, JSON.stringify(response.body))
    assert.equal(response.body.user.role, 'specialist')
    assert.ok(response.body.token)
  })

  await t.test('configura disponibilidad', async () => {
    const response = await request
      .put('/api/availability/me')
      .set('Authorization', `Bearer ${specialistToken}`)
      .send({
        appointmentDuration: 30,
        days: [
          {
            dayOfWeek: appointmentDate.dayOfWeek,
            startTime: '09:00',
            endTime: '10:00'
          }
        ]
      })

    assert.equal(response.status, 200, JSON.stringify(response.body))
  })

  await t.test('registra un paciente', async () => {
    const response = await request
      .post('/api/auth/register')
      .send({
        name: 'Paciente',
        lastName: 'Principal',
        email: 'paciente.test@medsync.local',
        password: 'TestPassword123!',
        role: 'patient'
      })

    assert.equal(response.status, 201, JSON.stringify(response.body))
    patientToken = response.body.token
  })

  await t.test('reserva un turno', async () => {
    const response = await request
      .post('/api/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        specialistId,
        date: appointmentDate.date,
        time: '09:00',
        healthInsurance: 'Particular',
        reason: 'Prueba automatizada'
      })

    assert.equal(response.status, 201, JSON.stringify(response.body))
    assert.ok(response.body.id)
    appointmentId = response.body.id
  })

  await t.test('rechaza un horario ocupado con 409', async () => {
    const registerResponse = await request
      .post('/api/auth/register')
      .send({
        name: 'Paciente',
        lastName: 'Conflicto',
        email: 'conflicto.test@medsync.local',
        password: 'TestPassword123!',
        role: 'patient'
      })

    assert.equal(
      registerResponse.status,
      201,
      JSON.stringify(registerResponse.body)
    )

    const response = await request
      .post('/api/appointments')
      .set('Authorization', `Bearer ${registerResponse.body.token}`)
      .send({
        specialistId,
        date: appointmentDate.date,
        time: '09:00',
        healthInsurance: 'Particular',
        reason: 'Debe generar conflicto'
      })

    assert.equal(response.status, 409, JSON.stringify(response.body))
  })

  await t.test('el especialista acepta el turno', async () => {
    const response = await request
      .put(`/api/appointments/${appointmentId}`)
      .set('Authorization', `Bearer ${specialistToken}`)
      .send({ status: 'confirmed' })

    assert.equal(response.status, 200, JSON.stringify(response.body))
  })

  await t.test('el paciente cancela el turno', async () => {
    const response = await request
      .patch(`/api/appointments/${appointmentId}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({})

    assert.equal(response.status, 200, JSON.stringify(response.body))
  })

  await t.test('persiste el estado cancelado', async () => {
    const [rows] = await pool.query(
      'SELECT status FROM appointments WHERE id = ?',
      [appointmentId]
    )

    assert.equal(rows.length, 1)
    assert.equal(rows[0].status, 'cancelled')
  })
})
