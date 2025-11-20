import uploadService from '../business/uploadService.js';
import Logger from "../utils/logger.js";
import userRepository from '../repositories/userRepository.js';

class UploadController {
    uploadAvatar = async (req, res) => {
        try {
            const userId = req.user.userId; // Lấy từ middleware authenticateJWT
            const file = req.file; // Lấy file từ middleware multer
            console.log(file);
            if (!file) {
                return res.status(400).json({success: false, error: 'Không có file nào được tải lên.'});
            }

            // Upload file buffer lên Cloudinary
            const result = await uploadService.uploadImageStream(
                file.buffer,
                {
                    folder: 'avatars',
                    public_id: `user_${userId}_avatar` // Ghi đè avatar cũ của user
                }
            );

            const newAvatarUrl = result.secure_url;

            // Cập nhật URL avatar mới vào database
            await userRepository.updateAvatar(userId, newAvatarUrl);

            // Trả về URL mới cho front-end
            res.status(200).json({
                success: true,
                message: 'Cập nhật avatar thành công',
                avatarUrl: newAvatarUrl
            });

        } catch (error) {
            Logger.error('Error uploading avatar:', {message: error.message, stack: error.stack});
            res.status(500).json({
                success: false,
                error: 'Lỗi hệ thống khi tải ảnh lên'
            });
        }
    }
}

export default UploadController;