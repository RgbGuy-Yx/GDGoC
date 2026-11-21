const xlsx = require('xlsx');
const Candidate = require('../models/Candidate');
const TeamLead = require('../models/TeamLead');
const { mapRowToCandidateData } = require('../utils/columnMapper');
const { generateCandidateId } = require('../utils/candidateIdGenerator');

/**
 * Validate standard email format
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Parse and import candidates from an Excel or CSV file buffer
 */
const importCandidatesFromFile = async (fileBuffer) => {
  if (!fileBuffer || !fileBuffer.length) {
    const error = new Error('Uploaded file is empty.');
    error.statusCode = 400;
    throw error;
  }

  // Parse file buffer with xlsx
  let workbook;
  try {
    workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  } catch (err) {
    const error = new Error(`Failed to parse file: ${err.message}. Ensure valid Excel or CSV format.`);
    error.statusCode = 400;
    throw error;
  }

  const sheetNames = workbook.SheetNames;
  if (!sheetNames || sheetNames.length === 0) {
    const error = new Error('No sheets found in the uploaded workbook.');
    error.statusCode = 400;
    throw error;
  }

  const firstSheet = workbook.Sheets[sheetNames[0]];
  const rawRows = xlsx.utils.sheet_to_json(firstSheet, { defval: '' });

  if (!rawRows || rawRows.length === 0) {
    return {
      totalRows: 0,
      insertedCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      insertedCandidates: [],
      duplicateDetails: [],
      errorDetails: []
    };
  }

  // Fetch active leads to auto-assign candidates to their domain leads
  const activeLeads = await TeamLead.find({ isActive: true });

  // Fetch all existing emails and roll numbers from MongoDB to check duplicates
  const [existingEmails, existingRollNumbers] = await Promise.all([
    Candidate.distinct('email'),
    Candidate.distinct('rollNumber')
  ]);

  const existingEmailSet = new Set(existingEmails.map((e) => e.toLowerCase().trim()));
  const existingRollSet = new Set(existingRollNumbers.map((r) => r.toUpperCase().trim()));

  const fileSeenEmails = new Set();
  const fileSeenRolls = new Set();

  const candidatesToInsert = [];
  const duplicateDetails = [];
  const errorDetails = [];

  for (let i = 0; i < rawRows.length; i++) {
    const rowNumber = i + 2; // spreadsheet row index (1-indexed + 1 for header)
    const rawRow = rawRows[i];

    // Map columns dynamically
    const mapped = mapRowToCandidateData(rawRow);

    // Validate and sanitize email
    let email = (mapped.email || '').trim().toLowerCase();
    if (email.endsWith('@gmail')) email += '.com';
    if (email.endsWith('@vjit.ac')) email += '.in';
    const rollNumber = (mapped.rollNumber || '').trim().toUpperCase();
    const preferredDomain = (mapped.preferredDomain || '').trim();
    const phone = (mapped.phone || '').trim();
    const branch = (mapped.branch || '').trim();
    const yearOfStudy = (mapped.yearOfStudy || '').trim();
    const name = (mapped.name || '').trim();

    // Field validations
    if (!email || !isValidEmail(email)) {
      errorDetails.push({
        rowNumber,
        email: mapped.email || 'N/A',
        rollNumber: mapped.rollNumber || 'N/A',
        reason: 'Missing or invalid email address.'
      });
      continue;
    }

    if (!rollNumber) {
      errorDetails.push({
        rowNumber,
        email,
        rollNumber: 'N/A',
        reason: 'Missing roll number / hall ticket number.'
      });
      continue;
    }

    if (!preferredDomain) {
      errorDetails.push({
        rowNumber,
        email,
        rollNumber,
        reason: 'Missing preferred domain.'
      });
      continue;
    }

    // Duplicate detection in uploaded file
    if (fileSeenEmails.has(email)) {
      duplicateDetails.push({
        rowNumber,
        email,
        rollNumber,
        reason: `Duplicate email '${email}' found within the uploaded spreadsheet.`
      });
      continue;
    }

    if (fileSeenRolls.has(rollNumber)) {
      duplicateDetails.push({
        rowNumber,
        email,
        rollNumber,
        reason: `Duplicate roll number '${rollNumber}' found within the uploaded spreadsheet.`
      });
      continue;
    }

    // Duplicate detection in MongoDB database
    if (existingEmailSet.has(email)) {
      duplicateDetails.push({
        rowNumber,
        email,
        rollNumber,
        reason: `Candidate with email '${email}' already exists in database.`
      });
      continue;
    }

    if (existingRollSet.has(rollNumber)) {
      duplicateDetails.push({
        rowNumber,
        email,
        rollNumber,
        reason: `Candidate with roll number '${rollNumber}' already exists in database.`
      });
      continue;
    }

    // Mark as seen in this file
    fileSeenEmails.add(email);
    fileSeenRolls.add(rollNumber);

    // Auto-match assigned lead by domain
    const matchingLead = activeLeads.find((l) =>
      l.assignedDomains?.some((d) => d.toLowerCase() === preferredDomain.toLowerCase())
    );

    // Prepare candidate document
    const candidateDoc = {
      candidateId: generateCandidateId(),
      name,
      email,
      phone: phone || 'N/A',
      rollNumber,
      yearOfStudy: yearOfStudy || '1',
      branch: branch || 'General',
      section: (mapped.section || '').trim(),
      preferredDomain,
      whyJoin: (mapped.whyJoin || '').trim(),
      whyDomain: (mapped.whyDomain || '').trim(),
      priorExperience: (mapped.priorExperience || '').trim(),
      openToOtherDomain: (mapped.openToOtherDomain || 'Yes').trim(),
      contribution: (mapped.contribution || '').trim(),
      linkedinUrl: (mapped.linkedinUrl || '').trim(),
      githubUrl: (mapped.githubUrl || '').trim(),
      portfolioUrl: (mapped.portfolioUrl || '').trim(),

      // Domain tracking: originalDomain must NEVER be overwritten!
      originalDomain: preferredDomain,
      currentDomain: preferredDomain,
      assignedLead: matchingLead ? matchingLead._id : null,
      shortlistStatus: 'PENDING',
      finalSelectionStatus: 'PENDING'
    };

    candidatesToInsert.push(candidateDoc);
  }

  // Insert valid candidates in bulk
  let insertedCandidates = [];
  if (candidatesToInsert.length > 0) {
    insertedCandidates = await Candidate.insertMany(candidatesToInsert, {
      ordered: false
    });
  }

  return {
    totalRows: rawRows.length,
    insertedCount: insertedCandidates.length,
    duplicateCount: duplicateDetails.length,
    errorCount: errorDetails.length,
    insertedCandidates: insertedCandidates.map((c) => ({
      id: c._id,
      candidateId: c.candidateId,
      name: c.name,
      email: c.email,
      rollNumber: c.rollNumber,
      domain: c.currentDomain
    })),
    duplicateDetails,
    errorDetails
  };
};

module.exports = {
  importCandidatesFromFile,
  isValidEmail
};
