const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'test' || !err.statusCode || err.statusCode >= 500) {
    console.error('[Error Details]:', err.message || err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message
    }));
    return errorResponse(res, 400, 'Validation Error', errors);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue);
    const message = `Duplicate field value entered for [${fields.join(', ')}]. Please use unique values.`;
    return errorResponse(res, 409, message, err.keyValue);
  }

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    return errorResponse(res, 400, `Invalid format for field '${err.path}': ${err.value}`);
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    return errorResponse(res, 400, `File upload error: ${err.message}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 401, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 401, 'Authentication token has expired');
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};

const notFoundHandler = (req, res) => {
  return errorResponse(res, 404, `Endpoint not found: ${req.method} ${req.originalUrl}`);
};

module.exports = {
  errorHandler,
  notFoundHandler
};
