const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')
const {
  getMyAvailability,
  updateMyAvailability,
  getAvailableSlots
} = require('../controllers/availability.controller')

router.get(
  '/me',
  authMiddleware,
  roleMiddleware('specialist'),
  getMyAvailability
)

router.put(
  '/me',
  authMiddleware,
  roleMiddleware('specialist'),
  updateMyAvailability
)

router.get('/:specialistId/slots', getAvailableSlots)

module.exports = router
