const express = require('express')
const router = express.Router()

const authMiddleware = require('../middlewares/auth.middleware')

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notifications.controller')

router.get('/', authMiddleware, getMyNotifications)

router.patch('/:id/read', authMiddleware, markAsRead)

router.patch('/read-all', authMiddleware, markAllAsRead)

module.exports = router