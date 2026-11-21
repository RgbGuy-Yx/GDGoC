const jwt = require('jsonwebtoken');
const config = require('../config');
const Admin = require('../models/Admin');
const TeamLead = require('../models/TeamLead');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Authentication Middleware:
 * Verifies JWT token and attaches user information to req.user
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Authentication token missing or invalid format. Format: Bearer <token>');
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Token has expired. Please log in again.');
      }
      return errorResponse(res, 401, 'Invalid authentication token.');
    }

    // Verify user still exists in database
    let user;
    if (decoded.role === 'admin') {
      user = await Admin.findById(decoded.id);
      if (!user) {
        return errorResponse(res, 401, 'Admin user account not found or revoked.');
      }
      req.user = {
        id: user._id.toString(),
        name: user.name,
        role: 'admin',
        domains: ['*'] // full domain access
      };
    } else if (decoded.role === 'lead') {
      user = await TeamLead.findById(decoded.id);
      if (!user) {
        return errorResponse(res, 401, 'Team lead account not found or revoked.');
      }
      if (!user.isActive) {
        return errorResponse(res, 403, 'Team lead account is inactive.');
      }
      req.user = {
        id: user._id.toString(),
        name: user.name,
        role: 'lead',
        domains: user.assignedDomains || []
      };
    } else {
      return errorResponse(res, 401, 'Invalid user role in token.');
    }

    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  authenticateToken
};
