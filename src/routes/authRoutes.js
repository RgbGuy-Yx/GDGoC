const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public authentication routes
router.post('/admin-login', authController.handleAdminLogin);
router.post('/lead-login', authController.handleLeadLogin);

// Protected routes
router.get('/me', authenticateToken, authController.handleGetCurrentUser);

module.exports = router;
