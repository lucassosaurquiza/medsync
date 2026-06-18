const express = require("express");
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')

const {
  getSpecialists,
  getSpecialistsById,
  getMyProfile,
  updateMyProfile
} = require("../controllers/specialists.controller");

router.get("/", getSpecialists);
router.get('/me', authMiddleware, roleMiddleware('specialist'), getMyProfile)
router.put('/me', authMiddleware, roleMiddleware('specialist'), updateMyProfile)
router.get("/:id", getSpecialistsById);

module.exports = router;
