const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  createAppointment,
  updateAppointment,
  getMyAppointments,
  cancelMyAppointment,
  getSpecialistAppointments,
  getSpecialistAgenda
} = require("../controllers/appointments.controller");


router.get("/my-appointments", authMiddleware, roleMiddleware("patient"), getMyAppointments);
router.get("/specialist/me", authMiddleware, roleMiddleware("specialist"), getSpecialistAppointments)
router.get("/specialist/me/agenda", authMiddleware, roleMiddleware("specialist"), getSpecialistAgenda)
router.patch("/:id/cancel", authMiddleware, roleMiddleware("patient"), cancelMyAppointment);

router.post("/", authMiddleware, roleMiddleware("patient"), createAppointment);

router.put("/:id", authMiddleware, roleMiddleware("specialist"), updateAppointment);

module.exports = router;
