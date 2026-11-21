const request = require('supertest');
const path = require('path');
const app = require('../src/app');
const Admin = require('../src/models/Admin');
const TeamLead = require('../src/models/TeamLead');
const Candidate = require('../src/models/Candidate');
const Evaluation = require('../src/models/Evaluation');
const TransferLog = require('../src/models/TransferLog');
const { setupDB } = require('./setup');

describe('PHASE 3: End-to-End Recruitment Workflows, Data Integrity & Security', () => {
  setupDB();

  const ADMIN_CODE = 'GDGOC_ADMIN_2025';
  const WEB_LEAD_CODE = 'LEAD_WEB_2025';
  const AIML_LEAD_CODE = 'LEAD_AIML_2025';
  const DESIGN_LEAD_CODE = 'LEAD_DESIGN_2025';

  const sampleXlsxPath = path.join(__dirname, '..', 'samples', 'sample_google_forms_responses.xlsx');

  let adminToken;
  let webLeadToken;
  let aimlLeadToken;
  let designLeadToken;

  let webLeadId;
  let aimlLeadId;
  let designLeadId;

  beforeEach(async () => {
    // 1. Seed Admin
    await Admin.create({
      name: 'GDGoC VJIT Lead Admin',
      accessCode: ADMIN_CODE,
      role: 'admin'
    });

    // 2. Seed Team Leads
    const webLead = await TeamLead.create({
      name: 'Aarav - Web Lead',
      accessCode: WEB_LEAD_CODE,
      assignedDomains: ['Web Development']
    });
    webLeadId = webLead._id;

    const aimlLead = await TeamLead.create({
      name: 'Bhavya - AI/ML Lead',
      accessCode: AIML_LEAD_CODE,
      assignedDomains: ['AI/ML']
    });
    aimlLeadId = aimlLead._id;

    const designLead = await TeamLead.create({
      name: 'Eshwar - Design Lead',
      accessCode: DESIGN_LEAD_CODE,
      assignedDomains: ['Design & Media']
    });
    designLeadId = designLead._id;

    // 3. Obtain JWT tokens
    const adminLoginRes = await request(app)
      .post('/api/auth/admin-login')
      .send({ accessCode: ADMIN_CODE });
    adminToken = adminLoginRes.body.data.token;

    const webLoginRes = await request(app)
      .post('/api/auth/lead-login')
      .send({ accessCode: WEB_LEAD_CODE });
    webLeadToken = webLoginRes.body.data.token;

    const aimlLoginRes = await request(app)
      .post('/api/auth/lead-login')
      .send({ accessCode: AIML_LEAD_CODE });
    aimlLeadToken = aimlLoginRes.body.data.token;

    const designLoginRes = await request(app)
      .post('/api/auth/lead-login')
      .send({ accessCode: DESIGN_LEAD_CODE });
    designLeadToken = designLoginRes.body.data.token;
  });

  describe('1. Complete End-to-End Admin Workflow', () => {
    it('should complete the entire 8-step Admin recruitment workflow', async () => {
      // Step 1: Admin logs in (verified in beforeEach)
      expect(adminToken).toBeDefined();

      // Step 2: Admin imports candidate spreadsheet
      const importRes = await request(app)
        .post('/api/candidates/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', sampleXlsxPath);

      expect(importRes.statusCode).toBe(201);
      expect(importRes.body.data.insertedCount).toBe(4);
      expect(importRes.body.data.totalRows).toBe(4);

      // Step 3: Admin views all candidates
      const allRes = await request(app)
        .get('/api/candidates')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(allRes.statusCode).toBe(200);
      expect(allRes.body.data.length).toBe(4);

      // Step 4: Admin filters candidates by domain
      const filterRes = await request(app)
        .get('/api/candidates?domain=Web Development')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(filterRes.statusCode).toBe(200);
      expect(filterRes.body.data.length).toBe(1);
      expect(filterRes.body.data[0].currentDomain).toBe('Web Development');
      const webCandidate = filterRes.body.data[0];

      // Step 5: Admin views individual candidate profile
      const profileRes = await request(app)
        .get(`/api/candidates/${webCandidate._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(profileRes.statusCode).toBe(200);
      expect(profileRes.body.data.rollNumber).toBe('22911A0510');
      expect(profileRes.body.data.email).toBe('aditya.reddy@vjit.ac.in');
      expect(profileRes.body.data.originalDomain).toBe('Web Development');
      expect(profileRes.body.data.currentDomain).toBe('Web Development');

      // Step 6: Admin views evaluations across leads
      const evalsRes = await request(app)
        .get('/api/candidates/admin/all-evaluations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(evalsRes.statusCode).toBe(200);
      expect(Array.isArray(evalsRes.body.data)).toBe(true);

      // Step 7: Admin checks transfer histories
      const transfersRes = await request(app)
        .get('/api/candidates/admin/all-transfers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(transfersRes.statusCode).toBe(200);
      expect(Array.isArray(transfersRes.body.data)).toBe(true);

      // Step 8: Admin updates final selection status
      const finalRes = await request(app)
        .patch(`/api/candidates/${webCandidate._id}/final-selection`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ finalSelectionStatus: 'SELECTED' });

      expect(finalRes.statusCode).toBe(200);
      expect(finalRes.body.data.finalSelectionStatus).toBe('SELECTED');

      const verified = await Candidate.findById(webCandidate._id);
      expect(verified.finalSelectionStatus).toBe('SELECTED');
    });
  });

  describe('2. Complete End-to-End Team Lead Workflow & Cross-Lead Handover', () => {
    it('should complete the entire 9-step Team Lead evaluation and cross-domain transfer lifecycle', async () => {
      // First, import candidates via Admin
      await request(app)
        .post('/api/candidates/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', sampleXlsxPath);

      // Step 1: Web Lead logs in (verified in beforeEach)
      expect(webLeadToken).toBeDefined();

      // Step 2: Web Lead sees only authorized candidates (Web Development domain)
      const leadCandidatesRes = await request(app)
        .get('/api/candidates/assigned')
        .set('Authorization', `Bearer ${webLeadToken}`);

      expect(leadCandidatesRes.statusCode).toBe(200);
      expect(leadCandidatesRes.body.data.length).toBe(1);
      const targetCandidate = leadCandidatesRes.body.data[0];
      expect(targetCandidate.currentDomain).toBe('Web Development');
      expect(targetCandidate.email).toBe('aditya.reddy@vjit.ac.in');

      // Step 3: Lead opens candidate profile
      const profileRes = await request(app)
        .get(`/api/candidates/${targetCandidate._id}`)
        .set('Authorization', `Bearer ${webLeadToken}`);

      expect(profileRes.statusCode).toBe(200);
      expect(profileRes.body.data.candidateId).toBe(targetCandidate.candidateId);

      // Step 4: Lead shortlists the candidate
      const shortlistRes = await request(app)
        .patch(`/api/candidates/${targetCandidate._id}/shortlist`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({ shortlistStatus: 'SHORTLISTED' });

      expect(shortlistRes.statusCode).toBe(200);
      expect(shortlistRes.body.data.shortlistStatus).toBe('SHORTLISTED');

      // Step 5: Lead submits interview score (8.5/10) with remarks
      const evalRes = await request(app)
        .post(`/api/candidates/${targetCandidate._id}/evaluations`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({
          score: 8.5,
          remarks: 'Strong frontend engineering and React skills, but expressed enthusiasm for deep learning models.'
        });

      expect(evalRes.statusCode).toBe(201);
      expect(evalRes.body.data.score).toBe(8.5);
      expect(evalRes.body.data.leadName).toBe('Aarav - Web Lead');

      // Step 6: Lead transfers candidate to AI/ML domain
      const transferRes = await request(app)
        .post(`/api/candidates/${targetCandidate._id}/transfer`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({
          destinationDomain: 'AI/ML',
          destinationLeadId: aimlLeadId,
          transferReason: 'Candidate demonstrated advanced PyTorch knowledge and wants to join the AI track.',
          remarks: 'Recommending second technical round with Bhavya.'
        });

      expect(transferRes.statusCode).toBe(200);
      expect(transferRes.body.data.candidate.currentDomain).toBe('AI/ML');
      // CRITICAL RULE: originalDomain must NOT change!
      expect(transferRes.body.data.candidate.originalDomain).toBe('Web Development');
      // CRITICAL RULE: transfer does not automatically change shortlist status
      expect(transferRes.body.data.candidate.shortlistStatus).toBe('SHORTLISTED');

      // Step 7: Receiving Lead (AI/ML Lead) logs in (verified in beforeEach)
      expect(aimlLeadToken).toBeDefined();

      // Step 8: Receiving Lead sees the transferred candidate under their assigned domain
      const aimlAssignedRes = await request(app)
        .get('/api/candidates/assigned')
        .set('Authorization', `Bearer ${aimlLeadToken}`);

      expect(aimlAssignedRes.statusCode).toBe(200);
      const foundInAiml = aimlAssignedRes.body.data.find((c) => c._id === targetCandidate._id);
      expect(foundInAiml).toBeDefined();
      expect(foundInAiml.currentDomain).toBe('AI/ML');
      expect(foundInAiml.originalDomain).toBe('Web Development');

      // Step 8b: Receiving Lead sees complete previous evaluation history & transfer history
      const receivingProfileRes = await request(app)
        .get(`/api/candidates/${targetCandidate._id}`)
        .set('Authorization', `Bearer ${aimlLeadToken}`);

      expect(receivingProfileRes.statusCode).toBe(200);
      expect(receivingProfileRes.body.data.evaluations.length).toBe(1);
      expect(receivingProfileRes.body.data.evaluations[0].score).toBe(8.5);
      expect(receivingProfileRes.body.data.evaluations[0].leadName).toBe('Aarav - Web Lead');
      expect(receivingProfileRes.body.data.transferHistory.length).toBe(1);
      expect(receivingProfileRes.body.data.transferHistory[0].transferReason).toMatch(/PyTorch/);

      // Step 9: Receiving Lead adds their own interview evaluation & decision
      const aimlEvalRes = await request(app)
        .post(`/api/candidates/${targetCandidate._id}/evaluations`)
        .set('Authorization', `Bearer ${aimlLeadToken}`)
        .send({
          score: 9.5,
          remarks: 'Confirmed strong mathematical foundation and deep learning experience. Highly recommended.'
        });

      expect(aimlEvalRes.statusCode).toBe(201);
      expect(aimlEvalRes.body.data.score).toBe(9.5);
      expect(aimlEvalRes.body.data.leadName).toBe('Bhavya - AI/ML Lead');

      // Verify both evaluations are preserved without overwriting!
      const finalEvalsRes = await request(app)
        .get(`/api/candidates/${targetCandidate._id}/evaluations`)
        .set('Authorization', `Bearer ${aimlLeadToken}`);

      expect(finalEvalsRes.statusCode).toBe(200);
      expect(finalEvalsRes.body.data.length).toBe(2);
      expect(finalEvalsRes.body.data.some((e) => e.score === 8.5)).toBe(true);
      expect(finalEvalsRes.body.data.some((e) => e.score === 9.5)).toBe(true);
    });
  });

  describe('3. Data Integrity & Immutability Verification', () => {
    it('should strictly preserve originalDomain, evaluations, and duplicate prevention', async () => {
      // Import spreadsheet
      await request(app)
        .post('/api/candidates/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', sampleXlsxPath);

      // Duplicate import verification
      const dupRes = await request(app)
        .post('/api/candidates/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', sampleXlsxPath);

      expect(dupRes.statusCode).toBe(201);
      expect(dupRes.body.data.insertedCount).toBe(0);
      expect(dupRes.body.data.duplicateCount).toBe(4);

      // Verify originalDomain immutability directly in Mongoose
      const candidate = await Candidate.findOne({ rollNumber: '22911A0510' });
      expect(candidate.originalDomain).toBe('Web Development');

      // Attempt direct update to originalDomain via findOneAndUpdate
      await Candidate.findByIdAndUpdate(candidate._id, { originalDomain: 'HACKED_DOMAIN' });
      const reFetched = await Candidate.findById(candidate._id);
      expect(reFetched.originalDomain).toBe('Web Development'); // Unchanged!
    });
  });

  describe('4. Security & Role Boundary Testing', () => {
    it('should reject invalid access codes', async () => {
      const res = await request(app)
        .post('/api/auth/lead-login')
        .send({ accessCode: 'INVALID_CODE_XYZ' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should block unrelated leads from accessing unauthorized candidate data (403 Forbidden)', async () => {
      // Import candidates
      await request(app)
        .post('/api/candidates/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', sampleXlsxPath);

      // Candidate 22911A0510 is in Web Development
      const candidate = await Candidate.findOne({ rollNumber: '22911A0510' });

      // Design Lead attempts to access Web Development candidate
      const res = await request(app)
        .get(`/api/candidates/${candidate._id}`)
        .set('Authorization', `Bearer ${designLeadToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not authorized to view or manage candidates in the 'Web Development' domain/i);
    });

    it('should prevent team leads from accessing Admin-only endpoints', async () => {
      const res = await request(app)
        .get('/api/candidates')
        .set('Authorization', `Bearer ${webLeadToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Access denied/i);
    });

    it('should prevent team leads from changing final selection status', async () => {
      const candidate = await Candidate.create({
        candidateId: 'GDGOC-2025-SEC01',
        email: 'security.test@vjit.ac.in',
        phone: '9988776655',
        rollNumber: '22911A0588',
        yearOfStudy: '3',
        branch: 'CSE',
        preferredDomain: 'Web Development',
        originalDomain: 'Web Development',
        currentDomain: 'Web Development'
      });

      const res = await request(app)
        .patch(`/api/candidates/${candidate._id}/final-selection`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({ finalSelectionStatus: 'SELECTED' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Access denied/i);
    });

    it('should reject requests with invalid or missing tokens', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);

      const malformedRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not-a-valid-token');
      expect(malformedRes.statusCode).toBe(401);
    });
  });
});
