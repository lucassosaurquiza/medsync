const express = require("express");
const multer = require('multer')
const router = express.Router();

const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')

const {
  getSpecialists,
  getSpecialties,
  getSpecialistsById,
  getMyProfile,
  updateMyProfile,
  uploadMyAvatar
} = require("../controllers/specialists.controller");

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      const error = new Error('El archivo debe ser una imagen')
      error.statusCode = 400
      callback(error)
      return
    }

    callback(null, true)
  }
})

router.get("/", getSpecialists);
router.get('/specialties', getSpecialties)
router.get('/me', authMiddleware, roleMiddleware('specialist'), getMyProfile)
router.put('/me', authMiddleware, roleMiddleware('specialist'), updateMyProfile)
router.post(
  '/me/avatar',
  authMiddleware,
  roleMiddleware('specialist'),
  avatarUpload.single('avatar'),
  uploadMyAvatar
)
router.get("/:id", getSpecialistsById);

module.exports = router;
