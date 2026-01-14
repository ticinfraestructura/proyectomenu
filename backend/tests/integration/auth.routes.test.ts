import request from 'supertest';
import app from '../../src/index';
import { prisma } from '../../src/utils/prisma';
import { hashPassword } from '../../src/utils/password';

describe('Auth Routes', () => {
  const testUser = {
    email: 'testuser@test.com',
    password: 'TestPass123!',
    nombres: 'Test',
    apellidos: 'User',
    celular: '3001234567',
  };

  beforeAll(async () => {
    // Create test user
    const passwordHash = await hashPassword(testUser.password);
    await prisma.usuario.upsert({
      where: { email: testUser.email },
      update: {},
      create: {
        email: testUser.email,
        passwordHash,
        nombres: testUser.nombres,
        apellidos: testUser.apellidos,
        celular: testUser.celular,
        activo: true,
      },
    });

    // Create test role
    const rol = await prisma.rol.upsert({
      where: { codigo: 'TEST_ROLE' },
      update: {},
      create: {
        codigo: 'TEST_ROLE',
        nombre: 'Test Role',
      },
    });

    const user = await prisma.usuario.findUnique({
      where: { email: testUser.email },
    });

    if (user) {
      await prisma.usuarioRol.upsert({
        where: {
          usuarioId_rolId: {
            usuarioId: user.id,
            rolId: rol.id,
          },
        },
        update: {},
        create: {
          usuarioId: user.id,
          rolId: rol.id,
        },
      });
    }
  });

  afterAll(async () => {
    // Cleanup
    await prisma.usuarioRol.deleteMany({
      where: { usuario: { email: testUser.email } },
    });
    await prisma.refreshToken.deleteMany({
      where: { usuario: { email: testUser.email } },
    });
    await prisma.usuario.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.rol.deleteMany({
      where: { codigo: 'TEST_ROLE' },
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: testUser.password,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/profile', () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      accessToken = response.body.data.accessToken;
    });

    it('should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let refreshToken: string;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });
      refreshToken = response.body.data.refreshToken;
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
    });
  });
});
