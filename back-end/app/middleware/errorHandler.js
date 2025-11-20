import logger from '../utils/logger.js';
import {errorResponse} from "../utils/response.js";

const errorHandler = (err, req, res, next) => {
    let error = {...err};
    error.message = err.message;

    // Log error
    logger.error(`Error: ${error.message}`);

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const message = err.errors.map(val => val.message).join(', ');
        return errorResponse(res, 400, message);
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        const message = 'Dữ liệu đã tồn tại trong hệ thống';
        return errorResponse(res, 400, message);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 401, 'Token không hợp lệ');
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Token đã hết hạn');
    }

    // Default error
    return errorResponse(res, error.statusCode || 500, error.message || 'Lỗi hệ thống');
};

export default errorHandler;