const { errorResponse } = require('../utils/apiResponse');

/**
 * Role-based Authorization Middleware
 * @param  {...string} allowedRoles - e.g. 'admin', 'lead'
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Unauthorized. Please authenticate first.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Role '${req.user.role}' is not authorized to perform this action.`
      );
    }

    next();
  };
};

module.exports = {
  authorizeRoles
};
