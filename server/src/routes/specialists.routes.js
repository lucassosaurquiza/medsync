const express = require("express");
const router = express.Router();


const {
  createSpecialist,
  getSpecialists,
  getSpecialistsById,
  deleteSpecialist
} = require("../controllers/specialists.controller");


router.post("/", createSpecialist);
router.get("/", getSpecialists);
router.get("/:id", getSpecialistsById);
router.delete("/:id", deleteSpecialist)

module.exports = router;
