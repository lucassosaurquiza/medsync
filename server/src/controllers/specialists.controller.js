const { v2: cloudinary } = require('cloudinary')
const pool = require('../config/db')

const normalizeHealthInsurances = healthInsurances => {
  if (!Array.isArray(healthInsurances)) return []

  const normalizedNames = healthInsurances
    .map(healthInsurance => (
      typeof healthInsurance === 'string' ? healthInsurance.trim() : ''
    ))
    .filter(Boolean)
    .map(healthInsurance => healthInsurance.slice(0, 100))

  return [...new Set(normalizedNames)].slice(0, 30)
}

const getHealthInsurancesBySpecialistIds = async (specialistIds, connection = pool) => {
  const uniqueIds = [...new Set(specialistIds.filter(Boolean))]

  if (uniqueIds.length === 0) return {}

  const [rows] = await connection.query(
    `
    SELECT specialistId, name
    FROM specialist_health_insurances
    WHERE specialistId IN (?)
    ORDER BY name ASC
    `,
    [uniqueIds]
  )

  return rows.reduce((acc, row) => {
    if (!acc[row.specialistId]) {
      acc[row.specialistId] = []
    }

    acc[row.specialistId].push(row.name)
    return acc
  }, {})
}

const hasCloudinaryConfig = () => (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

const uploadBufferToCloudinary = (buffer, publicId) => new Promise(
  (resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          {
            width: 800,
            height: 800,
            crop: 'fill',
            gravity: 'face',
            quality: 'auto',
            fetch_format: 'auto'
          }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        resolve(result)
      }
    )

    uploadStream.end(buffer)
  }
)

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
      specialists.professionalLicense,
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
    const healthInsurancesBySpecialist = await getHealthInsurancesBySpecialistIds(
      rows.map(row => row.id)
    )

    res.json(rows.map(row => ({
      ...row,
      healthInsurances: healthInsurancesBySpecialist[row.id] || []
    })))
  } catch (error) {
    console.error('Error al obtener especialistas:', error)

    res.status(500).json({
      message: 'Error al obtener especialistas'
    })
  }
}

const getSpecialties = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT DISTINCT specialty
      FROM specialists
      WHERE specialty IS NOT NULL
        AND specialty <> ''
      ORDER BY specialty ASC
      `
    )

    res.json(rows.map(row => row.specialty))
  } catch (error) {
    console.error('Error al obtener especialidades:', error)

    res.status(500).json({
      message: 'Error al obtener especialidades'
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
        specialists.professionalLicense,
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

    const healthInsurancesBySpecialist = await getHealthInsurancesBySpecialistIds([rows[0].id])

    res.json({
      ...rows[0],
      healthInsurances: healthInsurancesBySpecialist[rows[0].id] || []
    })
  } catch (error) {
    console.error('Error al obtener el especialista:', error)

    res.status(500).json({
      message: 'Error al obtener el especialista'
    })
  }
}

// OBTENER PERFIL DEL ESPECIALISTA AUTENTICADO

const getMyProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        users.name,
        users.lastName,
        users.email,
        specialists.id AS specialistId,
        specialists.specialty,
        specialists.professionalLicense,
        specialists.workplace,
        specialists.avatarUrl,
        specialists.price
      FROM specialists
      INNER JOIN users ON users.id = specialists.userId
      WHERE specialists.userId = ?
      LIMIT 1
      `,
      [req.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Perfil de especialista no encontrado'
      })
    }

    const healthInsurancesBySpecialist = await getHealthInsurancesBySpecialistIds(
      [rows[0].specialistId]
    )

    res.json({
      ...rows[0],
      healthInsurances: healthInsurancesBySpecialist[rows[0].specialistId] || []
    })
  } catch (error) {
    console.error('Error al obtener el perfil profesional:', error)

    res.status(500).json({
      message: 'Error al obtener el perfil profesional'
    })
  }
}

// ACTUALIZAR PERFIL DEL ESPECIALISTA AUTENTICADO

const updateMyProfile = async (req, res) => {
  const {
    name,
    lastName,
    specialty,
    professionalLicense,
    workplace,
    avatarUrl,
    price,
    healthInsurances
  } = req.body

  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof lastName !== 'string' ||
    !lastName.trim() ||
    typeof specialty !== 'string' ||
    !specialty.trim() ||
    typeof professionalLicense !== 'string' ||
    !professionalLicense.trim() ||
    typeof workplace !== 'string' ||
    !workplace.trim()
  ) {
    return res.status(400).json({
      message:
        'Nombre, apellido, especialidad, matricula y consultorio son obligatorios'
    })
  }

  const normalizedHealthInsurances = normalizeHealthInsurances(healthInsurances)

  const normalizedPrice = Number(price)

  if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({
      message: 'El precio de consulta no es valido'
    })
  }

  let connection
  let transactionStarted = false

  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [profiles] = await connection.query(
      `
      SELECT id
      FROM specialists
      WHERE userId = ?
      FOR UPDATE
      `,
      [req.user.id]
    )

    if (profiles.length === 0) {
      await connection.rollback()
      transactionStarted = false

      return res.status(404).json({
        message: 'Perfil de especialista no encontrado'
      })
    }

    await connection.query(
      `
      UPDATE users
      SET name = ?, lastName = ?
      WHERE id = ?
      `,
      [name.trim(), lastName.trim(), req.user.id]
    )

    await connection.query(
      `
      UPDATE specialists
      SET
        specialty = ?,
        professionalLicense = ?,
        workplace = ?,
        avatarUrl = ?,
        price = ?
      WHERE userId = ?
      `,
      [
        specialty.trim(),
        professionalLicense.trim(),
        workplace.trim(),
        typeof avatarUrl === 'string' ? avatarUrl.trim() : '',
        normalizedPrice,
        req.user.id
      ]
    )

    await connection.query(
      `
      DELETE FROM specialist_health_insurances
      WHERE specialistId = ?
      `,
      [profiles[0].id]
    )

    for (const healthInsurance of normalizedHealthInsurances) {
      await connection.query(
        `
        INSERT INTO specialist_health_insurances (specialistId, name)
        VALUES (?, ?)
        `,
        [profiles[0].id, healthInsurance]
      )
    }

    await connection.commit()
    transactionStarted = false

    res.json({
      message: 'Perfil profesional actualizado correctamente',
      profile: {
        name: name.trim(),
        lastName: lastName.trim(),
        specialty: specialty.trim(),
        professionalLicense: professionalLicense.trim(),
        workplace: workplace.trim(),
        avatarUrl: typeof avatarUrl === 'string' ? avatarUrl.trim() : '',
        price: normalizedPrice,
        healthInsurances: normalizedHealthInsurances
      }
    })
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback()
    }

    console.error('Error al actualizar el perfil profesional:', error)

    res.status(500).json({
      message: 'Error al actualizar el perfil profesional'
    })
  } finally {
    connection?.release()
  }
}

const uploadMyAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'La imagen es obligatoria'
    })
  }

  if (!hasCloudinaryConfig()) {
    return res.status(503).json({
      message: 'La carga de imagenes no esta configurada'
    })
  }

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    })

    const uploadResult = await uploadBufferToCloudinary(
      req.file.buffer,
      `medsync/specialists/${req.user.id}`
    )

    await pool.query(
      `
      UPDATE specialists
      SET avatarUrl = ?
      WHERE userId = ?
      `,
      [uploadResult.secure_url, req.user.id]
    )

    return res.json({
      avatarUrl: uploadResult.secure_url
    })
  } catch (error) {
    console.error('Error al subir imagen del especialista:', error)

    return res.status(500).json({
      message: 'No se pudo subir la imagen'
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
  getSpecialties,
  getSpecialistsById,
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar,
  updateSpecialist,
  deleteSpecialist
}
