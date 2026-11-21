const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');
const Admin = require('../src/models/Admin');
const TeamLead = require('../src/models/TeamLead');
const Candidate = require('../src/models/Candidate');
const { setupDB } = require('./setup');

describe('Spreadsheet Import API (Excel & CSV)', () => {
  setupDB();

  let adminToken;
  let leadToken;
  const sampleXlsxPath = path.join(__dirname, '..', 'samples', 'sample_google_forms_responses.xlsx');
  const sampleCsvPath = path.join(__dirname, '..', 'samples', 'sample_google_forms_responses.csv');

  beforeEach(async () => {
    // 1. Create Admin
    await Admin.create({
      name: 'Import Admin',
      accessCode: 'ADMIN_IMPORT_SECRET',
      role: 'admin'
    });

    // 2. Create Lead
    await TeamLead.create({
      name: 'Regular Lead',
      accessCode: 'LEAD_SECRET_123',
      assignedDomains: ['Web Development']
    });

    // Login tokens
    const adminRes = await request(app)
      .post('/api/auth/admin-login')
      .send({ accessCode: 'ADMIN_IMPORT_SECRET' });
    adminToken = adminRes.body.data.token;

    const leadRes = await request(app)
      .post('/api/auth/lead-login')
      .send({ accessCode: 'LEAD_SECRET_123' });
    leadToken = leadRes.body.data.token;
  });

  describe('POST /api/candidates/import', () => {
    it('should reject non-admin users from importing candidates (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/candidates/import')
        .set('Authorization', `Bearer ${leadToken}`)
        .attach('file', sampleXlsxPath);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied/i);
    });

    it('should successfully parse and import candidates from Excel (.xlsx)', async () => {
      const res = await request(app)
        .post('/api/candidates/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', sampleXlsxPath);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRows).toBe(4);
      expect(res.body.data.insertedCount).toBe(4);
      expect(res.body.data.duplicateCount).toBe(0);
      expect(res.body.data.errorCount).toBe(0);

      // Verify in DB
      const candidates = await Candidate.find();
      expect(candidates.length).toBe(4);
      const webCandidate = candidates.find((c) => c.email === 'aditya.reddy@vjit.ac.in');
      expect(webCandidate).toBeDefined();
      expect(webCandidate.rollNumber).toBe('22911A0510');
      expect(webCandidate.currentDomain).toBe('Web Development');
      expect(webCandidate.originalDomain).toBe('Web Development');
      expect(webCandidate.shortlistStatus).toBe('PENDING');
      expect(webCandidate.finalSelectionStatus).toBe('PENDING');
    });

    it('should detect duplicates when re-importing candidates', async () => {
      // First import: 4 candidates inserted
      await request(app)
        .post('/api/candidates/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', sampleXlsxPath);

      // Second import with identical file
      const res = await request(app)
        .post('/api/candidates/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', sampleXlsxPath);

      expect(res.statusCode).toBe(201);
      expect(res.body.data.totalRows).toBe(4);
      expect(res.body.data.insertedCount).toBe(0);
      expect(res.body.data.duplicateCount).toBe(4);
      expect(res.body.data.duplicateDetails.length).toBe(4);
    });

    it('should successfully parse and import candidates from CSV (.csv)', async () => {
      const res = await request(app)
        .post('/api/candidates/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', sampleCsvPath);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRows).toBe(4);
      expect(res.body.data.insertedCount).toBe(4);
    });

    it('should reject request when no file is uploaded', async () => {
      const res = await request(app)
        .post('/api/candidates/import')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/upload a spreadsheet file/i);
    });
  });
});
