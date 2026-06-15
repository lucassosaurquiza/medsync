const pool = require('../config/db')

// CREAR ESPECIALISTA
const createSpecialist = async (req, res) => {
  const {
    userId,
    specialty,
    workplace = 'Consultorio a definir',
    avatarUrl = '',
    price = 0,
    rating = 0
  } = req.body

  try {
    const [existingSpecialist] = await pool.query(
      'SELECT id FROM specialists WHERE userId = ?',
      [userId]
    )

    if (existingSpecialist.length > 0) {
      return res.status(409).json({
        message: 'Este usuario ya tiene un perfil de especialista'
      })
    }

    const [result] = await pool.query(
      `
      INSERT INTO specialists
      (
        userId,
        specialty,
        workplace,
        avatarUrl,
        price,
        rating
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        specialty,
        workplace || 'Consultorio a definir',
        avatarUrl || '',
        price || 0,
        rating || 0
      ]
    )

    res.status(201).json({
      message: 'Especialista creado correctamente',
      id: result.insertId
    })
  } catch (error) {
    console.error('Error al crear especialista:', error)

    res.status(500).json({
      message: 'Error al crear especialista'
    })
  }
}

// OBTENER ESPECIALISTAS
const getSpecialists = async (req, res) => {
  const { search, specialty, sortBy } = req.query

  const values = []

  let query = `
    SELECT
      specialists.id,
      specialists.userId,
      users.name,
      users.lastName,
      specialists.specialty,
      specialists.workplace,
      specialists.avatarUrl,
      specialists.price,
      specialists.rating
    FROM specialists
    INNER JOIN users ON users.id = specialists.userId
    WHERE 1 = 1
  `

  if (search) {
    query += `
      AND (
        users.name LIKE ?
        OR users.lastName LIKE ?
        OR specialists.specialty LIKE ?
      )
    `

    values.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  if (specialty && specialty !== 'Todos') {
    query += `
      AND specialists.specialty = ?
    `

    values.push(specialty)
  }

  if (sortBy === 'rating') {
    query += ' ORDER BY specialists.rating DESC'
  } else if (sortBy === 'lowerPrice') {
    query += ' ORDER BY specialists.price ASC'
  } else if (sortBy === 'higherPrice') {
    query += ' ORDER BY specialists.price DESC'
  } else {
    query += ' ORDER BY specialists.id DESC'
  }

  try {
    const [rows] = await pool.query(query, values)

    res.json(rows)
  } catch (error) {
    console.error('Error al obtener especialistas:', error)

    res.status(500).json({
      message: 'Error al obtener especialistas'
    })
  }
}

// OBTENER ESPECIALISTA POR ID
const getSpecialistsById = async (req, res) => {
  const { id } = req.params

  try {
    const [rows] = await pool.query(
      `
      SELECT
        specialists.id,
        specialists.userId,
        users.name,
        users.lastName,
        specialists.specialty,
        specialists.workplace,
        specialists.avatarUrl,
        specialists.price,
        specialists.rating
      FROM specialists
      INNER JOIN users ON users.id = specialists.userId
      WHERE specialists.id = ?
      `,
      [id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Especialista no encontrado'
      })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Error al obtener el especialista:', error)

    res.status(500).json({
      message: 'Error al obtener el especialista'
    })
  }
}

// ACTUALIZAR ESPECIALISTA
const updateSpecialist = async (req, res) => {
  const { id } = req.params

  const {
    specialty,
    workplace,
    avatarUrl,
    price,
    rating
  } = req.body

  try {
    const [result] = await pool.query(
      `
      UPDATE specialists
      SET
        specialty = ?,
        workplace = ?,
        avatarUrl = ?,
        price = ?,
        rating = ?
      WHERE id = ?
      `,
      [
        specialty,
        workplace,
        avatarUrl || '',
        price || 0,
        rating || 0,
        id
      ]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Especialista no encontrado'
      })
    }

    res.json({
      message: 'Especialista actualizado correctamente'
    })
  } catch (error) {
    console.error('Error al actualizar especialista:', error)

    res.status(500).json({
      message: 'Error al actualizar especialista'
    })
  }
}

// ELIMINAR ESPECIALISTA
const deleteSpecialist = async (req, res) => {
  const { id } = req.params

  try {
    const [result] = await pool.query(
      'DELETE FROM specialists WHERE id = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Especialista no encontrado'
      })
    }

    res.json({
      message: 'Especialista eliminado correctamente'
    })
  } catch (error) {
    console.error('Error al eliminar especialista:', error)

    res.status(500).json({
      message: 'Error al eliminar especialista'
    })
  }
}

module.exports = {
  createSpecialist,
  getSpecialists,
  getSpecialistsById,
  updateSpecialist,
  deleteSpecialist
}