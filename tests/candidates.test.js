const request = require('supertest');
const app = require('../src/app');
const Admin = require('../src/models/Admin');
const TeamLead = require('../src/models/TeamLead');
const Candidate = require('../src/models/Candidate');
const { setupDB } = require('./setup');

describe('Candidate Management & Authorization Rules', () => {
  setupDB();

  let adminToken;
  let webLeadToken;
  let aimlLeadToken;
  let webCandidate;
  let aimlCandidate;

  beforeEach(async () => {
    // 1. Create Admin
    const admin = await Admin.create({
      name: 'Super Admin',
      accessCode: 'ADMIN_ACCESS_123',
      role: 'admin'
    });

    // 2. Create Leads
    const webLead = await TeamLead.create({
      name: 'Web Lead',
      accessCode: 'WEB_CODE_123',
      assignedDomains: ['Web Development']
    });

    const aimlLead = await TeamLead.create({
      name: 'AI Lead',
      accessCode: 'AIML_CODE_123',
      assignedDomains: ['AI/ML']
    });

    // Get Tokens
    const adminLogin = await request(app)
      .post('/api/auth/admin-login')
      .send({ accessCode: 'ADMIN_ACCESS_123' });
    adminToken = adminLogin.body.data.token;

    const webLeadLogin = await request(app)
      .post('/api/auth/lead-login')
      .send({ accessCode: 'WEB_CODE_123' });
    webLeadToken = webLeadLogin.body.data.token;

    const aimlLeadLogin = await request(app)
      .post('/api/auth/lead-login')
      .send({ accessCode: 'AIML_CODE_123' });
    aimlLeadToken = aimlLeadLogin.body.data.token;

    // 3. Create Candidates
    webCandidate = await Candidate.create({
      candidateId: 'GDGOC-2025-WEB01',
      email: 'web.dev@vjit.ac.in',
      phone: '9988776655',
      rollNumber: '22911A0599',
      yearOfStudy: '3',
      branch: 'CSE',
      preferredDomain: 'Web Development',
      originalDomain: 'Web Development',
      currentDomain: 'Web Development',
      assignedLead: webLead._id
    });

    aimlCandidate = await Candidate.create({
      candidateId: 'GDGOC-2025-AIML01',
      email: 'aiml.student@vjit.ac.in',
      phone: '9988776654',
      rollNumber: '22911A0598',
      yearOfStudy: '3',
      branch: 'IT',
      preferredDomain: 'AI/ML',
      originalDomain: 'AI/ML',
      currentDomain: 'AI/ML',
      assignedLead: aimlLead._id
    });
  });

  describe('GET /api/candidates (Admin only)', () => {
    it('should allow admin to retrieve all candidates', async () => {
      const res = await request(app)
        .get('/api/candidates')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('should deny team lead from accessing global candidates list (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/candidates')
        .set('Authorization', `Bearer ${webLeadToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Access denied/i);
    });
  });

  describe('GET /api/candidates/assigned (Lead access)', () => {
    it('should return only candidates assigned to web lead domain', async () => {
      const res = await request(app)
        .get('/api/candidates/assigned')
        .set('Authorization', `Bearer ${webLeadToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].email).toBe('web.dev@vjit.ac.in');
    });

    it('should return only candidates assigned to AI/ML lead domain', async () => {
      const res = await request(app)
        .get('/api/candidates/assigned')
        .set('Authorization', `Bearer ${aimlLeadToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].email).toBe('aiml.student@vjit.ac.in');
    });
  });

  describe('GET /api/candidates/:id (Access control enforcement)', () => {
    it('should allow web lead to view candidate in Web Development domain', async () => {
      const res = await request(app)
        .get(`/api/candidates/${webCandidate._id}`)
        .set('Authorization', `Bearer ${webLeadToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.candidateId).toBe('GDGOC-2025-WEB01');
    });

    it('should block web lead from viewing candidate in AI/ML domain (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/candidates/${aimlCandidate._id}`)
        .set('Authorization', `Bearer ${webLeadToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/not authorized to view or manage candidates in the 'AI\/ML' domain/i);
    });

    it('should allow admin to view any candidate regardless of domain', async () => {
      const res = await request(app)
        .get(`/api/candidates/${aimlCandidate._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe('aiml.student@vjit.ac.in');
    });
  });

  describe('PATCH /api/candidates/:id/shortlist', () => {
    it('should allow authorized lead to update shortlist status', async () => {
      const res = await request(app)
        .patch(`/api/candidates/${webCandidate._id}/shortlist`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({ shortlistStatus: 'SHORTLISTED' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.shortlistStatus).toBe('SHORTLISTED');

      const updated = await Candidate.findById(webCandidate._id);
      expect(updated.shortlistStatus).toBe('SHORTLISTED');
    });

    it('should reject invalid shortlist status', async () => {
      const res = await request(app)
        .patch(`/api/candidates/${webCandidate._id}/shortlist`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({ shortlistStatus: 'RANDOM_STATUS' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Invalid shortlist status/i);
    });
  });

  describe('PATCH /api/candidates/:id/final-selection (Admin Only)', () => {
    it('should prevent team lead from updating final selection status (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/candidates/${webCandidate._id}/final-selection`)
        .set('Authorization', `Bearer ${webLeadToken}`)
        .send({ finalSelectionStatus: 'SELECTED' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toMatch(/Access denied/i);
    });

    it('should allow admin to update final selection status to SELECTED', async () => {
      const res = await request(app)
        .patch(`/api/candidates/${webCandidate._id}/final-selection`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ finalSelectionStatus: 'SELECTED' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.finalSelectionStatus).toBe('SELECTED');

      const updated = await Candidate.findById(webCandidate._id);
      expect(updated.finalSelectionStatus).toBe('SELECTED');
    });
  });
});
