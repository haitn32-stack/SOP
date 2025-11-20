import {Department, Location, Role, User} from '../models/index.js';
import {Op} from 'sequelize';
import UserModel from "../models/userDTO.js";

class UserRepository {
    async findSupervisorsByDepartment(departmentId) {
        const supervisorRoles = [
            'Giám đốc trung tâm',
            'Giám đốc chi nhánh',
            'Phó giám đốc trung tâm',
            'Giám đốc khu vực',
            'Phó giám đốc chi nhánh',
            'Phó giám đốc khu vực',
            'Trưởng phòng',
            'Phó phòng'
        ];

        try {
            return await User.findAll({
                where: {
                    isActive: true,
                    // Lọc theo phòng ban cha
                    parentDepartmentId: departmentId
                },
                include: [{
                    model: Role,
                    as: 'role',
                    // Lọc theo vai trò (chỉ lấy các vai trò trong danh sách)
                    where: {
                        name: {[Op.in]: supervisorRoles}
                    },
                    attributes: [] // Không cần lấy thông tin từ bảng Role
                }],
                attributes: ['userId', 'fullName', 'jobCode'],
                order: [['fullName', 'ASC']]
            });
        } catch (error) {
            console.error('Error fetching simple user list:', error);
            throw error;
        }
    }

    async create(userData) {
        try {
            // Sequelize sẽ tự động chuyển camelCase (userName) thành snake_case (user_name)
            const user = await User.create(userData);
            return user.userId;
        } catch (error) {
            // Bắt lỗi ràng buộc UNIQUE
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new Error('Tên đăng nhập hoặc email đã tồn tại');
            }
            console.error('Error creating user:', error);
            throw new Error('Lỗi khi tạo người dùng trong repository');
        }
    }

    // Helper function để tránh lặp code
    _formatUserWithRole(user) {
        if (user) {
            const userData = user.toJSON();
            userData.roleName = userData.role?.name;
            userData.permissions = userData.role?.permission || [];
            return userData;
        }
        return null;
    }

    async findById(userId) {
        try {
            const user = await User.findOne({
                where: {userId}, // Luôn dùng camelCase
                include: [{model: Role, as: 'role', attributes: ['id', 'name', 'permission']}]
            });
            return this._formatUserWithRole(user);
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    async findByUsername(userName) {
        try {
            const user = await User.findOne({
                where: {userName}, // Luôn dùng camelCase
                include: [{model: Role, as: 'role', attributes: ['id', 'name', 'permission']}]
            });
            return this._formatUserWithRole(user);
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    }

    async findByUsernameOrEmail(userName, email) {
        try {
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        {userName: userName}, // Luôn dùng camelCase
                        {email: email}
                    ]
                }
            });
            return user ? user.toJSON() : null; // Hàm này chỉ để check tồn tại nên không cần format
        } catch (error) {
            console.error('Error checking existing user:', error);
            throw error;
        }
    }

    async updateLastLogin(userId) {
        try {
            await User.update({updatedAt: new Date()}, {where: {userId}});
        } catch (error) {
            console.error('Error updating last login:', error);
            throw error;
        }
    }

    async updateAvatar(userId, avatarUrl) {
        return await User.update(
            {avatar: avatarUrl},
            {where: {userId: userId}}
        );
    }

    async updateProfile(userId, profileData) {
        const {
            userId: excludedUserId,
            isActive: excludedIsActive,
            ...updatableData
        } = profileData;

        return await User.update(updatableData, {
            where: {userId: userId}
        });
    }

    async findAllPaginated({page, pageSize, search, sort, order, filters}) {
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        // Xử lý điều kiện tìm kiếm
        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                {userName: {[Op.like]: `%${search}%`}},
                {fullName: {[Op.like]: `%${search}%`}},
                {email: {[Op.like]: `%${search}%`}},
                {mobilePhone: {[Op.like]: `%${search}%`}}
            ];
        }

        // Xử lý filters
        if (filters) {
            if (filters.isActive !== undefined && filters.isActive !== '') {
                whereClause.isActive = filters.isActive === 'true';
            }
            if (filters.roleId) whereClause.roleId = filters.roleId;
            if (filters.locationId) whereClause.locationId = filters.locationId;
            if (filters.parentDepartmentId) whereClause.parentDepartmentId = filters.parentDepartmentId;
            if (filters.childDepartment1Id) whereClause.childDepartment1Id = filters.childDepartment1Id;
            if (filters.childDepartment2Id) whereClause.childDepartment2Id = filters.childDepartment2Id;
            if (filters.supervisorId) whereClause.supervisorId = filters.supervisorId;
        }

        // Xử lý sort
        let orderClause = [['createdAt', 'DESC']];

        if (sort && order) {
            const direction = order.toUpperCase();
            switch (sort) {
                case 'fullName':
                    orderClause: [['fullName', direction]];
                    break;
                case 'email':
                    orderClause = [['email', direction]];
                    break;
                case 'role':
                    orderClause = [[{model: Role, as: 'role'}, 'name', direction]];
                    break;
                case 'department':
                    orderClause = [[{model: Department, as: 'parentDepartment'}, 'name', direction]];
                    break;
                default:
                    orderClause = [[sort, direction]];
            }
        }

        // Thực thi truy vấn
        const {count, rows} = await User.findAndCountAll({
            where: whereClause,
            include: [
                {model: Role, as: 'role', attributes: ['name']},
                {model: Location, as: 'location', attributes: ['name']},
                {model: Department, as: 'parentDepartment', attributes: ['name']},
                {model: Department, as: 'childDepartment1', attributes: ['name']},
                {model: Department, as: 'childDepartment2', attributes: ['name']}
            ],
            limit: limit,
            offset: offset,
            order: [[sort, order]],
            distinct: true
        });

        // Định dạng lại dữ liệu trước khi trả về
        const formattedUsers = rows.map(user => {
            const safeUser = new UserModel(user).toSafeObject();
            // Làm phẳng dữ liệu cho front-end dễ hiển thị
            return {
                ...safeUser,
                trang_thai: safeUser.isActive ? 'Kích hoạt' : 'Khoá',
                ten_nguoi_dung: safeUser.fullName || safeUser.userName,
                dia_diem: safeUser.location?.name,
                vai_tro: safeUser.role?.name,
                don_vi_chu_quan: safeUser.parentDepartment?.name,
                phong_ban_1: safeUser.childDepartment1?.name,
                phong_ban_2: safeUser.childDepartment2?.name,
                chuc_danh: safeUser.jobTitle,
                can_bo_quan_ly: safeUser.supervisor?.fullName
            };
        });

        return {
            total: count,
            totalPages: Math.ceil(count / limit),
            users: formattedUsers
        };
    }

    async updateBulkStatus(userIds, isActive) {
        return await User.update(
            {isActive: isActive},
            {
                where: {
                    userId: {[Op.in]: userIds}
                }
            }
        );
    }

    async searchSuggestions(keyword) {
        return await User.findAll({
            where: {
                [Op.or]: [
                    {fullName: {[Op.like]: `%${keyword}%`}},
                    {email: {[Op.like]: `%${keyword}%`}},
                    {mobilePhone: {[Op.like]: `%${keyword}%`}}
                ]
            },
            attributes: ['userId', 'fullName', 'email', 'mobilePhone', 'avatar'],
            limit: 5
        });
    }

    async findDetailsById(userId) {
        return await User.findByPk(userId, {
            include: [
                {model: Role, as: 'role'},
                {model: Location, as: 'location'},
                {model: User, as: 'supervisor', attributes: ['userId', 'fullName']},
                {model: Department, as: 'parentDepartment'},
                {model: Department, as: 'childDepartment1'},
                {model: Department, as: 'childDepartment2'}
            ]
        });
    }

    async updateUserRole(userId, roleId) {
        return await User.update(
            {roleId: roleId},
            {where: {userId: userId}}
        );
    }

    async updateUserStatus(userId, isActive) {
        return await User.update(
            {isActive: isActive},
            {where: {userId: userId}}
        );
    }
}

export default new UserRepository();