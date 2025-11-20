import authService from '../business/authService.js';
import {loginSchema, registerSchema} from '../utils/validation.js'
import {decryptBase64ToUtf8} from "../utils/rsa.js";
import dotenv from "dotenv";
import UserModel from '../models/userDTO.js';
import Logger from "../utils/logger.js";

dotenv.config();

class AuthController {

    register = async (req, res) => {
        try {
            // Tạo một bản sao của req.body để có thể thay đổi
            const dataToProcess = {...req.body};

            // Thay đổi trực tiếp trên bản sao `dataToProcess`
            if (req.headers['x-enc'] === 'rsa' && typeof dataToProcess.password === 'string') {
                dataToProcess.password = decryptBase64ToUtf8(dataToProcess.password);
                if (typeof dataToProcess.confirmPassword === 'string') {
                    dataToProcess.confirmPassword = decryptBase64ToUtf8(dataToProcess.confirmPassword);
                }
            }

            // Validate
            const {error, value} = registerSchema.validate(dataToProcess);
            if (error) {
                Logger.warn(`Registration validation failed: ${error.details[0].message}`);
                return res.status(400).json({
                    success: false,
                    message: error.details?.map(detail => detail.message).join('\n')
                });
            }

            // Gọi Service với dữ liệu `value` đã được validate
            const result = await authService.register(value);

            res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                data: {
                    token: result.tokens.accessToken,
                    refreshToken: result.tokens.refreshToken,
                    user: result.user,
                    accessWarnings: result.accessWarnings || []
                }
            });
        } catch (err) {
            Logger.error('Registration error:', {message: err.message, stack: err.stack});
            // Xử lý lỗi cụ thể từ service
            if (err.message === 'Tên đăng nhập đã tồn tại' || err.message === 'Email đã tồn tại') {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            if (err.message === 'Lỗi khi tạo người dùng') {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }
            res.status(500).json({
                success: false,
                error: 'Lỗi hệ thống. Vui lòng thử lại sau'
            });
        }
    }

    login = async (req, res) => {
        try {
            const body = {...req.body};
            if (req.headers['x-enc'] === 'rsa' && typeof body.password === 'string') {
                body.password = decryptBase64ToUtf8(body.password);
            }
            const {error, value} = loginSchema.validate(body);
            if (error) {
                Logger.warn(`Login validation failed: ${error.details[0].message}`);
                return res.status(400).json({
                    success: false,
                    message: error.details[0].message
                });
            }

            const result = await authService.login(value);
            const userModelInstance = new UserModel(result.user);
            const safeUser = userModelInstance.toSafeObject();

            res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công!',
                data: {
                    token: result.tokens.accessToken,
                    refreshToken: result.tokens.refreshToken,
                    user: result.user,
                    redirectTo: '/dashboard'
                }
            });
        } catch (err) {
            Logger.error('Login error:', {message: err.message, stack: err.stack});
            // Xử lý lỗi cụ thể từ service
            if (err.isAccessError) {
                return res.status(403).json({
                    success: false,
                    error: err.message,
                    details: err.details,
                    noSystemAccess: true
                });
            }
            if (err.message === 'Tài khoản không tồn tại' || err.message === 'Tên đăng nhập hoặc mật khẩu không chính xác') {
                return res.status(401).json({
                    success: false,
                    error: err.message,
                    requireAuthentication: true
                });
            }
            if (err.message === 'Tài khoản đã bị vô hiệu hóa') {
                return res.status(401).json({
                    success: false,
                    error: err.message,
                    requireAuthentication: true
                });
            }
            res.status(500).json({
                success: false,
                error: 'Lỗi hệ thống. Vui lòng thử lại sau.',
                requireAuthentication: true
            });
        }
    }

    verifyToken = async (req, res) => {
        try {
            // req.user đã được middleware authenticateJWT gán
            const user = req.user;

            // Gọi service để verify token và lấy thông tin user an toàn
            const verifiedUser = await authService.verifyUserToken(user);

            res.status(200).json({
                valid: true,
                user: verifiedUser
            })
        } catch (err) {
            Logger.error('Token validation error:', err);
            if (err.isAccessError) {
                return res.status(403).json({
                    valid: false,
                    error: err.message,
                    details: err.details
                });
            }
            if (err.message === 'Token không hợp lệ' || err.message === 'Quyền truy cập đã bị thu hồi') {
                return res.status(401).json({valid: false, error: err.message});
            }
            res.status(500).json({error: 'Lỗi hệ thống. Vui lòng thử lại sau.'})
        }
    }

    logout = async (req, res) => {
        try {
            // Logic logout thực hiện phía client
            res.status(200).json({message: 'Đăng xuất thành công'})
        } catch (err) {
            console.error('Lỗi đăng xuất:', err);
            res.status(500).json({error: 'Lỗi hệ thống. Vui lòng thử lại sau.'})
        }
    }

    // Thêm route refresh token
    refreshToken = async (req, res) => {
        try {
            const {refreshToken} = req.body;
            if (!refreshToken) {
                return res.status(400).json({success: false, message: 'Refresh token is required'});
            }

            const newTokens = await authService.refreshToken(refreshToken);

            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: newTokens
            });
        } catch (err) {
            Logger.error('Refresh token error:', err.message);
            if (err.message === 'Token không hợp lệ' || err.message === 'Quyền truy cập đã bị thu hồi') {
                return res.status(401).json({success: false, error: err.message});
            }
            res.status(500).json({success: false, error: 'Lỗi hệ thống. Vui lòng thử lại sau.'});
        }
    }
}

export default AuthController;