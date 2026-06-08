const pool = require("../config/db");

// CREAR ESPECIALISTA

const createSpecialist = async (req, res) => {

  const {
    userId,
    specialty,
    workplace,
    avatarUrl
  } = req.body;

  try {

    const [result] = await pool.query(
      `
INSERT INTO specialists
(
userId,
specialty,
workplace,
avatarUrl
)
VALUES (?, ?, ?, ?)
`,
      [
        userId,
        specialty,
        workplace,
        avatarUrl
      ]
    );

    res.status(201).json({
      message: "Especialista creado correctamente",
      id: result.insertId
    });

  } catch (error) {
    console.error("Error al crear especialista:", error);

    res.status(500).json({
      message: "Error al crear especialista"
    });
  };
};

// OBTENER O BUSCAR ESPECIALISTA

const getSpecialists = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM specialists`);

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener especialistas"
    });
  }
}

// OBTENER O BUSCAR UN ESPECIALISTA EN PARTICULAR

const getSpecialistsById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM specialists WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Especialista no encontrado"
      });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el especialista"
    });
  }
};

// ACTUALIZAR O MODIFICAR UN ESPECIALISTA

const updateSpecialist = async (req, res) => {
  const { id } = req.params;

  const {
    userId,
    specialty,
    workplace,
    avatarUrl
  } = req.body;

  try {
    const [result] = await pool.query(
      `
      UPDATE specialists
      SET
        userId = ?,
        specialty = ?,
        workplace = ?,
        avatarUrl = ?
      WHERE id = ?
      `,
      [
        userId,
        specialty,
        workplace,
        avatarUrl,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Especialista no encontrado"
      });
    }

    res.json({
      message: "Especialista actualizado correctamente"
    });
  } catch (error) {
    console.error("Error al actualizar especialista:", error);

    res.status(500).json({
      message: "Error al actualizar especialista"
    });
  }
};

// ELIMINAR UN ESPECIALISTA

const deleteSpecialist = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM specialists WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Especialista no encontrado"
      });
    }

    res.json({
      message: "Especialista eliminado correctamente"
    });
  } catch (error) {
    console.error("Error al eliminar especialista:", error);

    res.status(500).json({
      message: "Error al eliminar especialista"
    });
  }
};


module.exports = {
  createSpecialist,
  getSpecialists,
  getSpecialistsById,
  deleteSpecialist
};