import express from 'express';
import {authenticateJWT} from '../middleware/authMiddle.js';
import userController from "../controllers/userController.js";

const router = express.Router();

// Route để lấy thông tin cá nhân
router.get('/profile', authenticateJWT, userController.getProfile);

// Thêm route PUT để cập nhật avatar, yêu cầu phải xác thực
router.put('/avatar', authenticateJWT, userController.updateAvatar);

// Route để cập nhật thông tin cá nhân
router.put('/profile', authenticateJWT, userController.updateProfile);

// Route để lấy supervisors
router.get('/supervisors', authenticateJWT, userController.getSupervisorList);


export default router;