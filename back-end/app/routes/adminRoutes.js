import {authenticateJWT, checkRole, requireSystemAccess} from "../middleware/authMiddle.js";
import userController from "../controllers/userController.js";
import express from "express";

const router = express.Router();

// Route for admin to get all users
router.get('/admin/users',
    authenticateJWT,
    requireSystemAccess,
    checkRole(['Admin']),
    userController.getAllUsers
);

// Route for admin to get a details user
router.get('/admin/users/:id',
    authenticateJWT,
    requireSystemAccess,
    checkRole(['Admin']),
    userController.getUserById
);

// Route for admin to update user's role
router.put('/admin/users/:id/role',
    authenticateJWT,
    requireSystemAccess,
    checkRole(['Admin']),
    userController.updateUserRole
);

// Route for admin to update user's status (active/inactive)
router.put('/admin/users/:id/status',
    authenticateJWT,
    requireSystemAccess,
    checkRole(['Admin']),
    userController.updateUserStatus
);

// Route for admin to create new user
router.post('/admin/users/create',
    authenticateJWT,
    requireSystemAccess,
    checkRole(['Admin']),
    userController.createUser
);

// Route for admin bulk user status
router.put('/admin/users/bulk-status',
    authenticateJWT,
    requireSystemAccess,
    checkRole(['Admin']),
    userController.bulkUpdateStatus
);

// Route to get suggestion search
router.get('admin/users/suggestions',
    authenticateJWT,
    requireSystemAccess,
    checkRole(['Admin']),
    userController.getSearchSuggestions
);

export default router;

