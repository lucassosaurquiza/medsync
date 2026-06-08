const express = require("express");
const router = express.Router();

const {
  createPatient,
  getPatients,
  updatePatient,
  deletePatient,
  getPatientById,
} = require("../controllers/patients.controller");

router.post("/", createPatient);
router.get("/", getPatients);
router.get("/:id", getPatientById);
router.post("/:id", updatePatient);
router.delete("/:id", deletePatient)

module.exports = router;