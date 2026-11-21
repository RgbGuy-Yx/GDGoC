const candidateService = require('../services/candidateService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Transfer Candidate
 * POST /api/candidates/:id/transfer
 * Body: { destinationDomain, destinationLeadId?, transferReason, remarks? }
 */
const handleTransferCandidate = async (req, res, next) => {
  try {
    const { destinationDomain, destinationLeadId, transferReason, remarks } = req.body;

    if (!destinationDomain) {
      return errorResponse(res, 400, 'destinationDomain is required');
    }

    if (!transferReason) {
      return errorResponse(res, 400, 'transferReason is required');
    }

    const result = await candidateService.transferCandidate(req.candidate, req.user, {
      destinationDomain,
      destinationLeadId,
      transferReason,
      remarks
    });

    return successResponse(res, 200, 'Candidate transferred successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Candidate Transfer History
 * GET /api/candidates/:id/transfers
 */
const handleGetTransferHistory = async (req, res, next) => {
  try {
    const history = await candidateService.getCandidateTransfers(req.candidate._id);
    return successResponse(res, 200, 'Candidate transfer history retrieved successfully', history);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transfers across all candidates (Admin only)
 * GET /api/candidates/admin/all-transfers
 */
const handleGetAllTransfersAdmin = async (req, res, next) => {
  try {
    const transfers = await candidateService.getAllTransfersAdmin();
    return successResponse(res, 200, 'All transfer records retrieved successfully', transfers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleTransferCandidate,
  handleGetTransferHistory,
  handleGetAllTransfersAdmin
};
