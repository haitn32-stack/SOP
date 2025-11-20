import {instance} from '../utils/axios';

/**
 * Lấy thông tin profile của người dùng hiện tại từ server.
 */
export const getUserProfile = async () => {
    try {
        const response = await instance.get('/users/profile');
        return response.data.user;
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        throw error;
    }
};

/**
 * Gửi yêu cầu cập nhật thông tin profile của người dùng.
 * @param {object} profileData - Dữ liệu profile mới.
 */
export const updateUserProfile = async (profileData) => {
    try {
        const response = await instance.put('/users/profile', profileData);
        return response.data;
    } catch (error) {
        console.error('Failed to update profile:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error || 'Cập nhật thông tin thất bại.');
    }
};

/**
 * Lấy danh sách supervisor theo phòng ban cha
 * @param departmentId
 * @returns {Promise<*>}
 */
export const getAllSupervisorUser = async (departmentId) => {
    try {
        // Gửi departmentId làm query param
        const response = await instance.get('/users/supervisors', {
            params: {departmentId}
        });
        return response.data.users;
    } catch (error) {
        console.error('Failed to fetch supervisor list:', error);
        throw new Error('Không thể tải danh sách người dùng.');
    }
};