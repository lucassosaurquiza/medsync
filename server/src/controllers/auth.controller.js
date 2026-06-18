const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

// REGISTRAR USUARIO
const register = async (req, res) => {
  const {
    name,
    lastName,
    email,
    password,
    role,
    phone,
    dni,
    specialty,
    professionalLicense,
    workplace,
    avatarUrl,
    price
  } = req.body

  const allowedRoles = ['patient', 'specialist']
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const normalizeOptionalString = value =>
    typeof value === 'string' && value.trim() ? value.trim() : null

  if (
    typeof name !== 'string' ||
    !name.trim() ||
    typeof lastName !== 'string' ||
    !lastName.trim() ||
    typeof email !== 'string' ||
    !email.trim() ||
    typeof password !== 'string'
  ) {
    return res.status(400).json({
      message: 'Nombre, apellido, email y contraseña son obligatorios'
    })
  }

  if (password.length < 8) {
    return res.status(400).json({
      message: 'La contraseña debe tener al menos 8 caracteres'
    })
  }

  if (!emailPattern.test(email.trim())) {
    return res.status(400).json({
      message: 'El formato del email no es válido'
    })
  }

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      message: 'Tipo de cuenta inválido'
    })
  }

  if (
    role === 'specialist' &&
    (typeof specialty !== 'string' ||
      !specialty.trim() ||
      typeof professionalLicense !== 'string' ||
      !professionalLicense.trim())
  ) {
    return res.status(400).json({
      message: 'Especialidad y matrícula profesional son obligatorias'
    })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPrice = Number(price || 0)

  if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
    return res.status(400).json({
      message: 'El precio de consulta no es válido'
    })
  }

  let connection
  let transactionStarted = false

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    connection = await pool.getConnection()
    await connection.beginTransaction()
    transactionStarted = true

    const [userResult] = await connection.query(
      `
      INSERT INTO users (name, lastName, email, password, role)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        name.trim(),
        lastName.trim(),
        normalizedEmail,
        hashedPassword,
        role
      ]
    )

    const userId = userResult.insertId
    let profileId

    if (role === 'patient') {
      const [profileResult] = await connection.query(
        `
        INSERT INTO patients (userId, dni, phone)
        VALUES (?, ?, ?)
        `,
        [
          userId,
          normalizeOptionalString(dni),
          normalizeOptionalString(phone)
        ]
      )

      profileId = profileResult.insertId
    } else {
      const [profileResult] = await connection.query(
        `
        INSERT INTO specialists
        (
          userId,
          specialty,
          professionalLicense,
          workplace,
          avatarUrl,
          price,
          rating
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          userId,
          specialty.trim(),
          professionalLicense.trim(),
          normalizeOptionalString(workplace) || 'Consultorio a definir',
          normalizeOptionalString(avatarUrl) || '',
          normalizedPrice,
          0
        ]
      )

      profileId = profileResult.insertId
    }

    const token = jwt.sign(
      {
        id: userId,
        role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    )

    await connection.commit()
    transactionStarted = false

    return res.status(201).json({
      message: 'Cuenta creada correctamente',
      token,
      user: {
        id: userId,
        name: name.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        role
      },
      profileId
    })
  } catch (error) {
    if (transactionStarted) {
      await connection.rollback()
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'El email ya está registrado'
      })
    }

    console.error('Error al registrar usuario:', error)

    return res.status(500).json({
      message: 'Error al crear la cuenta'
    })
  } finally {
    connection?.release()
  }
};

// INICIAR SESION

const login = async (req, res) => {

  const { email, password } = req.body;

  try {

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Credenciales invalidas"
      });
    }

    const user = rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Credenciales invalidas"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al iniciar sesion"
    })
  }
}



module.exports = {
  register,
  login
};
