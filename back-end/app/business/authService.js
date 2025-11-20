import UserModel from '../models/userDTO.js';
import validationService from "./validateService.js";
import tokenService from './tokenService.js';
import userRepository from "../repositories/userRepository.js";
import bcrypt from 'bcryptjs';

// Auth messages constants
const AUTH_MESSAGES = {
    USERNAME_EXISTS: 'Tên đăng nhập đã tồn tại',
    EMAIL_EXISTS: 'Email đã tồn tại',
    USER_CREATION_FAILED: 'Lỗi khi tạo người dùng',
    ACCOUNT_NOT_EXISTS: 'Tài khoản không tồn tại',
    ACCOUNT_DEACTIVATED: 'Tài khoản đã bị vô hiệu hóa',
    INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không chính xác',
    INVALID_TOKEN: 'Token không hợp lệ',
    ACCESS_REVOKED: 'Quyền truy cập đã bị thu hồi',
    NO_SYSTEM_ACCESS: 'Không có quyền truy cập hệ thống'
};

class AuthService {
    async register(userData) {
        const {userName, email, password} = userData;

        // Check if user exists
        const existedUser = await userRepository.findByUsernameOrEmail(userName, email);
        if (existedUser) {
            if (existedUser.userName === userName) {
                throw new Error(AUTH_MESSAGES.USERNAME_EXISTS);
            }
            if (existedUser.email === email) {
                throw new Error(AUTH_MESSAGES.EMAIL_EXISTS);
            }
        }

        // Hash password
        const hashedPassword = await this.hashPassword(password);

        // Create user data
        const newUserData = {
            userName: userName.trim(),
            email: email.trim().toLowerCase(),
            hashPwd: hashedPassword
        };

        // Create user in DB (avoid logging sensitive user data)
        const userId = await userRepository.create(newUserData);
        console.log('User created');

        // Get created user with role information
        const createdUser = await userRepository.findById(userId);

        if (!createdUser) {
            throw new Error(AUTH_MESSAGES.USER_CREATION_FAILED);
        }

        // Validate user access (business logic validation)
        const accessValidation = validationService.validateUserAccess(createdUser);
        // Nếu có lỗi thì ném lỗi
        if (!accessValidation.isValid) {
            const error = new Error(AUTH_MESSAGES.NO_SYSTEM_ACCESS);
            error.details = accessValidation.errors;
            error.isAccessError = true;
            throw error;
        }


        // Generate JWT
        const tokenData = tokenService.generateTokens(createdUser);

        const userModel = new UserModel(createdUser);

        return {
            user: userModel.toSafeObject(),
            tokens: tokenData,
            accessWarnings: accessValidation.warnings || []
        };
    }

    async login(credentials) {
        const {userName, password} = credentials;

        // Find user in DB
        const user = await userRepository.findByUsername(userName.trim());
        if (!user) {
            throw new Error(AUTH_MESSAGES.ACCOUNT_NOT_EXISTS);
        }

        // Check user active
        if (!user.isActive) {
            throw new Error(AUTH_MESSAGES.ACCOUNT_DEACTIVATED);
        }

        // Verify password
        const isValidPassword = await this.verifyPassword(password, user.hashPwd);
        if (!isValidPassword) {
            throw new Error(AUTH_MESSAGES.INVALID_CREDENTIALS);
        }

        // Validate access (business logic validation)
        const accessValidation = validationService.validateUserAccess(user);
        if (!accessValidation.isValid) {
            const error = new Error(AUTH_MESSAGES.NO_SYSTEM_ACCESS);
            error.details = accessValidation.errors;
            error.isAccessError = true;
            throw error;
        }

        // Generate JWT
        const tokenData = tokenService.generateTokens(user);

        // Update last login
        await userRepository.updateLastLogin(user.userId);

        return {
            user: new UserModel(user).toSafeObject(),
            tokens: tokenData,
            accessLevel: new UserModel(user).getAccessLevel()
        };
    }

    /**
     * Verify token and get user
     * (This function is called by controller after middleware has already decoded token)
     */
    async verifyUserToken(user) {
        if (!user) {
            throw new Error(AUTH_MESSAGES.INVALID_TOKEN);
        }

        // Re-validate access (permissions might change)
        const accessValidation = validationService.validateUserAccess(user);
        if (!accessValidation.isValid) {
            const error = new Error(AUTH_MESSAGES.ACCESS_REVOKED);
            error.details = accessValidation.errors;
            error.isAccessError = true;
            throw error;
        }

        return new UserModel(user).toSafeObject();
    }

    async hashPassword(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    async verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }

    async refreshToken(refreshToken) {
        const decoded = tokenService.verifyRefreshToken(refreshToken);

        const user = await userRepository.findById(decoded.userId);
        if (!user || !user.isActive) {
            throw new Error(AUTH_MESSAGES.INVALID_TOKEN);
        }

        // Validate access
        const accessValidation = validationService.validateUserAccess(user);
        if (!accessValidation.isValid) {
            throw new Error(AUTH_MESSAGES.ACCESS_REVOKED);
        }

        return tokenService.generateTokens(user);
    }
}

export default new AuthService();