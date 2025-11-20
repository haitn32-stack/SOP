import {instance} from '../utils/axios';

/**
 * Lấy danh sách phòng ban.
 * @param {number|null} parentId - ID của phòng ban cha. Nếu null, lấy các đơn vị cấp cao nhất.
 */
export const getDepartments = async (parentId = null) => {
    try {
        const params = parentId ? {parentId} : {};
        const response = await instance.get('/departments', {params});
        return response.data.departments;
    } catch (error) {
        console.error('Failed to fetch departments:', error);
        throw new Error('Không thể tải danh sách phòng ban.');
    }
};