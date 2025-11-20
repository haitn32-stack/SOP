import roleRepository from '../repositories/roleRepository.js';
import Logger from "../utils/logger.js";

class RoleController {
    /**
     * Lấy và trả về danh sách tất cả các vai trò.
     */
    getAllRoles = async (req, res) => {
        try {
            const roles = await roleRepository.findAll();
            res.status(200).json({
                success: true,
                roles
            });
        } catch (err) {
            Logger.error('Get all roles error:', {message: err.message, stack: err.stack});
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }
}

export default new RoleController();