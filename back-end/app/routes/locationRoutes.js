import express from 'express';
import locationController from '../controllers/locationController.js';
import {authenticateJWT} from '../middleware/authMiddle.js';

const router = express.Router();

// Route lấy locations
router.get('/locations', authenticateJWT, locationController.getAllLocations);

export default router;