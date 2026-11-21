const candidateService = require('../services/candidateService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get all candidates (Admin only)
 * GET /api/candidates
 */
const handleGetAllCandidates = async (req, res, next) => {
  try {
    const { candidates, pagination } = await candidateService.getAllCandidates(req.query);
    return successResponse(res, 200, 'Candidates retrieved successfully', candidates, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get assigned candidates for logged-in team lead
 * GET /api/candidates/assigned
 */
const handleGetAssignedCandidates = async (req, res, next) => {
  try {
    const { candidates, pagination } = await candidateService.getAssignedCandidates(
      req.user,
      req.query
    );
    return successResponse(res, 200, 'Assigned candidates retrieved successfully', candidates, { pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get candidate details
 * GET /api/candidates/:id
 */
const handleGetCandidateDetails = async (req, res, next) => {
  try {
    // req.candidate is already attached and access-checked by authorizeCandidateAccess middleware
    const details = await candidateService.getCandidateDetails(req.candidate, req.user, req.query);
    return successResponse(res, 200, 'Candidate details retrieved successfully', details);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Shortlist Status
 * PATCH /api/candidates/:id/shortlist
 * Body: { shortlistStatus: 'PENDING' | 'SHORTLISTED' | 'REJECTED' | 'IN_REVIEW' }
 */
const handleUpdateShortlistStatus = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      return errorResponse(
        res,
        403,
        'Organisers have read-only access. Shortlisting decisions are exclusively owned by domain team leads.'
      );
    }

    const { shortlistStatus } = req.body;
    if (!shortlistStatus) {
      return errorResponse(res, 400, 'shortlistStatus is required in request body');
    }

    const updated = await candidateService.updateShortlistStatus(req.candidate, shortlistStatus);
    return successResponse(res, 200, 'Candidate shortlist status updated successfully', {
      candidateId: updated.candidateId,
      shortlistStatus: updated.shortlistStatus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Final Selection Status (Admin Only)
 * PATCH /api/candidates/:id/final-selection
 * Body: { finalSelectionStatus: 'PENDING' | 'SELECTED' | 'REJECTED' | 'WAITLISTED' }
 */
const handleUpdateFinalSelectionStatus = async (req, res, next) => {
  try {
    const { finalSelectionStatus } = req.body;
    if (!finalSelectionStatus) {
      return errorResponse(res, 400, 'finalSelectionStatus is required in request body');
    }

    const updated = await candidateService.updateFinalSelectionStatus(
      req.candidate,
      finalSelectionStatus
    );
    return successResponse(res, 200, 'Candidate final selection status updated successfully', {
      candidateId: updated.candidateId,
      finalSelectionStatus: updated.finalSelectionStatus
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetAllCandidates,
  handleGetAssignedCandidates,
  handleGetCandidateDetails,
  handleUpdateShortlistStatus,
  handleUpdateFinalSelectionStatus
};
