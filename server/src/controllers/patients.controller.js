const pool = require("../config/db");

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
  const { userId, phone } = req.body;

  try {
    const [result] = await pool.query(
      `
      INSERT INTO patients (userId, phone)
      VALUES (?, ?)
      `,
      [userId, phone]
    );

    res.status(201).json({
      message: "Paciente creado correctamente",
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear paciente"
    });
  }
};

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
  getPatientById
};
