import express from 'express';
import {authenticateJWT} from '../middleware/authMiddle.js';
import roleController from "../controllers/roleController.js";

const router = express.Router();

// Route lấy roles
router.get('/roles', authenticateJWT, roleController.getAllRoles);

export default router;