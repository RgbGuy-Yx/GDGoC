const express = require('express');
const router = express.Router();

const candidateController = require('../controllers/candidateController');
const evaluationController = require('../controllers/evaluationController');
const transferController = require('../controllers/transferController');
const importController = require('../controllers/importController');

const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { authorizeCandidateAccess } = require('../middleware/candidateAccessMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All candidate routes require authentication
router.use(authenticateToken);

// 1. Spreadsheet Import (Admin only)
// POST /api/candidates/import
router.post(
  '/import',
  upload.single('file'),
  authorizeRoles('admin'),
  importController.handleImportSpreadsheet
);

// 2. Get all candidates (Admin only)
// GET /api/candidates
router.get('/', authorizeRoles('admin'), candidateController.handleGetAllCandidates);

// Admin-only global evaluation & transfer audit feeds
router.get('/admin/all-evaluations', authorizeRoles('admin'), evaluationController.handleGetAllEvaluationsAdmin);
router.get('/admin/all-transfers', authorizeRoles('admin'), transferController.handleGetAllTransfersAdmin);

// 3. Get candidates assigned to the logged-in team lead
// GET /api/candidates/assigned
router.get('/assigned', candidateController.handleGetAssignedCandidates);

// Candidates transferred out by the logged-in lead
router.get('/lead/transferred-by-me', async (req, res, next) => {
  try {
    const TransferLog = require('../models/TransferLog');
    const { successResponse } = require('../utils/apiResponse');
    const logs = await TransferLog.find({ 'transferredBy.id': req.user.id })
      .populate('candidate', 'candidateId rollNumber email preferredDomain currentDomain shortlistStatus')
      .populate('destinationLead', 'name assignedDomains')
      .sort({ timestamp: -1 });
    return successResponse(res, 200, 'Transferred by me logs retrieved', logs);
  } catch (err) {
    next(err);
  }
});

// 4. Candidate Detail & Action Routes (Protected by Domain/Role Authorization)

// GET /api/candidates/:id - Get candidate details
router.get('/:id', authorizeCandidateAccess, candidateController.handleGetCandidateDetails);

// PATCH /api/candidates/:id/shortlist - Update shortlist status
router.patch('/:id/shortlist', authorizeCandidateAccess, candidateController.handleUpdateShortlistStatus);

// POST /api/candidates/:id/evaluations - Add interview evaluation
router.post('/:id/evaluations', authorizeCandidateAccess, evaluationController.handleAddEvaluation);

// GET /api/candidates/:id/evaluations - Get candidate evaluation history
router.get('/:id/evaluations', authorizeCandidateAccess, evaluationController.handleGetEvaluations);

// POST /api/candidates/:id/transfer - Transfer candidate
router.post('/:id/transfer', authorizeCandidateAccess, transferController.handleTransferCandidate);

// GET /api/candidates/:id/transfers - Get candidate transfer history
router.get('/:id/transfers', authorizeCandidateAccess, transferController.handleGetTransferHistory);

// PATCH /api/candidates/:id/final-selection - Update final selection status (Admin ONLY)
router.patch(
  '/:id/final-selection',
  authorizeRoles('admin'),
  authorizeCandidateAccess,
  candidateController.handleUpdateFinalSelectionStatus
);

module.exports = router;
