// Validation messages constants
const VALIDATION_MESSAGES = {
    ACCOUNT_INACTIVE: 'Tài khoản đã bị vô hiệu hóa',
    INVALID_FPT_EMAIL: 'Email phải sử dụng domain @fpt.com',
    NO_ROLE_ASSIGNED: 'Chưa được phân quyền',
    NO_PERMISSIONS: 'Chưa có quyền cụ thể'
};

// User status constants
const USER_STATUS = {
    ACTIVE: true
};

class ValidationService {

    validateUserAccess(user) {
        const validationResults = {
            isValid: true,
            errors: [],
            warnings: []
        };

        // Check if user exists
        if (!user) {
            validationResults.isValid = false;
            validationResults.errors.push('Người dùng không tồn tại');
            return validationResults;
        }

        // Check account active status
        if (!user.isActive || user.isActive !== USER_STATUS.ACTIVE) {
            validationResults.isValid = false;
            validationResults.errors.push(VALIDATION_MESSAGES.ACCOUNT_INACTIVE);
        }

        // Check FPT email domain
        if (!this.validateFptEmail(user.email)) {
            validationResults.isValid = false;
            validationResults.errors.push(VALIDATION_MESSAGES.INVALID_FPT_EMAIL);
        }

        // Check role assignment
        if (!user.role) {
            validationResults.isValid = false;
            validationResults.errors.push(VALIDATION_MESSAGES.NO_ROLE_ASSIGNED);
        }

        // Check permissions (warning only, not blocking)
        if (!user.permissions || user.permissions.length === 0) {
            validationResults.warnings.push(VALIDATION_MESSAGES.NO_PERMISSIONS);
        }

        return validationResults;
    }

    /**
     * Validate FPT email domain
     */
    validateFptEmail(email) {
        if (!email) return false;
        const fptEmailRegex = /^[^\s@]+@fpt\.com$/;
        return fptEmailRegex.test(email);
    }

    validateUserRole(user, requiredRoles) {
        if (!user || !user.roleName) { // Kiểm tra user.roleName (string)
            return {
                isValid: false,
                error: 'Người dùng chưa được phân quyền'
            };
        }

        if (!Array.isArray(requiredRoles)) {
            requiredRoles = [requiredRoles];
        }

        const hasRequiredRole = requiredRoles.includes(user.roleName);

        return {
            isValid: hasRequiredRole,
            error: hasRequiredRole ? null : 'Không có quyền thực hiện chức năng này'
        };
    }

    validateUserPermission(user, requiredPermission) {
        if (!user || !user.permissions) {
            return {
                isValid: false,
                error: 'Người dùng chưa có quyền cụ thể'
            };
        }

        let permissions = [];

        // Parse permissions if it's a string
        try {
            if (Array.isArray(user.permissions)) {
                permissions = user.permissions;
            } else if (typeof user.permissions === 'string') {
                permissions = JSON.parse(user.permissions);
            }
        } catch (parseError) {
            console.error('Permission parsing error:', parseError);
            return {
                isValid: false,
                error: 'Lỗi phân tích quyền người dùng'
            };
        }

        const hasPermission = permissions.includes(requiredPermission);

        return {
            isValid: hasPermission,
            error: hasPermission ? null : `Không có quyền: ${requiredPermission}`
        };
    }

    validateAccessLevel(user, requiredLevel) {
        if (!user) {
            return {
                isValid: false,
                error: 'Người dùng không tồn tại'
            };
        }

        const UserModel = require('../models/userModel');
        const userModel = new UserModel(user);
        const userAccessLevel = userModel.getAccessLevel();

        const hasRequiredLevel = userAccessLevel >= requiredLevel;

        return {
            isValid: hasRequiredLevel,
            error: hasRequiredLevel ? null : 'Không đủ cấp độ truy cập'
        };
    }

    validateDepartmentAccess(user, targetDepartmentId) {
        if (!user) {
            return {
                isValid: false,
                error: 'Người dùng không tồn tại'
            };
        }

        // Admin can access all departments
        if (user.role === 'Admin') {
            return {isValid: true};
        }

        // Check if user belongs to target department or its parent departments
        const userDepartments = [
            user.parentDepartmentId,
            user.childDepartment1Id,
            user.childDepartment2Id
        ].filter(id => id !== null && id !== undefined);

        const hasAccess = userDepartments.includes(targetDepartmentId);

        return {
            isValid: hasAccess,
            error: hasAccess ? null : 'Không có quyền truy cập dữ liệu phòng ban này'
        };
    }

    validateUserManagementAccess(currentUser, targetUser) {
        if (!currentUser || !targetUser) {
            return {
                isValid: false,
                error: 'Thông tin người dùng không hợp lệ'
            };
        }

        // Admin can manage all users
        if (currentUser.role === 'Admin') {
            return {isValid: true};
        }

        const UserModel = require('../models/userModel');
        const currentUserModel = new UserModel(currentUser);
        const targetUserModel = new UserModel(targetUser);

        const currentUserLevel = currentUserModel.getAccessLevel();
        const targetUserLevel = targetUserModel.getAccessLevel();

        // User can only manage users with lower access level
        const canManage = currentUserLevel > targetUserLevel;

        return {
            isValid: canManage,
            error: canManage ? null : 'Không có quyền quản lý người dùng này'
        };
    }

    validatePasswordStrength(password) {
        const validationResults = {
            isValid: true,
            errors: [],
            score: 0
        };

        if (!password) {
            validationResults.isValid = false;
            validationResults.errors.push('Mật khẩu không được để trống');
            return validationResults;
        }

        // Check length
        if (password.length < 12) {
            validationResults.isValid = false;
            validationResults.errors.push('Mật khẩu phải có ít nhất 12 ký tự');
        } else {
            validationResults.score += 1;
        }

        // Check for lowercase
        if (!/[a-z]/.test(password)) {
            validationResults.isValid = false;
            validationResults.errors.push('Mật khẩu phải chứa ít nhất 1 chữ thường');
        } else {
            validationResults.score += 1;
        }

        // Check for uppercase
        if (!/[A-Z]/.test(password)) {
            validationResults.isValid = false;
            validationResults.errors.push('Mật khẩu phải chứa ít nhất 1 chữ hoa');
        } else {
            validationResults.score += 1;
        }

        // Check for numbers
        if (!/\d/.test(password)) {
            validationResults.isValid = false;
            validationResults.errors.push('Mật khẩu phải chứa ít nhất 1 số');
        } else {
            validationResults.score += 1;
        }

        // Check for special characters
        if (!/[@$!%*?&#]/.test(password)) {
            validationResults.isValid = false;
            validationResults.errors.push('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&#)');
        } else {
            validationResults.score += 1;
        }

        // Additional strength checks
        if (password.length >= 16) {
            validationResults.score += 1;
        }

        if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
            validationResults.score += 1;
        }

        return validationResults;
    }
}

export default new ValidationService();