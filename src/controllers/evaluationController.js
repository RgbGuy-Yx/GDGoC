const candidateService = require('../services/candidateService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Add Interview Evaluation
 * POST /api/candidates/:id/evaluations
 * Body: { score: Number, remarks: String }
 */
const handleAddEvaluation = async (req, res, next) => {
  try {
    const { score, remarks } = req.body;

    if (score === undefined || score === null) {
      return errorResponse(res, 400, 'Evaluation score (0-10) is required');
    }

    if (!remarks) {
      return errorResponse(res, 400, 'Evaluation remarks are required');
    }

    const evaluation = await candidateService.addEvaluation(req.candidate, req.user, {
      score,
      remarks
    });

    return successResponse(res, 201, 'Evaluation added successfully', evaluation);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Candidate Evaluation History
 * GET /api/candidates/:id/evaluations
 */
const handleGetEvaluations = async (req, res, next) => {
  try {
    const evaluations = await candidateService.getCandidateEvaluations(req.candidate._id);
    return successResponse(res, 200, 'Candidate evaluations retrieved successfully', evaluations);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all evaluations across all candidates (Admin only)
 * GET /api/candidates/admin/all-evaluations
 */
const handleGetAllEvaluationsAdmin = async (req, res, next) => {
  try {
    const evaluations = await candidateService.getAllEvaluationsAdmin();
    return successResponse(res, 200, 'All evaluations retrieved successfully', evaluations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleAddEvaluation,
  handleGetEvaluations,
  handleGetAllEvaluationsAdmin
};
