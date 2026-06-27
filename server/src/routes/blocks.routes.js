const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')
const {
  getMyBlocks,
  createMyBlock,
  deleteMyBlock
} = require('../controllers/blocks.controller')

router.use(authMiddleware, roleMiddleware('specialist'))

router.get('/me', getMyBlocks)
router.post('/me', createMyBlock)
router.delete('/me/:id', deleteMyBlock)

module.exports = router
