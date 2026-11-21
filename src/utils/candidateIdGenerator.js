const crypto = require('crypto');

/**
 * Generate a unique human-friendly candidate ID
 * Format: GDGOC-YYYY-XXXXX (e.g., GDGOC-2025-A8F2K)
 */
const generateCandidateId = () => {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 hex chars
  return `GDGOC-${year}-${randomChars}`;
};

module.exports = {
  generateCandidateId
};
