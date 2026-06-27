const express = require('express')
const { randomUUID } = require('node:crypto')
const cors = require('cors')
const helmet = require('helmet')
const { rateLimit } = require('express-rate-limit')
const pool = require('./config/db')
const appointmentsRoutes = require('./routes/appointments.routes')
const specialistsRoutes = require('./routes/specialists.routes')
const patientsRoutes = require('./routes/patients.routes')
const authRoutes = require('./routes/auth.routes')
const notificationsRoutes = require('./routes/notifications.routes')
const availabilityRoutes = require('./routes/availability.routes')
const blocksRoutes = require('./routes/blocks.routes')

const allowedOrigins = (
  process.env.CLIENT_URL || 'http://localhost:5173'
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

const createRateLimitHandler = message => (req, res) => {
  res.status(429).json({ message })
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Demasiadas solicitudes. Intenta nuevamente en unos minutos'
  )
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: createRateLimitHandler(
    'Demasiados intentos de inicio de sesion. Intenta mas tarde'
  )
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Se alcanzo el limite de registros. Intenta mas tarde'
  )
})

const app = express()

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1)
}

app.disable('x-powered-by')
app.use((req, res, next) => {
  const startedAt = process.hrtime.bigint()
  const requestId = req.get('x-request-id') || randomUUID()
  const requestPath = req.path

  req.requestId = requestId
  res.setHeader('X-Request-Id', requestId)

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6
    const level = res.statusCode >= 500 ? 'error' : 'info'

    console[level](JSON.stringify({
      level,
      event: 'http_request',
      requestId,
      method: req.method,
      path: requestPath,
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2))
    }))
  })

  next()
})
app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    const error = new Error('Origen no permitido por CORS')
    error.code = 'CORS_NOT_ALLOWED'
    return callback(error)
  }
}))
app.use(express.json({ limit: '100kb' }))
app.use((req, res, next) => {
  const methodsWithBody = ['POST', 'PUT', 'PATCH']
  const isMultipartRoute =
    req.method === 'POST' && req.path === '/api/specialists/me/avatar'

  if (
    methodsWithBody.includes(req.method) &&
    !isMultipartRoute &&
    !req.is('application/json')
  ) {
    return res.status(415).json({
      message: 'Content-Type debe ser application/json'
    })
  }

  return next()
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime())
  })
})

app.get('/api/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1')

    return res.json({
      status: 'ready',
      database: 'connected'
    })
  } catch (error) {
    console.error(JSON.stringify({
      level: 'error',
      event: 'readiness_failed',
      requestId: req.requestId,
      message: error.message
    }))

    return res.status(503).json({
      status: 'not_ready',
      database: 'unavailable'
    })
  }
})

app.use('/api/auth/login', loginLimiter)
app.use('/api/auth/register', registerLimiter)
app.use('/api/auth', authRoutes)

app.use('/api', apiLimiter)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/specialists', specialistsRoutes)
app.use('/api/patients', patientsRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/availability', availabilityRoutes)
app.use('/api/blocks', blocksRoutes)

app.use((error, req, res, next) => {
  if (error.code === 'CORS_NOT_ALLOWED') {
    return res.status(403).json({
      message: 'Origen no permitido'
    })
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'La solicitud es demasiado grande'
    })
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      message: 'La imagen no puede superar los 5MB'
    })
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({
      message: error.message
    })
  }

  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      message: 'El cuerpo JSON no es valido'
    })
  }

  console.error(JSON.stringify({
    level: 'error',
    event: 'unhandled_request_error',
    requestId: req.requestId,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
  }))

  return res.status(500).json({
    message: 'Error interno del servidor'
  })
})

module.exports = app
