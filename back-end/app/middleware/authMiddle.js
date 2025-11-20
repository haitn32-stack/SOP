// middleware/authMiddle.js
import tokenService from '../business/tokenService.js';
import validationService from '../business/validateService.js';
import userRepository from '../repositories/userRepository.js';
import {errorResponse} from '../utils/response.js';

// Auth messages constants
const AUTH_MESSAGES = {
    TOKEN_NOT_PROVIDED: 'Token không được cung cấp',
    ACCOUNT_NOT_EXISTS: 'Tài khoản không tồn tại',
    ACCOUNT_DEACTIVATED: 'Tài khoản đã bị vô hiệu hóa',
    TOKEN_EXPIRED: 'Token đã hết hạn',
    INVALID_TOKEN: 'Token không hợp lệ',
    SYSTEM_ERROR: 'Lỗi hệ thống',
    AUTHENTICATION_REQUIRED: 'Yêu cầu xác thực',
    NO_SYSTEM_ACCESS: 'Không có quyền truy cập hệ thống'
};

// HTTP status constants
const HTTP_STATUS = {
    UNAUTHORIZED: 401,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    TOO_MANY_REQUESTS: 429
};

const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = tokenService.extractTokenFromHeader(authHeader);

        if (!token) {
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_NOT_PROVIDED);
        }

        // Verify token
        const decoded = tokenService.verifyAccessToken(token);

        // Get user from database
        const user = await userRepository.findById(decoded.userId);

        if (!user) {
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.ACCOUNT_NOT_EXISTS);
        }

        if (!user.isActive) {
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.ACCOUNT_DEACTIVATED);
        }

        req.user = user;
        req.token = token;
        next();

    } catch (error) {
        console.error('Authentication error:', error.message);

        if (error.name === 'TokenExpiredError') {
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_EXPIRED, {
                tokenExpired: true
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN);
        }

        return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, AUTH_MESSAGES.SYSTEM_ERROR);
    }
};

const optionalAuthenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = tokenService.extractTokenFromHeader(authHeader);

        if (token) {
            const decoded = tokenService.verifyAccessToken(token);
            const user = await userRepository.findById(decoded.userId);

            if (user && user.isActive) {
                req.user = user;
                req.token = token;
            }
        }

        next();
    } catch {
        next();
    }
};

const requireRole = (requiredRoles) => {
    return (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.AUTHENTICATION_REQUIRED);
            }

            const roleValidation = validationService.validateUserRole(user, requiredRoles);

            if (!roleValidation.isValid) {
                return errorResponse(res, HTTP_STATUS.FORBIDDEN, roleValidation.error);
            }

            next();
        } catch (error) {
            console.error('Role check error:', error);
            return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, AUTH_MESSAGES.SYSTEM_ERROR);
        }
    };
};

const requirePermission = (requiredPermission) => {
    return (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.AUTHENTICATION_REQUIRED);
            }

            const permissionValidation = validationService.validateUserPermission(user, requiredPermission);

            if (!permissionValidation.isValid) {
                return errorResponse(res, HTTP_STATUS.FORBIDDEN, permissionValidation.error);
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, AUTH_MESSAGES.SYSTEM_ERROR);
        }
    };
};

const requireAccessLevel = (requiredLevel) => {
    return (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.AUTHENTICATION_REQUIRED);
            }

            const levelValidation = validationService.validateAccessLevel(user, requiredLevel);

            if (!levelValidation.isValid) {
                return errorResponse(res, HTTP_STATUS.FORBIDDEN, levelValidation.error);
            }

            next();
        } catch (error) {
            console.error('Access level check error:', error);
            return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, AUTH_MESSAGES.SYSTEM_ERROR);
        }
    };
};

const requireSystemAccess = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.AUTHENTICATION_REQUIRED);
        }

        const accessValidation = validationService.validateUserAccess(user);

        if (!accessValidation.isValid) {
            return errorResponse(res, HTTP_STATUS.FORBIDDEN, AUTH_MESSAGES.NO_SYSTEM_ACCESS, {
                details: accessValidation.errors,
                noSystemAccess: true
            });
        }

        req.userAccess = accessValidation;
        next();

    } catch (error) {
        console.error('System access check error:', error);
        return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, AUTH_MESSAGES.SYSTEM_ERROR);
    }
};

const requireDepartmentAccess = (departmentIdParam = 'departmentId') => {
    return (req, res, next) => {
        try {
            const user = req.user;
            const targetDepartmentId = req.params[departmentIdParam] || req.body[departmentIdParam];

            if (!user) {
                return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.AUTHENTICATION_REQUIRED);
            }

            if (!targetDepartmentId) {
                return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Department ID is required');
            }

            const departmentValidation = validationService.validateDepartmentAccess(user, parseInt(targetDepartmentId));

            if (!departmentValidation.isValid) {
                return errorResponse(res, HTTP_STATUS.FORBIDDEN, departmentValidation.error);
            }

            next();
        } catch (error) {
            console.error('Department access check error:', error);
            return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, AUTH_MESSAGES.SYSTEM_ERROR);
        }
    };
};

const requireSelfOrAdminAccess = (userIdParam = 'userId') => {
    return (req, res, next) => {
        try {
            const currentUser = req.user;
            const targetUserId = req.params[userIdParam] || req.body[userIdParam];

            if (!currentUser) {
                return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.AUTHENTICATION_REQUIRED);
            }

            if (currentUser.userId === parseInt(targetUserId)) {
                return next();
            }

            if (currentUser.role === 'Admin') {
                return next();
            }

            return errorResponse(res, HTTP_STATUS.FORBIDDEN, 'Không có quyền truy cập dữ liệu này');

        } catch (error) {
            console.error('Self or admin access check error:', error);
            return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, AUTH_MESSAGES.SYSTEM_ERROR);
        }
    };
};

const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req, res, next) => {
        const userId = req.user?.userId || req.ip;
        const now = Date.now();
        const windowStart = now - windowMs;

        if (requests.has(userId)) {
            const userRequests = requests.get(userId).filter(time => time > windowStart);
            requests.set(userId, userRequests);
        }

        const userRequests = requests.get(userId) || [];

        if (userRequests.length >= maxRequests) {
            return errorResponse(res, HTTP_STATUS.TOO_MANY_REQUESTS, 'Quá nhiều yêu cầu, vui lòng thử lại sau');
        }

        userRequests.push(now);
        requests.set(userId, userRequests);

        next();
    };
};

const requireUserManagementAccess = (targetUserIdParam = 'targetUserId') => {
    return async (req, res, next) => {
        try {
            const currentUser = req.user;
            const targetUserId = req.params[targetUserIdParam] || req.body[targetUserIdParam];

            if (!currentUser) {
                return errorResponse(res, HTTP_STATUS.UNAUTHORIZED, AUTH_MESSAGES.AUTHENTICATION_REQUIRED);
            }

            if (!targetUserId) {
                return errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Target user ID is required');
            }

            const targetUser = await userRepository.findById(parseInt(targetUserId));

            if (!targetUser) {
                return errorResponse(res, HTTP_STATUS.NOT_FOUND, 'Người dùng không tồn tại');
            }

            const managementValidation = validationService.validateUserManagementAccess(currentUser, targetUser);

            if (!managementValidation.isValid) {
                return errorResponse(res, HTTP_STATUS.FORBIDDEN, managementValidation.error);
            }

            req.targetUser = targetUser;
            next();

        } catch (error) {
            console.error('User management access check error:', error);
            return errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, AUTH_MESSAGES.SYSTEM_ERROR);
        }
    };
};

export {
    authenticateJWT,
    optionalAuthenticateJWT,
    requireRole,
    requirePermission,
    requireAccessLevel,
    requireSystemAccess,
    requireDepartmentAccess,
    requireSelfOrAdminAccess,
    requireUserManagementAccess,
    rateLimitByUser,
    requireRole as checkRole
};
