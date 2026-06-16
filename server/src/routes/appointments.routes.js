const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getMyAppointments,
  cancelMyAppointment
} = require("../controllers/appointments.controller");


router.get("/my-appointments", authMiddleware, roleMiddleware("patient"), getMyAppointments);
router.patch("/:id/cancel", authMiddleware, roleMiddleware("patient"), cancelMyAppointment);

router.get("/", authMiddleware, roleMiddleware("patient", "specialist"), getAppointments);
router.get("/:id", authMiddleware, roleMiddleware("patient", "specialist"), getAppointmentById);

router.post("/", authMiddleware, roleMiddleware("patient"), createAppointment);

router.put("/:id", authMiddleware, roleMiddleware("specialist"), updateAppointment);

router.delete("/:id", authMiddleware, roleMiddleware("specialist"), deleteAppointment);

module.exports = router;