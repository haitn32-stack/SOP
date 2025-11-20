import userRepository from '../repositories/userRepository.js';
import UserModel from "../models/userDTO.js";
import Logger from "../utils/logger.js";
import {adminCreateUserSchema} from "../utils/validation.js";
import bcrypt from "bcryptjs";

const DEFAULT_PASSWORD = 'Hai123456!@#';

class UserController {
    getSearchSuggestions = async (req, res) => {
        try {
            const {keyword} = req.query;
            if (!keyword) {
                return res.status(400).json({success: false, suggestions: []});
            }

            const users = userRepository.searchSuggestions(keyword);

            return res.status(200).json({success: true, suggestions: users});
        } catch (err) {
            Logger.error('Suggestions error', err);
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }

    bulkUpdateStatus = async (req, res) => {
        try {
            const {userIds, isActive} = req.body;

            if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({success: false, error: 'Danh sách user không hợp lệ'});
            }

            await userRepository.updateBulkStatus(userIds, isActive);

            res.status(200).json({
                success: true,
                message: isActive ? 'Kích hoạt tài khoản thành công' : 'Khoá tài khoản thành công'
            });
        } catch (err) {
            Logger.error('Bulk update status error: ', err);
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }

    getAllUsers = async (req, res) => {
        try {
            // Phân tích các tham số query với giá trị mặc định
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.page_size) || 20;
            const search = req.query.search || '';
            const sort = req.query.sort || 'createdAt';
            const order = req.query.order || 'DESC';

            const filters = {
                isActive: req.query.isActive,
                roleId: req.query.roleId,
                locationId: req.query.locationId,
                parentDepartmentId: req.query.parentDepartmentId,
                childDepartment1Id: req.query.childDepartment1Id,
                childDepartment2Id: req.query.childDepartment2Id,
                supervisorId: req.query.supervisorId,
            }

            // Gọi repository
            const result = await userRepository.findAllPaginated({
                page, pageSize, search, sort, order
            });

            // Trả về response thành công
            res.status(200).json({
                success: true,
                users: result.users,
                total: result.total,
                total_pages: result.totalPages,
                current_page: page
            });
        } catch (error) {
            Logger.error('Get all users error:', {message: error.message, stack: error.stack});
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }

    updateAvatar = async (req, res) => {
        try {
            // Lấy userId từ middleware xác thực (đã lưu trong req.user)
            const userId = req.user.userId;
            const {avatarUrl} = req.body;

            if (!avatarUrl) {
                return res.status(400).json({success: false, error: 'Avatar URL is required'});
            }

            await userRepository.updateAvatar(userId, avatarUrl);

            res.status(200).json({
                success: true,
                message: 'Cập nhật avatar thành công'
            });

        } catch (err) {
            Logger.error('Update avatar error:', {message: err.message, stack: err.stack});
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }

    getProfile = async (req, res) => {
        try {
            // userId được lấy từ token qua middleware authenticateJWT
            const user = await userRepository.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({success: false, error: 'User not found'});
            }
            // Dùng userModel để trả về dữ liệu an toàn
            res.status(200).json({
                success: true,
                user: new UserModel(user).toSafeObject()
            });
        } catch (error) {
            Logger.error('Get profile error:', {message: err.message, stack: err.stack});
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }

    updateProfile = async (req, res) => {
        try {
            const userId = req.user.userId; // Lấy từ token đã xác thực
            const profileData = req.body;

            await userRepository.updateProfile(userId, profileData);

            // Lấy lại thông tin user mới nhất sau khi cập nhật
            const updatedUser = await userRepository.findById(userId);

            res.status(200).json({
                success: true,
                message: 'Cập nhật thông tin thành công',
                user: updatedUser // Trả về user đã cập nhật
            });

        } catch (error) {
            Logger.error('Update profile error:', {message: err.message, stack: err.stack});
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }

    getUserById = async (req, res) => {
        try {
            const {id} = req.params; // Lấy id từ URL
            const user = await userRepository.findDetailsById(id);

            if (!user) {
                return res.status(404).json({success: false, error: 'User not found'});
            }

            // Dùng DTO để định dạng dữ liệu trả về
            const userDto = new UserModel(user.toJSON());
            res.status(200).json({success: true, user: userDto.toSafeObject()});

        } catch (err) {
            Logger.error('Get user by ID error:', {message: err.message, stack: err.stack});
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }

    createUser = async (req, res) => {
        try {
            // Validate dữ liệu
            const {error, value} = adminCreateUserSchema.validate(req.body);
            if (error) {
                Logger.warn(`Admin create user validation failed: ${error.details[0].message}`);
                return res.status(400).json({
                    success: false,
                    error: error.details[0].message
                });
            }

            // Tạo mật khẩu mặc định
            const hashPwd = await bcrypt.hash(DEFAULT_PASSWORD, 10);

            // Gộp dữ liệu để tạo user
            const userData = {
                ...value,
                hashPwd: hashPwd,
                userName: value.email.split('@')[0] // Dùng phần trước email làm username
            };

            // Gọi Repository
            const newUser = await userRepository.create(userData);

            res.status(201).json({
                success: true,
                message: 'Tạo tài khoản thành công',
                user: newUser // userRepository.create trả về userId
            });

        } catch (err) {
            Logger.error('Admin create user error:', {message: err.message, stack: err.stack});
            // Xử lý lỗi trùng email/username
            if (err.message.includes('đã tồn tại')) {
                return res.status(400).json({
                    success: false,
                    error: err.message
                });
            }
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }

    updateUserRole = async (req, res) => {
        try {
            const {id} = req.params;
            const {roleId} = req.body;

            if (!roleId) {
                return res.status(400).json({success: false, error: 'Vui lòng cung cấp Role ID'});
            }

            await userRepository.updateUserRole(id, roleId);

            res.status(200).json({
                success: true,
                message: 'Cập nhật vai trò thành công'
            });

        } catch (err) {
            Logger.error('Update user role error:', {message: err.message, stack: err.stack});
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }

    updateUserStatus = async (req, res) => {
        try {
            const {id} = req.params;
            const {isActive} = req.body; // Nhận trạng thái mới

            await userRepository.updateUserStatus(id, isActive);

            res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái thành công'
            });
        } catch (err) {
            Logger.error('Update user status error:', {message: err.message, stack: err.stack});
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }

    getSupervisorList = async (req, res) => {
        try {
            // Lấy departmentId từ query string
            const {departmentId} = req.query;

            if (!departmentId) {
                return res.status(200).json({success: true, users: []}); // return mảng rỗng
            }

            // Gọi repository
            const users = await userRepository.findSupervisorsByDepartment(departmentId);

            // Format lại dữ liệu
            const formattedUsers = users.map(user => ({
                userId: user.userId,
                // Ghép tên và jobCode
                fullName: `${user.fullName} - ${user.jobCode || ''}`.trim()
            }));

            res.status(200).json({
                success: true,
                users: formattedUsers
            });
        } catch (err) {
            Logger.error('Get Supervisor List error:', {message: err.message, stack: err.stack});
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }
}

export default new UserController();