const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require("../controllers/appointments.controller");


router.get("/", authMiddleware, roleMiddleware("patient", "specialist"), getAppointments);
router.get("/:id", authMiddleware, roleMiddleware("patient", "specialist"), getAppointmentById);
router.post("/", authMiddleware, roleMiddleware("patient"), createAppointment);
router.put("/:id", authMiddleware, roleMiddleware("specialist"), updateAppointment);
router.delete("/:id", authMiddleware, roleMiddleware("specialist"), deleteAppointment);
router.delete("/:id", authMiddleware, deleteAppointment);

module.exports = router;