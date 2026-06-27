const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

let io

const getAllowedOrigins = () => (
  process.env.CLIENT_URL || 'http://localhost:5173'
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

const initializeRealtime = server => {
  io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ['GET', 'POST']
    }
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token

      if (!token) {
        return next(new Error('Token requerido'))
      }

      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      const [users] = await pool.query(
        `
        SELECT id, role
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [decodedToken.id]
      )

      if (users.length === 0) {
        return next(new Error('Usuario no encontrado'))
      }

      socket.user = users[0]
      socket.join(`user:${users[0].id}`)

      return next()
    } catch (error) {
      return next(new Error('Sesion invalida'))
    }
  })

  return io
}

const notifyUser = (userId, payload = {}) => {
  if (!io || !userId) return

  io.to(`user:${userId}`).emit('notifications:updated', {
    userId,
    ...payload
  })
}

module.exports = {
  initializeRealtime,
  notifyUser
}
