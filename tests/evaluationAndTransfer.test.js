const request = require('supertest');
const app = require('../src/app');
const Admin = require('../src/models/Admin');
const TeamLead = require('../src/models/TeamLead');
const Candidate = require('../src/models/Candidate');
const Evaluation = require('../src/models/Evaluation');
const TransferLog = require('../src/models/TransferLog');
const { setupDB } = require('./setup');

describe('Interview Evaluations and Transfer Management', () => {
  setupDB();

  let adminToken;
  let webLeadToken;
  let aimlLeadToken;
  let webLeadId;
  let aimlLeadId;
  let candidate;

  beforeEach(async () => {
    // Create Admin
    await Admin.create({
      name: 'GDGoC Admin',
      accessCode: 'ADMIN_CODE_SEED',
      role: 'admin'
    });

    // Create Leads
    const webLead = await TeamLead.create({
      name: 'Web Lead',
      accessCode: 'WEB_CODE_SEED',
      assignedDomains: ['Web Development']
    });
    webLeadId = webLead._id;

    const aimlLead = await TeamLead.create({
      name: 'AI/ML Lead',
      accessCode: 'AIML_CODE_SEED',
      assignedDomains: ['AI/ML']
    });
    aimlLeadId = aimlLead._id;

    // Login tokens
    const adminRes = await request(app)
      .post('/api/auth/admin-login')
      .send({ accessCode: 'ADMIN_CODE_SEED' });
    adminToken = adminRes.body.data.token;

    const webRes = await request(app)
      .post('/api/auth/lead-login')
      .send({ accessCode: 'WEB_CODE_SEED' });
    webLeadToken = webRes.body.data.token;

    const aimlRes = await request(app)
      .post('/api/auth/lead-login')
      .send({ accessCode: 'AIML_CODE_SEED' });
    aimlLeadToken = aimlRes.body.data.token;

    // Candidate initially in Web Development
    candidate = await Candidate.create({
      candidateId: 'GDGOC-2025-EVAL01',
      email: 'candidate.eval@vjit.ac.in',
      phone: '9876543210',
      rollNumber: '22911A0505',
      yearOfStudy: '3',
      branch: 'CSE',
      preferredDomain: 'Web Development',
      originalDomain: 'Web Development',
      currentDomain: 'Web Development',
      assignedLead: webLeadId,
      shortlistStatus: 'PENDING'
    });
  });

  describe('Interview Evaluations', () => {
    it('should allow authorized lead to add an interview evaluation', async () => {
      const res = await request(app)
        .post(`/api/candidates/${candidate._id}/evaluations`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({
          score: 8.5,
          remarks: 'Excellent React and system design fundamentals.'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBe(8.5);
      expect(res.body.data.leadName).toBe('Web Lead');
      expect(res.body.data.remarks).toMatch(/Excellent React/);
    });

    it('should reject evaluation with score outside 0-10 range', async () => {
      const res = await request(app)
        .post(`/api/candidates/${candidate._id}/evaluations`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({
          score: 11,
          remarks: 'Score too high'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/between 0 and 10/i);
    });

    it('should preserve multiple evaluations without overwriting previous ones', async () => {
      // First evaluation by Web Lead
      await request(app)
        .post(`/api/candidates/${candidate._id}/evaluations`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({
          score: 7,
          remarks: 'Good basics in JavaScript'
        });

      // Second evaluation by Admin
      await request(app)
        .post(`/api/candidates/${candidate._id}/evaluations`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          score: 9,
          remarks: 'Strong cultural fit and leadership potential'
        });

      // Retrieve evaluation history
      const res = await request(app)
        .get(`/api/candidates/${candidate._id}/evaluations`)
        .set('Authorization', `Bearer ${webLeadToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.some((e) => e.score === 7)).toBe(true);
      expect(res.body.data.some((e) => e.score === 9)).toBe(true);
    });
  });

  describe('Candidate Transfer Flow & Business Rules', () => {
    it('should transfer candidate to AI/ML domain, preserve originalDomain, and maintain shortlist status', async () => {
      // Transfer candidate from Web Development to AI/ML
      const transferRes = await request(app)
        .post(`/api/candidates/${candidate._id}/transfer`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({
          destinationDomain: 'AI/ML',
          destinationLeadId: aimlLeadId,
          transferReason: 'Candidate demonstrated strong mathematical foundation and deep learning interest.',
          remarks: 'Recommended for AI/ML interview round.'
        });

      expect(transferRes.statusCode).toBe(200);
      expect(transferRes.body.success).toBe(true);
      expect(transferRes.body.data.candidate.currentDomain).toBe('AI/ML');
      expect(transferRes.body.data.transferLog.previousDomain).toBe('Web Development');
      expect(transferRes.body.data.transferLog.destinationDomain).toBe('AI/ML');

      // Verify in DB
      const updatedCandidate = await Candidate.findById(candidate._id);
      expect(updatedCandidate.currentDomain).toBe('AI/ML');
      // CRITICAL RULE 1: originalDomain must NEVER be overwritten!
      expect(updatedCandidate.originalDomain).toBe('Web Development');
      // CRITICAL RULE 2: Transfer does not automatically shortlist
      expect(updatedCandidate.shortlistStatus).toBe('PENDING');

      // Verify TransferLog was created
      const logs = await TransferLog.find({ candidate: candidate._id });
      expect(logs.length).toBe(1);
      expect(logs[0].transferReason).toMatch(/mathematical foundation/);
    });

    it('should allow the receiving lead to access candidate and previous evaluations after transfer', async () => {
      // 1. Web lead adds an evaluation first
      await request(app)
        .post(`/api/candidates/${candidate._id}/evaluations`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({
          score: 8,
          remarks: 'Initial round Web evaluation.'
        });

      // 2. Transfer candidate to AI/ML
      await request(app)
        .post(`/api/candidates/${candidate._id}/transfer`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({
          destinationDomain: 'AI/ML',
          destinationLeadId: aimlLeadId,
          transferReason: 'Candidate shifted interest to AI track.'
        });

      // 3. AI/ML lead now accesses candidate details
      const viewRes = await request(app)
        .get(`/api/candidates/${candidate._id}`)
        .set('Authorization', `Bearer ${aimlLeadToken}`);

      expect(viewRes.statusCode).toBe(200);
      expect(viewRes.body.data.currentDomain).toBe('AI/ML');
      expect(viewRes.body.data.originalDomain).toBe('Web Development');
      expect(viewRes.body.data.evaluations.length).toBe(1);
      expect(viewRes.body.data.evaluations[0].remarks).toBe('Initial round Web evaluation.');
      expect(viewRes.body.data.transferHistory.length).toBe(1);
    });

    it('should return 400 if destinationDomain or transferReason is missing during transfer', async () => {
      const res = await request(app)
        .post(`/api/candidates/${candidate._id}/transfer`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({
          destinationDomain: 'AI/ML'
          // missing transferReason
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/transferReason is required/i);
    });
  });
});
