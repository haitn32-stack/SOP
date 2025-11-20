import multer from 'multer';

// Lưu file trong bộ nhớ (RAM) thay vì lưu vào đĩa
const storage = multer.memoryStorage();

// Cấu hình multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Giới hạn 5MB (giống logic validate của bạn)
    },
    fileFilter: (req, file, cb) => {
        // Chỉ chấp nhận các định dạng ảnh
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
            cb(null, true);
        } else {
            cb(new Error('Định dạng file không hợp lệ. Chỉ chấp nhận JPG, JPEG, PNG.'), false);
        }
    }
});

export default upload;