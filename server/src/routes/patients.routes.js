const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/auth.middleware')

const {
  createPatient,
  getPatients,
  updatePatient,
  deletePatient,
  getPatientById,
  getPatientMe
} = require('../controllers/patients.controller')

router.post('/', createPatient)
router.get('/', getPatients)
router.get('/me', authMiddleware, getPatientMe)
router.get('/:id', getPatientById)
router.put('/:id', updatePatient)
router.delete('/:id', deletePatient)

module.exports = router