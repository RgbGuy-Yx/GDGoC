const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const TeamLead = require('../models/TeamLead');
const config = require('../config');

/**
 * Generate signed JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn
  });
};

/**
 * Admin Login with access code
 */
const adminLogin = async (accessCode) => {
  if (!accessCode) {
    const error = new Error('Admin access code is required');
    error.statusCode = 400;
    throw error;
  }

  const cleanCode = String(accessCode).trim();

  // Find admin record
  const admin = await Admin.findOne();
  if (!admin) {
    const error = new Error('Admin account has not been initialized. Please run seed script.');
    error.statusCode = 500;
    throw error;
  }

  const isMatch = await admin.compareAccessCode(cleanCode);
  if (!isMatch) {
    const error = new Error('Invalid admin access code');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({
    id: admin._id,
    name: admin.name,
    role: 'admin'
  });

  return {
    token,
    user: {
      id: admin._id,
      name: admin.name,
      role: 'admin'
    }
  };
};

/**
 * Team Lead Login with access code
 * Supports logging in with access code directly (finding matching lead)
 * or optionally providing lead name/id + access code.
 */
const leadLogin = async ({ accessCode, name, leadId }) => {
  if (!accessCode) {
    const error = new Error('Team lead access code is required');
    error.statusCode = 400;
    throw error;
  }

  const cleanCode = String(accessCode).trim();
  let lead = null;

  if (leadId) {
    lead = await TeamLead.findById(leadId);
    if (!lead || !lead.isActive) {
      const error = new Error('Team lead not found or inactive');
      error.statusCode = 401;
      throw error;
    }
    const isMatch = await lead.compareAccessCode(cleanCode);
    if (!isMatch) {
      const error = new Error('Invalid team lead access code');
      error.statusCode = 401;
      throw error;
    }
  } else if (name) {
    lead = await TeamLead.findOne({ name: new RegExp(`^${name}$`, 'i'), isActive: true });
    if (!lead) {
      const error = new Error(`Team lead with name '${name}' not found or inactive`);
      error.statusCode = 401;
      throw error;
    }
    const isMatch = await lead.compareAccessCode(cleanCode);
    if (!isMatch) {
      const error = new Error('Invalid team lead access code');
      error.statusCode = 401;
      throw error;
    }
  } else {
    // Search active leads to find the one matching this unique access code
    const leads = await TeamLead.find({ isActive: true });
    for (const l of leads) {
      const isMatch = await l.compareAccessCode(cleanCode);
      if (isMatch) {
        lead = l;
        break;
      }
    }

    if (!lead) {
      const error = new Error('Invalid team lead access code');
      error.statusCode = 401;
      throw error;
    }
  }

  const token = generateToken({
    id: lead._id,
    name: lead.name,
    role: 'lead',
    domains: lead.assignedDomains
  });

  return {
    token,
    user: {
      id: lead._id,
      name: lead.name,
      role: 'lead',
      assignedDomains: lead.assignedDomains
    }
  };
};

module.exports = {
  adminLogin,
  leadLogin,
  generateToken
};
