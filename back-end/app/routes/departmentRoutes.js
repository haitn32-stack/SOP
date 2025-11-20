import express from 'express';
import departmentController from '../controllers/departmentController.js';
import {authenticateJWT} from '../middleware/authMiddle.js';

const router = express.Router();


// Endpoint: GET /api/departments?parentId=...
router.get('/departments', authenticateJWT, departmentController.getDepartments);

export default router;