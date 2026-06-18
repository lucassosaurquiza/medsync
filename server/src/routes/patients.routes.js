const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')

const { getPatientMe } = require('../controllers/patients.controller')

router.get(
  '/me',
  authMiddleware,
  roleMiddleware('patient'),
  getPatientMe
)

module.exports = router
