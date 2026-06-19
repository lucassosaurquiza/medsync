const pool = require("../config/db");

const getPatientMe = async (req, res) => {
  const userId = req.user.id

  try {
    const [rows] = await pool.query(
      `
      SELECT
        patients.id,
        patients.userId,
        patients.dni,
        patients.phone,
        users.name,
        users.lastName,
        users.email
      FROM patients
      INNER JOIN users ON users.id = patients.userId
      WHERE patients.userId = ?
      `,
      [userId]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        message: 'Paciente no encontrado'
      })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Error al obtener paciente:', error)

    res.status(500).json({
      message: 'Error al obtener paciente'
    })
  }
}

const updatePatientMe = async (req, res) => {
  const userId = req.user.id
  const normalizedDni = String(req.body.dni || '').replace(/\D/g, '')
  const normalizedPhone = String(req.body.phone || '').trim()

  if (!/^\d{7,9}$/.test(normalizedDni)) {
    return res.status(400).json({
      message: 'El DNI debe tener entre 7 y 9 digitos'
    })
  }

  if (!/^[0-9+()\s-]{8,30}$/.test(normalizedPhone)) {
    return res.status(400).json({
      message: 'El telefono ingresado no es valido'
    })
  }

  try {
    const [result] = await pool.query(
      `
      UPDATE patients
      SET dni = ?, phone = ?
      WHERE userId = ?
      `,
      [normalizedDni, normalizedPhone, userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Paciente no encontrado'
      })
    }

    res.json({
      message: 'Datos del paciente actualizados correctamente',
      dni: normalizedDni,
      phone: normalizedPhone
    })
  } catch (error) {
    console.error('Error al actualizar datos del paciente:', error)

    res.status(500).json({
      message: 'Error al actualizar datos del paciente'
    })
  }
}

// OBTENER PACIENTE POR ID

const getPatientById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `
      SELECT *
      FROM patients
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Paciente no encontrado"
      });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error("Error al obtener paciente:", error);

    res.status(500).json({
      message: "Error al obtener paciente"
    });
  }
};

// CREAR PACIENTE

const createPatient = async (req, res) => {
  const { userId, dni, phone } = req.body

  try {
    const [result] = await pool.query(
      `
      INSERT INTO patients (userId, dni, phone)
      VALUES (?, ?, ?)
      `,
      [userId, dni || null, phone || null]
    )

    res.status(201).json({
      message: 'Paciente creado correctamente',
      id: result.insertId
    })
  } catch (error) {
    console.error('Error al crear paciente:', error)

    res.status(500).json({
      message: 'Error al crear paciente'
    })
  }
}

// BUSCAR TODOS LOS PACIENTES

const getPatients = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM patients
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener pacientes"
    });
  }
};

// ACTUALIZAR PACIENTE

const updatePatient = async (req, res) => {
  const { id } = req.params;

  const {
    userId,
    phone
  } = req.body;

  try {
    const [result] = await pool.query(
      `
      UPDATE patients
      SET
        userId = ?,
        phone = ?
      WHERE id = ?
      `,
      [
        userId,
        phone,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Paciente no encontrado"
      });
    }

    res.json({
      message: "Paciente actualizado correctamente"
    });

  } catch (error) {
    console.error("Error al actualizar paciente:", error);

    res.status(500).json({
      message: "Error al actualizar paciente"
    });
  }
};

// ELIMINAR PACIENTE

const deletePatient = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM patients WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Paciente no encontrado"
      });
    }

    res.json({
      message: "Paciente eliminado correctamente"
    });

  } catch (error) {
    console.error("Error al eliminar paciente:", error);

    res.status(500).json({
      message: "Error al eliminar paciente"
    });
  }
};

module.exports = {
  createPatient,
  getPatients,
  updatePatient,
  deletePatient,
  getPatientById,
  getPatientMe,
  updatePatientMe
};
