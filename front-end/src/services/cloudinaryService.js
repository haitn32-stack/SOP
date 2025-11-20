import {instance} from '../utils/axios';

/**
 * Tải file avatar lên back-end, back-end sẽ tự xử lý với Cloudinary.
 * @param {File} file - File ảnh người dùng chọn
 * @returns {Promise<string>} - URL avatar mới
 */
export const uploadAvatar = async (file) => {
    try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await instance.post('/upload/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        // Trả về URL mới mà back-end đã xử lý
        return response.data.avatarUrl;

    } catch (error) {
        console.error("Avatar upload failed:", error);
        const errorMessage = error.response?.data?.error || "Upload ảnh thất bại.";
        throw new Error(errorMessage);
    }
};