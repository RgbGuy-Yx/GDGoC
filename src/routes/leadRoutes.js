const express = require('express');
const router = express.Router();

const leadController = require('../controllers/leadController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// GET /api/leads/domains - Get all active/available recruitment domains dynamically
router.get('/domains', leadController.handleGetDomains);

// GET /api/leads - View list of leads (accessible to leads & admin for transfer selections)
router.get('/', leadController.handleGetAllLeads);

// POST /api/leads - Create new lead (Admin only)
router.post('/', authorizeRoles('admin'), leadController.handleCreateLead);

module.exports = router;
