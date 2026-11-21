const TeamLead = require('../models/TeamLead');
const Candidate = require('../models/Candidate');
const { OFFICIAL_DOMAINS } = require('../constants/domains');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Get all available domains dynamically
 * GET /api/leads/domains
 */
const handleGetDomains = async (req, res, next) => {
  try {
    const candidateDomains = await Candidate.distinct('currentDomain');
    const leadDomains = await TeamLead.distinct('assignedDomains');

    const domainSet = new Set([...OFFICIAL_DOMAINS, ...candidateDomains, ...leadDomains]);
    const domains = Array.from(domainSet).filter(Boolean).sort();

    return successResponse(res, 200, 'Domains retrieved successfully', domains);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all team leads
 * GET /api/leads
 */
const handleGetAllLeads = async (req, res, next) => {
  try {
    const leads = await TeamLead.find({ isActive: true }).select('-accessCode').sort({ name: 1 });
    return successResponse(res, 200, 'Team leads retrieved successfully', leads);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a team lead (Admin only)
 * POST /api/leads
 * Body: { name, accessCode, assignedDomains }
 */
const handleCreateLead = async (req, res, next) => {
  try {
    const { name, accessCode, assignedDomains } = req.body;

    if (!name || !accessCode || !assignedDomains || !assignedDomains.length) {
      return errorResponse(
        res,
        400,
        'Name, accessCode, and at least one assignedDomain are required'
      );
    }

    const lead = await TeamLead.create({
      name: name.trim(),
      accessCode,
      assignedDomains: Array.isArray(assignedDomains) ? assignedDomains : [assignedDomains]
    });

    return successResponse(res, 201, 'Team lead created successfully', lead);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleGetDomains,
  handleGetAllLeads,
  handleCreateLead
};
