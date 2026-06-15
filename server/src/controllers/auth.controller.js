const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")

// REGISTRAR USUARIO
const register = async (req, res) => {
  const { name, lastName, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
      INSERT INTO users (name, lastName, email, password, role)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, lastName, email, hashedPassword, role]
    );

    res.status(201).json({
      message: "Usuario registrado correctamente",
      id: result.insertId
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(500).json({
        message: 'El email ya está registrado'
      })
    }
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