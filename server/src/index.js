// CONEXION A EXPRESS

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor funcionando"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});

// CONEXION A MYSQL

const pool = require("./config/db");

async function testDB() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conexión a MySQL exitosa");
    connection.release();
  } catch (error) {
    console.error("❌ Error al conectar con MySQL:", error.message);
  }
}

testDB();