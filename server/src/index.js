require('dotenv').config()

const requiredEnvironmentVariables = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
]
const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
  variableName => !process.env[variableName]
)

if (missingEnvironmentVariables.length > 0) {
  throw new Error(
    `Faltan variables de entorno: ${missingEnvironmentVariables.join(', ')}`
  )
}

if (
  process.env.NODE_ENV === 'production' &&
  process.env.JWT_SECRET.length < 32
) {
  throw new Error('JWT_SECRET debe tener al menos 32 caracteres en produccion')
}

const app = require('./app')
const pool = require('./config/db')

const PORT = process.env.PORT || 3000
let server

const log = (level, event, details = {}) => {
  console[level](JSON.stringify({ level, event, ...details }))
}

const startServer = async () => {
  try {
    const connection = await pool.getConnection()
    connection.release()
    log('info', 'database_connected')

    server = app.listen(PORT, () => {
      log('info', 'server_started', { port: Number(PORT) })
    })
  } catch (error) {
    log('error', 'server_start_failed', { message: error.message })
    process.exitCode = 1
  }
}

const shutdown = signal => {
  log('info', 'shutdown_started', { signal })

  const forceShutdown = setTimeout(() => {
    log('error', 'shutdown_timeout')
    process.exit(1)
  }, 10000)
  forceShutdown.unref()

  const closeDatabase = async exitCode => {
    try {
      await pool.end()
      log('info', 'shutdown_completed')
      process.exit(exitCode)
    } catch (error) {
      log('error', 'database_shutdown_failed', { message: error.message })
      process.exit(1)
    }
  }

  if (!server) {
    void closeDatabase(0)
    return
  }

  server.close(error => {
    void closeDatabase(error ? 1 : 0)
  })
}

process.once('SIGTERM', () => shutdown('SIGTERM'))
process.once('SIGINT', () => shutdown('SIGINT'))

startServer()
