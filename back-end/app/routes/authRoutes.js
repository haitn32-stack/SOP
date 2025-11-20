import express from 'express';
import AuthController from '../controllers/authController.js';
import {getPublicKeyPem} from "../utils/rsa.js";
import {authenticateJWT} from '../middleware/authMiddle.js'
import UploadController from "../controllers/uploadController.js";
import upload from "../middleware/uploadMiddle.js"

const router = express.Router();
const authController = new AuthController();
const uploadController = new UploadController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/pubkey', (req, res) => {
    res.type('text/plain').send(getPublicKeyPem());
});

// Route for user upload avatar
router.post('/upload/avatar',
    authenticateJWT,
    upload.single('avatar'), // Dùng multer để xử lý file tên là 'avatar'
    uploadController.uploadAvatar // Gọi controller
);

// Protected routes
router.get('/verify', authenticateJWT, authController.verifyToken);
router.post('/logout', authenticateJWT, authController.logout);
router.post('/refresh', authController.refreshToken);


export default router;