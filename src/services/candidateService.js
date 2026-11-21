const Candidate = require('../models/Candidate');
const Evaluation = require('../models/Evaluation');
const TransferLog = require('../models/TransferLog');
const TeamLead = require('../models/TeamLead');

/**
 * Helper to escape special regex characters in search strings and domain names
 */
const escapeRegex = (str = '') => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Get all candidates (Admin view)
 * Supports pagination, domain filter, shortlist status filter, final selection filter, and search
 */
const getAllCandidates = async (filters = {}) => {
  const {
    page = 1,
    limit = 20,
    domain,
    yearOfStudy,
    year,
    sortBy,
    shortlistStatus,
    finalSelectionStatus,
    search
  } = filters;

  const query = {};

  if (domain) {
    query.currentDomain = new RegExp(`^${escapeRegex(domain.trim())}$`, 'i');
  }

  const selectedYear = yearOfStudy || year;
  if (selectedYear && selectedYear.toUpperCase() !== 'ALL') {
    const yr = selectedYear.trim();
    if (/^1/i.test(yr)) {
      query.yearOfStudy = new RegExp('^1', 'i');
    } else if (/^2/i.test(yr)) {
      query.yearOfStudy = new RegExp('^2', 'i');
    } else if (/^3/i.test(yr)) {
      query.yearOfStudy = new RegExp('^3', 'i');
    } else if (/^4/i.test(yr)) {
      query.yearOfStudy = new RegExp('^4', 'i');
    } else {
      query.yearOfStudy = new RegExp(`^${escapeRegex(yr)}$`, 'i');
    }
  }

  if (shortlistStatus) {
    query.shortlistStatus = shortlistStatus.toUpperCase();
  }

  if (finalSelectionStatus) {
    query.finalSelectionStatus = finalSelectionStatus.toUpperCase();
  }

  if (search && search.trim()) {
    const s = escapeRegex(search.trim());
    query.$or = [
      { candidateId: new RegExp(s, 'i') },
      { email: new RegExp(s, 'i') },
      { rollNumber: new RegExp(s, 'i') },
      { branch: new RegExp(s, 'i') }
    ];
  }

  let sortOption = { createdAt: -1 };
  if (sortBy === 'year' || sortBy === 'year_asc') {
    sortOption = { yearOfStudy: 1, createdAt: -1 };
  } else if (sortBy === 'year_desc') {
    sortOption = { yearOfStudy: -1, createdAt: -1 };
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(1000, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [candidates, total] = await Promise.all([
    Candidate.find(query)
      .populate('assignedLead', 'name assignedDomains')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Candidate.countDocuments(query)
  ]);

  return {
    candidates,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  };
};

/**
 * Get candidates assigned to a team lead
 * Filtered by lead's authorized domains or explicit assignment
 */
const getAssignedCandidates = async (leadUser, filters = {}) => {
  const {
    page = 1,
    limit = 20,
    domain,
    yearOfStudy,
    year,
    sortBy,
    shortlistStatus,
    search
  } = filters;

  const leadDomains = leadUser.domains || [];

  // Lead can access candidate if currentDomain matches one of lead's domains OR assignedLead is lead
  const baseOrCondition = [
    { currentDomain: { $in: leadDomains.map((d) => new RegExp(`^${escapeRegex(d)}$`, 'i')) } },
    { assignedLead: leadUser.id }
  ];

  const query = {
    $or: baseOrCondition
  };

  // If lead specifies a domain, ensure it is within their authorized domains
  if (domain) {
    const requestedDomain = domain.trim();
    const isAuthorizedForRequestedDomain = leadDomains.some(
      (d) => d.toLowerCase() === requestedDomain.toLowerCase()
    );

    if (isAuthorizedForRequestedDomain) {
      query.currentDomain = new RegExp(`^${escapeRegex(requestedDomain)}$`, 'i');
      delete query.$or;
    } else {
      // If requested domain is not in lead's domains, only candidates directly assigned to lead in that domain match
      query.currentDomain = new RegExp(`^${escapeRegex(requestedDomain)}$`, 'i');
      query.assignedLead = leadUser.id;
      delete query.$or;
    }
  }

  const selectedYear = yearOfStudy || year;
  if (selectedYear && selectedYear.toUpperCase() !== 'ALL') {
    const yr = selectedYear.trim();
    if (/^1/i.test(yr)) {
      query.yearOfStudy = new RegExp('^1', 'i');
    } else if (/^2/i.test(yr)) {
      query.yearOfStudy = new RegExp('^2', 'i');
    } else if (/^3/i.test(yr)) {
      query.yearOfStudy = new RegExp('^3', 'i');
    } else if (/^4/i.test(yr)) {
      query.yearOfStudy = new RegExp('^4', 'i');
    } else {
      query.yearOfStudy = new RegExp(`^${escapeRegex(yr)}$`, 'i');
    }
  }

  if (shortlistStatus) {
    query.shortlistStatus = shortlistStatus.toUpperCase();
  }

  if (search && search.trim()) {
    const s = escapeRegex(search.trim());
    const searchCondition = [
      { candidateId: new RegExp(s, 'i') },
      { email: new RegExp(s, 'i') },
      { rollNumber: new RegExp(s, 'i') },
      { branch: new RegExp(s, 'i') }
    ];

    if (query.$or) {
      query.$and = [{ $or: query.$or }, { $or: searchCondition }];
      delete query.$or;
    } else {
      query.$or = searchCondition;
    }
  }

  let sortOption = { createdAt: -1 };
  if (sortBy === 'year' || sortBy === 'year_asc') {
    sortOption = { yearOfStudy: 1, createdAt: -1 };
  } else if (sortBy === 'year_desc') {
    sortOption = { yearOfStudy: -1, createdAt: -1 };
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(1000, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [candidates, total] = await Promise.all([
    Candidate.find(query)
      .populate('assignedLead', 'name assignedDomains')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Candidate.countDocuments(query)
  ]);

  return {
    candidates,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  };
};

/**
 * Get full candidate details with evaluations, transfer history, and prev/next candidate navigation
 */
const getCandidateDetails = async (candidate, user = null, queryParams = {}) => {
  const [evaluations, transfers, populatedCandidate] = await Promise.all([
    Evaluation.find({ candidate: candidate._id })
      .populate('lead', 'name assignedDomains')
      .sort({ timestamp: -1 }),
    TransferLog.find({ candidate: candidate._id })
      .populate('previousLead destinationLead', 'name assignedDomains')
      .sort({ timestamp: -1 }),
    Candidate.findById(candidate._id).populate('assignedLead', 'name assignedDomains')
  ]);

  const candidateObj = populatedCandidate.toObject();
  candidateObj.evaluations = evaluations;
  candidateObj.transferHistory = transfers;

  // Calculate Fast Prev / Next Navigation within the relevant candidate pipeline
  try {
    let domainFilter = {};
    if (user && user.role === 'lead') {
      const leadDomains = user.domains || [];
      domainFilter = {
        $or: [
          { currentDomain: { $in: leadDomains.map((d) => new RegExp(`^${escapeRegex(d)}$`, 'i')) } },
          { assignedLead: user.id }
        ]
      };
    } else {
      domainFilter = { currentDomain: candidate.currentDomain };
    }

    if (queryParams && queryParams.yearOfStudy) {
      domainFilter.yearOfStudy = queryParams.yearOfStudy;
    }

    // Sort by interview priority (1st Year first, then roll number)
    const siblings = await Candidate.find(domainFilter, '_id name rollNumber candidateId yearOfStudy')
      .sort({ yearOfStudy: 1, rollNumber: 1 });

    const currentIndex = siblings.findIndex((s) => s._id.toString() === candidate._id.toString());

    if (currentIndex !== -1) {
      const prevCandidate = currentIndex > 0 ? siblings[currentIndex - 1] : null;
      const nextCandidate = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

      candidateObj.navigation = {
        currentIndex: currentIndex + 1,
        totalCandidates: siblings.length,
        prev: prevCandidate
          ? { id: prevCandidate._id, name: prevCandidate.name, rollNumber: prevCandidate.rollNumber }
          : null,
        next: nextCandidate
          ? { id: nextCandidate._id, name: nextCandidate.name, rollNumber: nextCandidate.rollNumber }
          : null
      };
    }
  } catch (navErr) {
    console.warn('[CandidateService] Failed to calculate candidate navigation:', navErr.message);
  }

  return candidateObj;
};

/**
 * Update Shortlist Status
 * Valid values: PENDING, SHORTLISTED, REJECTED, IN_REVIEW
 */
const updateShortlistStatus = async (candidate, status) => {
  const allowedStatuses = ['PENDING', 'SHORTLISTED', 'REJECTED', 'IN_REVIEW'];
  const normalizedStatus = (status || '').toUpperCase();

  if (!allowedStatuses.includes(normalizedStatus)) {
    const error = new Error(
      `Invalid shortlist status '${status}'. Allowed values: ${allowedStatuses.join(', ')}`
    );
    error.statusCode = 400;
    throw error;
  }

  const candidateId = candidate._id || candidate;
  const updated = await Candidate.findByIdAndUpdate(
    candidateId,
    { $set: { shortlistStatus: normalizedStatus } },
    { new: true, runValidators: true }
  );

  if (!updated) {
    const error = new Error('Candidate not found.');
    error.statusCode = 404;
    throw error;
  }

  return updated;
};

/**
 * Update Final Selection Status (Admin Only)
 * Valid values: PENDING, SELECTED, REJECTED, WAITLISTED
 */
const updateFinalSelectionStatus = async (candidate, status) => {
  const allowedStatuses = ['PENDING', 'SELECTED', 'REJECTED', 'WAITLISTED'];
  const normalizedStatus = (status || '').toUpperCase();

  if (!allowedStatuses.includes(normalizedStatus)) {
    const error = new Error(
      `Invalid final selection status '${status}'. Allowed values: ${allowedStatuses.join(', ')}`
    );
    error.statusCode = 400;
    throw error;
  }

  const candidateId = candidate._id || candidate;
  const updated = await Candidate.findByIdAndUpdate(
    candidateId,
    { $set: { finalSelectionStatus: normalizedStatus } },
    { new: true, runValidators: true }
  );

  if (!updated) {
    const error = new Error('Candidate not found.');
    error.statusCode = 404;
    throw error;
  }

  return updated;
};

/**
 * Add Interview Evaluation
 * - Score out of 10
 * - Remarks
 * - Timestamp
 * - Never overwrites previous evaluations
 */
const addEvaluation = async (candidate, user, evaluationData) => {
  const { score, remarks } = evaluationData;

  const numScore = Number(score);
  if (isNaN(numScore) || numScore < 0 || numScore > 10) {
    const error = new Error('Score must be a valid number between 0 and 10.');
    error.statusCode = 400;
    throw error;
  }

  if (!remarks || typeof remarks !== 'string' || !remarks.trim()) {
    const error = new Error('Evaluation remarks are required.');
    error.statusCode = 400;
    throw error;
  }

  const evaluation = await Evaluation.create({
    candidate: candidate._id,
    lead: user.id,
    leadName: user.name,
    evaluatorRole: user.role,
    score: numScore,
    remarks: remarks.trim(),
    timestamp: new Date()
  });

  return evaluation;
};

/**
 * Get Candidate Evaluation History
 */
const getCandidateEvaluations = async (candidateId) => {
  return Evaluation.find({ candidate: candidateId })
    .populate('lead', 'name assignedDomains')
    .sort({ timestamp: -1 });
};

/**
 * Transfer Candidate
 * - Destination domain
 * - Destination lead (optional)
 * - Transfer reason (required)
 * - Additional remarks
 * - Preserves originalDomain (never modified)
 * - Does NOT automatically shortlist candidate
 * - Preserves complete transfer log
 */
const transferCandidate = async (candidate, user, transferData) => {
  const {
    destinationDomain,
    destinationLeadId,
    transferReason,
    remarks = ''
  } = transferData;

  if (!destinationDomain || !destinationDomain.trim()) {
    const error = new Error('Destination domain is required.');
    error.statusCode = 400;
    throw error;
  }

  if (!transferReason || !transferReason.trim()) {
    const error = new Error('Transfer reason is required.');
    error.statusCode = 400;
    throw error;
  }

  // Validate destination lead if provided
  let destinationLead = null;
  if (destinationLeadId) {
    destinationLead = await TeamLead.findById(destinationLeadId);
    if (!destinationLead) {
      const error = new Error(`Destination team lead '${destinationLeadId}' not found.`);
      error.statusCode = 400;
      throw error;
    }
  }

  const previousDomain = candidate.currentDomain;
  const previousLead = candidate.assignedLead;

  // Create immutable transfer log entry
  const transferLog = await TransferLog.create({
    candidate: candidate._id,
    previousDomain,
    previousLead,
    destinationDomain: destinationDomain.trim(),
    destinationLead: destinationLead ? destinationLead._id : null,
    transferReason: transferReason.trim(),
    remarks: remarks.trim(),
    transferredBy: {
      id: user.id,
      name: user.name,
      role: user.role
    },
    timestamp: new Date()
  });

  // Update candidate current assigned domain and lead
  // CRITICAL RULE: originalDomain is NEVER touched!
  // CRITICAL RULE: shortlistStatus is NOT automatically altered!
  candidate.currentDomain = destinationDomain.trim();
  candidate.assignedLead = destinationLead ? destinationLead._id : null;
  await candidate.save();

  return {
    candidate,
    transferLog
  };
};

/**
 * Get Candidate Transfer History
 */
const getCandidateTransfers = async (candidateId) => {
  return TransferLog.find({ candidate: candidateId })
    .populate('previousLead destinationLead', 'name assignedDomains')
    .sort({ timestamp: -1 });
};

/**
 * Get all evaluations across all candidates (Admin view)
 */
const getAllEvaluationsAdmin = async () => {
  return Evaluation.find()
    .populate('candidate', 'candidateId rollNumber email preferredDomain currentDomain')
    .populate('lead', 'name assignedDomains')
    .sort({ timestamp: -1 });
};

/**
 * Get all transfers across all candidates (Admin view)
 */
const getAllTransfersAdmin = async () => {
  return TransferLog.find()
    .populate('candidate', 'candidateId rollNumber email preferredDomain currentDomain')
    .populate('previousLead destinationLead', 'name assignedDomains')
    .sort({ timestamp: -1 });
};

module.exports = {
  getAllCandidates,
  getAssignedCandidates,
  getCandidateDetails,
  updateShortlistStatus,
  updateFinalSelectionStatus,
  addEvaluation,
  getCandidateEvaluations,
  getAllEvaluationsAdmin,
  transferCandidate,
  getCandidateTransfers,
  getAllTransfersAdmin
};
