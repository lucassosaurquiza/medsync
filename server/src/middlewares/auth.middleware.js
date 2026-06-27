const jwt = require('jsonwebtoken')
const pool = require('../config/db')

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Token no proporcionado'
    })
  }

  const token = authHeader.split(' ')[1]

  let decoded

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({
      message: 'Token inválido o vencido'
    })
  }

  try {
    const [users] = await pool.query(
      `
      SELECT id, role
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [decoded.id]
    )

    if (users.length === 0) {
      return res.status(401).json({
        message: 'La sesión ya no es válida'
      })
    }

    req.user = users[0]

    next()
  } catch (error) {
    console.error('Error al validar la sesión:', error)

    return res.status(500).json({
      message: 'Error al validar la sesión'
    })
  }
}

module.exports = authMiddleware