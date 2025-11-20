import Joi from 'joi';

const registerSchema = Joi.object({
    userName: Joi.string().required().messages({
        'any.required': 'Vui lòng nhập tên đăng nhập'
    }),
    email: Joi.string().email().trim().required().pattern(/^[^\s@]+@fpt\.com$/).messages({
        'any.required': 'Vui lòng nhập email',
        'string.email': 'Email không hợp lệ',
        'string.pattern.base': 'Email phải sử dụng domain @fpt.com'
    }),
    password: Joi.string().min(12).required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/)
        .messages({
            'any.required': 'Vui lòng nhập mật khẩu',
            'string.min': 'Mật khẩu phải chứa ít nhất 12 ký tự',
            'string.pattern': 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
        }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.required': 'Vui lòng nhập mật khẩu xác nhận',
        'any.only': 'Mật khẩu xác nhận không khớp'
    }),
});

const loginSchema = Joi.object({
    userName: Joi.string().required().messages({
        'any.required': 'Vui lòng nhập tên đăng nhập'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Vui lòng nhập mật khẩu',
    }),
});

const adminCreateUserSchema = Joi.object({
    fullName: Joi.string().required().messages({
        'any.required': 'Vui lòng nhập tên người dùng'
    }),
    email: Joi.string().email().trim().required().pattern(/^[^\s@]+@fpt\.com$/).messages({
        'any.required': 'Vui lòng nhập email',
        'string.email': 'Email không hợp lệ',
        'string.pattern.base': 'Email phải sử dụng domain @fpt.com'
    }),
    roleId: Joi.number().required().messages({
        'any.required': 'Vui lòng chọn vai trò'
    }),
    // Các trường này là tùy chọn
    mobilePhone: Joi.string().allow(null, ''),
    gender: Joi.string().allow(null, ''),
    dob: Joi.date().allow(null, '')
});

export {
    registerSchema,
    loginSchema,
    adminCreateUserSchema,
};
