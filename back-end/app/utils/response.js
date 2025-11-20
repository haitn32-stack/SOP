const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
    const response = {
        success: true,
        message: message
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', additionalData = null) => {
    const response = {
        success: false,
        error: message
    };

    if (additionalData) {
        Object.assign(response, additionalData);
    }

    return res.status(statusCode).json(response);
};

const validationErrorResponse = (res, errors) => {
    return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors
    });
};

const notFoundResponse = (res, message = 'Resource not found') => {
    return res.status(404).json({
        success: false,
        error: message
    });
};

const unauthorizedResponse = (res, message = 'Unauthorized') => {
    return res.status(401).json({
        success: false,
        error: message
    });
};

export {
    successResponse,
    errorResponse,
    validationErrorResponse,
    notFoundResponse,
    unauthorizedResponse,
};