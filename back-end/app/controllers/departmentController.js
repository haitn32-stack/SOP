import departmentRepository from '../repositories/departmentRepository.js';
import Logger from "../utils/logger.js";

class DepartmentController {
    getDepartments = async (req, res) => {
        try {
            const {parentId} = req.query; // Lấy parentId từ query param
            let departments;

            if (parentId) {
                // Nếu có parentId, tìm các phòng ban con
                departments = await departmentRepository.findByParentId(parentId);
            } else {
                // Nếu không có parentId, lấy các đơn vị cấp cao nhất
                departments = await departmentRepository.findTopLevel();
            }

            res.status(200).json({success: true, departments});
        } catch (err) {
            Logger.error('Get departments error:', {message: err.message, stack: err.stack});
            res.status(500).json({success: false, error: 'Lỗi hệ thống'});
        }
    }
}

export default new DepartmentController();