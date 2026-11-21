const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Middleware to verify that the logged-in user is authorized to access a specific candidate.
 * - Admin has full access to all candidates.
 * - Team leads can ONLY access candidates if:
 *     1) The candidate's currentDomain is in the lead's assignedDomains, OR
 *     2) The candidate's assignedLead is explicitly set to the lead's user ID.
 */
const authorizeCandidateAccess = async (req, res, next) => {
  try {
    const candidateIdentifier = req.params.id;

    if (!candidateIdentifier) {
      return errorResponse(res, 400, 'Candidate ID parameter is required.');
    }

    // Support both MongoDB ObjectId and unique candidateId (e.g. GDGOC-2025-XXXXX)
    let query;
    if (mongoose.Types.ObjectId.isValid(candidateIdentifier)) {
      query = { _id: candidateIdentifier };
    } else {
      query = { candidateId: candidateIdentifier.toUpperCase() };
    }

    const candidate = await Candidate.findOne(query);

    if (!candidate) {
      return errorResponse(res, 404, 'Candidate not found.');
    }

    // Admin has full access
    if (req.user.role === 'admin') {
      req.candidate = candidate;
      return next();
    }

    // Team lead checks
    if (req.user.role === 'lead') {
      const leadDomains = req.user.domains || [];
      const isDomainAuthorized = leadDomains.some(
        (domain) => domain.toLowerCase() === candidate.currentDomain.toLowerCase()
      );

      const isDirectlyAssigned =
        candidate.assignedLead &&
        candidate.assignedLead.toString() === req.user.id.toString();

      // Current active owner of candidate has full access
      if (isDomainAuthorized || isDirectlyAssigned) {
        req.candidate = candidate;
        return next();
      }

      // If this is a read-only request (GET), check if the lead was the original applicant domain lead
      // or previously transferred/evaluated this candidate
      if (req.method === 'GET') {
        const isOriginalDomainLead = leadDomains.some(
          (domain) => candidate.originalDomain && domain.toLowerCase() === candidate.originalDomain.toLowerCase()
        );

        if (isOriginalDomainLead) {
          req.candidate = candidate;
          req.isReadOnlyLead = true;
          return next();
        }

        // Check if lead previously transferred this candidate
        const TransferLog = require('../models/TransferLog');
        const wasTransferredByThisLead = await TransferLog.exists({
          candidate: candidate._id,
          'transferredBy.id': req.user.id
        });

        if (wasTransferredByThisLead) {
          req.candidate = candidate;
          req.isReadOnlyLead = true;
          return next();
        }
      }

      return errorResponse(
        res,
        403,
        `Access forbidden: You are not authorized to view or manage candidates in the '${candidate.currentDomain}' domain.`
      );
    }

    return errorResponse(res, 403, 'Access denied.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorizeCandidateAccess
};
