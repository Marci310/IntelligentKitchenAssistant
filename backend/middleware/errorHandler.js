
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, 404, 'RESOURCE_NOT_FOUND');
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field} already exists`;
        error = new AppError(message, 409, 'DUPLICATE_KEY', { field });
    }

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        error = new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
    }

    res.status(error.statusCode || 500).json({
        error: {
            code: error.code || 'INTERNAL_ERROR',
            message: error.message || 'Internal server error',
            ...(error.details && { details: error.details }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

const notFound = (req, res, next) => {
    const error = new AppError(
        `No recipes here - ${req.originalUrl}`,
        404,
        'ROUTE_NOT_FOUND'
    );
    next(error);
};

module.exports = {
    AppError,
    errorHandler,
    notFound
};