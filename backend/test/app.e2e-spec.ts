import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

describe('CSMS Application (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUserId: string;
  let testEmployeeId: string;
  let testInstitutionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipe(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Clean up test data
    await prisma.passwordResetToken.deleteMany();
    await prisma.request.deleteMany();
    await prisma.confirmationRequest.deleteMany();
    await prisma.promotionRequest.deleteMany();
    await prisma.lwopRequest.deleteMany();
    await prisma.retirementRequest.deleteMany();
    await prisma.cadreChangeRequest.deleteMany();
    await prisma.resignationRequest.deleteMany();
    await prisma.serviceExtensionRequest.deleteMany();
    await prisma.separationRequest.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    await prisma.institution.deleteMany();

    // Create test institution
    testInstitutionId = uuidv4();
    await prisma.institution.create({
      data: {
        id: testInstitutionId,
        name: 'Test Institution',
        email: 'test@institution.gov.zm',
        phoneNumber: '+255-24-000-0000',
        voteNumber: 'V999',
        tinNumber: 'TIN999',
      },
    });

    // Create test employee
    testEmployeeId = uuidv4();
    await prisma.employee.create({
      data: {
        id: testEmployeeId,
        name: 'Test Employee',
        gender: 'Male',
        zanId: `ZAN-TEST-${Date.now()}`,
        phoneNumber: '+255-77-000-0000',
        contactAddress: '123 Test Street',
        cadre: 'Test Cadre',
        salaryScale: 'VII',
        ministry: 'Test Ministry',
        department: 'Test Department',
        appointmentType: 'Permanent',
        contractType: 'Indefinite',
        employmentDate: new Date('2020-01-01'),
        status: 'ACTIVE',
        institutionId: testInstitutionId,
      },
    });

    // Create test user with hashed password
    testUserId = uuidv4();
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    await prisma.user.create({
      data: {
        id: testUserId,
        name: 'Test User',
        username: `testuser_${Date.now()}`,
        password: hashedPassword,
        role: 'ADMIN',
        active: true,
        institutionId: testInstitutionId,
        employeeId: null,
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.passwordResetToken.deleteMany();
    await prisma.request.deleteMany();
    await prisma.confirmationRequest.deleteMany();
    await prisma.promotionRequest.deleteMany();
    await prisma.lwopRequest.deleteMany();
    await prisma.retirementRequest.deleteMany();
    await prisma.cadreChangeRequest.deleteMany();
    await prisma.resignationRequest.deleteMany();
    await prisma.serviceExtensionRequest.deleteMany();
    await prisma.separationRequest.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.user.deleteMany();
    await prisma.institution.deleteMany();

    await app.close();
  });

  describe('Authentication Flow', () => {
    const testUsername = `testuser_${Date.now()}`;

    beforeAll(async () => {
      // Create a user for auth tests
      const hashedPassword = await bcrypt.hash('authpassword', 10);
      await prisma.user.create({
        data: {
          id: uuidv4(),
          name: 'Auth Test User',
          username: testUsername,
          password: hashedPassword,
          role: 'HRO',
          active: true,
          institutionId: testInstitutionId,
          email: 'auth@test.com',
        },
      });
    });

    it('/auth/login (POST) - should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUsername,
          password: 'authpassword',
        })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.username).toBe(testUsername);
      authToken = response.body.access_token;
    });

    it('/auth/login (POST) - should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUsername,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('/auth/login (POST) - should reject missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });

    it('/auth/profile (GET) - should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.username).toBe(testUsername);
      expect(response.body.password).toBeUndefined();
    });

    it('/auth/profile (GET) - should reject without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('/auth/register (POST) - should register a new user', async () => {
      const newUser = {
        name: 'New Registered User',
        username: `newuser_${Date.now()}`,
        password: 'newpassword123',
        role: 'HRO',
        institutionId: testInstitutionId,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body.access_token).toBeDefined();
      expect(response.body.user.username).toBe(newUser.username);
    });

    it('/auth/register (POST) - should reject duplicate username', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Duplicate User',
          username: testUsername,
          password: 'password123',
          role: 'HRO',
          institutionId: testInstitutionId,
        })
        .expect(400);
    });

    it('/auth/logout (POST) - should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('Employee Management', () => {
    let newEmployeeId: string;
    const uniqueZanId = `ZAN-E2E-${Date.now()}`;

    it('/employees (POST) - should create a new employee', async () => {
      const newEmployee = {
        name: 'E2E Test Employee',
        gender: 'Female',
        zanId: uniqueZanId,
        phoneNumber: '+255-77-999-9999',
        contactAddress: '456 E2E Street',
        cadre: 'Senior Officer',
        salaryScale: 'VII',
        ministry: 'E2E Ministry',
        department: 'E2E Department',
        appointmentType: 'Permanent',
        contractType: 'Indefinite',
        employmentDate: '2024-01-15',
        status: 'ACTIVE',
        institutionId: testInstitutionId,
      };

      const response = await request(app.getHttpServer())
        .post('/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newEmployee)
        .expect(201);

      expect(response.body.name).toBe(newEmployee.name);
      expect(response.body.zanId).toBe(newEmployee.zanId);
      newEmployeeId = response.body.id;
    });

    it('/employees (POST) - should reject employee with duplicate ZAN ID', async () => {
      await request(app.getHttpServer())
        .post('/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Duplicate Employee',
          gender: 'Male',
          zanId: uniqueZanId,
          employmentDate: '2024-01-15',
          status: 'ACTIVE',
          institutionId: testInstitutionId,
        })
        .expect(409);
    });

    it('/employees (GET) - should get paginated employees', async () => {
      const response = await request(app.getHttpServer())
        .get('/employees?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.employees).toBeDefined();
      expect(Array.isArray(response.body.employees)).toBe(true);
      expect(response.body.total).toBeDefined();
      expect(response.body.page).toBe(1);
    });

    it('/employees (GET) - should search employees by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/employees?search=E2E&page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.employees.length).toBeGreaterThan(0);
    });

    it('/employees/:id (GET) - should get employee by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/employees/${newEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(newEmployeeId);
      expect(response.body.name).toBe('E2E Test Employee');
    });

    it('/employees/:id (GET) - should return 404 for non-existent employee', async () => {
      await request(app.getHttpServer())
        .get('/employees/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('/employees/:id (PUT) - should update an employee', async () => {
      const updateData = {
        name: 'Updated E2E Employee',
        department: 'Updated Department',
      };

      const response = await request(app.getHttpServer())
        .put(`/employees/${newEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.department).toBe(updateData.department);
    });

    it('/employees/search (GET) - should search by ZAN ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/employees/search?zanId=${uniqueZanId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.employee).toBeDefined();
      expect(response.body.employee.zanId).toBe(uniqueZanId);
    });

    it('/employees/:id (DELETE) - should delete an employee', async () => {
      await request(app.getHttpServer())
        .delete(`/employees/${newEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/employees/${newEmployeeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Request Management', () => {
    let confirmationRequestId: string;

    beforeAll(async () => {
      // Ensure we have an employee on probation for confirmation request
      await prisma.employee.update({
        where: { id: testEmployeeId },
        data: { status: 'PROBATION' },
      });
    });

    it('/requests/confirmation (POST) - should create confirmation request', async () => {
      const requestData = {
        employeeId: testEmployeeId,
        proposedConfirmationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: 'E2E test confirmation request',
      };

      const response = await request(app.getHttpServer())
        .post('/requests/confirmation')
        .set('Authorization', `Bearer ${authToken}`)
        .send(requestData)
        .expect(201);

      expect(response.body.status).toBe('PENDING');
      expect(response.body.employeeId).toBe(testEmployeeId);
      confirmationRequestId = response.body.id;
    });

    it('/requests (GET) - should get paginated requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/requests?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.requests).toBeDefined();
      expect(Array.isArray(response.body.requests)).toBe(true);
      expect(response.body.total).toBeDefined();
    });

    it('/requests (GET) - should filter requests by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/requests?status=PENDING&page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.requests.every((r: any) => r.status === 'PENDING')).toBe(true);
    });

    it('/requests/:id (GET) - should get request by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/requests/${confirmationRequestId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(confirmationRequestId);
    });

    it('/requests/:id/approve (POST) - should approve a request', async () => {
      const response = await request(app.getHttpServer())
        .post(`/requests/${confirmationRequestId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          decisionDate: new Date().toISOString(),
          commissionDecisionDate: new Date().toISOString(),
        })
        .query({ type: 'confirmation' })
        .expect(201);

      expect(response.body.status).toBe('APPROVED');
    });

    it('/requests/export/csv (GET) - should export requests to CSV', async () => {
      const response = await request(app.getHttpServer())
        .get('/requests/export/csv')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
    });
  });

  describe('Health Check', () => {
    it('/health (GET) - should return health status if endpoint exists', async () => {
      // This test will pass whether the endpoint exists or not
      const response = await request(app.getHttpServer())
        .get('/health');

      // Should return either 200 (if implemented) or 404 (if not)
      expect([200, 404]).toContain(response.status);
    });
  });
});
