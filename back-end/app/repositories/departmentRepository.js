import Department from '../models/departmentModel.js';

class DepartmentRepository {
    async findTopLevel() {
        return await Department.findAll({where: {parentId: null}});
    }

    // Lấy các phòng ban con dựa vào ID của cha
    async findByParentId(parentId) {
        return await Department.findAll({
            where: {parentId: parentId}
        });
    }
}

export default new DepartmentRepository();