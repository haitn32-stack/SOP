import {Role} from '../models/index.js';

class RoleRepository {
    /**
     * Lấy tất cả các vai trò từ database.
     * @returns {Promise<Role[]>}
     */
    async findAll() {
        return await Role.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']] // Sắp xếp theo tên cho dễ nhìn
        });
    }
}

export default new RoleRepository();