const pool = require('../config/db')

// OBTENER NOTIFICACIONES

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id

    const [rows] = await pool.query(
      `
      SELECT *
      FROM notifications
      WHERE userId = ?
      ORDER BY created_at DESC
      `,
      [userId]
    )

    res.json(rows)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Error al obtener notificaciones'
    })
  }
}

// MARCAR UNA NOTIFICACION COMO LEÍDA

const markAsRead = async (req, res) => {
  const { id } = req.params

  try {
    const [result] = await pool.query(
      `
      UPDATE notifications
      SET isRead = TRUE
      WHERE id = ?
        AND userId = ?
      `,
      [id, req.user.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Notificación no encontrada'
      })
    }

    res.json({
      message: 'Notificación actualizada'
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Error al actualizar notificación'
    })
  }
}

// MARCAR TODAS LAS NOTIFICACIONES COMO LEÍDAS

const markAllAsRead = async (req, res) => {
  try {
    await pool.query(
      `
      UPDATE notifications
      SET isRead = TRUE
      WHERE userId = ?
      `,
      [req.user.id]
    )

    res.json({
      message: 'Todas las notificaciones fueron leídas'
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      message: 'Error al actualizar notificaciones'
    })
  }
}

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
}
