const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Admin Login
 * POST /api/auth/admin-login
 * Body: { accessCode }
 */
const handleAdminLogin = async (req, res, next) => {
  try {
    const { accessCode } = req.body;
    if (!accessCode) {
      return errorResponse(res, 400, 'Access code is required');
    }

    const result = await authService.adminLogin(accessCode);
    return successResponse(res, 200, 'Admin authenticated successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Team Lead Login
 * POST /api/auth/lead-login
 * Body: { accessCode, name?, leadId? }
 */
const handleLeadLogin = async (req, res, next) => {
  try {
    const { accessCode, name, leadId } = req.body;
    if (!accessCode) {
      return errorResponse(res, 400, 'Access code is required');
    }

    const result = await authService.leadLogin({ accessCode, name, leadId });
    return successResponse(res, 200, 'Team lead authenticated successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current User
 * GET /api/auth/me
 */
const handleGetCurrentUser = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'User profile fetched successfully', {
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleAdminLogin,
  handleLeadLogin,
  handleGetCurrentUser
};
