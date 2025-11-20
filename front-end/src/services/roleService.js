import {instance} from '../utils/axios';

/**
 * Lấy danh sách tất cả các vai trò từ server.
 * @returns {Promise<Array>}
 */
export const getAllRoles = async () => {
    try {
        const response = await instance.get('/roles');
        return response.data.roles;
    } catch (error) {
        console.error('Failed to fetch roles:', error);
        throw new Error('Không thể tải danh sách vai trò.');
    }
};