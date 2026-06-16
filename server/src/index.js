// VARIABLES DE ENTORNO
require("dotenv").config();

// IMPORTS
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const appointmentsRoutes = require("./routes/appointments.routes");
const specialistsRoutes = require("./routes/specialists.routes");
const patientsRoutes = require("./routes/patients.routes");
const authRoutes = require("./routes/auth.routes")
const notificationsRoutes = require('./routes/notifications.routes')

// APP
const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// RUTAS
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Servidor funcionando"
  });
});

app.use("/api/appointments", appointmentsRoutes);
app.use("/api/specialists", specialistsRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/notifications', notificationsRoutes)


// TEST MYSQL
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

// SERVIDOR
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});