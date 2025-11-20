import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class UploadService {
    /**
     * Upload một file buffer lên Cloudinary
     * @param {Buffer} fileBuffer - Buffer của file ảnh
     * @param {object} options - Các tùy chọn cho Cloudinary (ví dụ: folder)
     * @returns {Promise<object>} - Kết quả từ Cloudinary
     */
    uploadImageStream(fileBuffer, options = {}) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                options,
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            // Gửi buffer vào stream
            uploadStream.end(fileBuffer);
        });
    }
}

export default new UploadService();