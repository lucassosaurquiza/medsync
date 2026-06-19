const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')

const {
  getPatientMe,
  updatePatientMe
} = require('../controllers/patients.controller')

router.get(
  '/me',
  authMiddleware,
  roleMiddleware('patient'),
  getPatientMe
)

router.patch(
  '/me',
  authMiddleware,
  roleMiddleware('patient'),
  updatePatientMe
)

module.exports = router
