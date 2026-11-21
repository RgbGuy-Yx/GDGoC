const request = require('supertest');
const app = require('../src/app');
const Admin = require('../src/models/Admin');
const TeamLead = require('../src/models/TeamLead');
const { setupDB } = require('./setup');

describe('Authentication & Authorization APIs', () => {
  setupDB();

  const ADMIN_CODE = 'SECRET_ADMIN_123';
  const WEB_LEAD_CODE = 'LEAD_WEB_CODE';

  beforeEach(async () => {
    // Create Admin
    await Admin.create({
      name: 'Main Admin',
      accessCode: ADMIN_CODE,
      role: 'admin'
    });

    // Create Team Lead
    await TeamLead.create({
      name: 'Web Dev Lead',
      accessCode: WEB_LEAD_CODE,
      assignedDomains: ['Web Development']
    });
  });

  describe('POST /api/auth/admin-login', () => {
    it('should successfully authenticate admin with correct access code', async () => {
      const res = await request(app)
        .post('/api/auth/admin-login')
        .send({ accessCode: ADMIN_CODE });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('admin');
    });

    it('should reject admin login with incorrect access code', async () => {
      const res = await request(app)
        .post('/api/auth/admin-login')
        .send({ accessCode: 'WRONG_CODE' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid admin access code/i);
    });

    it('should reject admin login with missing access code', async () => {
      const res = await request(app).post('/api/auth/admin-login').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/lead-login', () => {
    it('should authenticate team lead with correct access code', async () => {
      const res = await request(app)
        .post('/api/auth/lead-login')
        .send({ accessCode: WEB_LEAD_CODE });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('lead');
      expect(res.body.data.user.assignedDomains).toContain('Web Development');
    });

    it('should reject team lead with invalid access code', async () => {
      const res = await request(app)
        .post('/api/auth/lead-login')
        .send({ accessCode: 'INVALID_LEAD_CODE' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile for authenticated admin', async () => {
      const loginRes = await request(app)
        .post('/api/auth/admin-login')
        .send({ accessCode: ADMIN_CODE });

      const token = loginRes.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.role).toBe('admin');
    });

    it('should return 401 when Authorization header is missing', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 when token is invalid or malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.value');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
