const importService = require('../services/importService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Import Candidates from Excel (.xlsx) or CSV (.csv) file
 * POST /api/candidates/import
 * Multipart form-data with file field 'file'
 * (Admin only)
 */
const handleImportSpreadsheet = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Please upload a spreadsheet file (.xlsx, .xls, or .csv) under key "file"');
    }

    const stats = await importService.importCandidatesFromFile(req.file.buffer);

    return successResponse(res, 201, 'Spreadsheet processed successfully', stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleImportSpreadsheet
};
