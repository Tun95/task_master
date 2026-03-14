import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/utils/prisma/prisma.service';
import * as admin from 'firebase-admin';

describe('AuthController (e2e) - Login', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const adminLoginDto = {
    email: 'shopmate400@gmail.com',
    password: 'Shopmate400+',
    location_data: {
      city: 'Lagos',
      region: 'Lagos State',
      country: 'Nigeria',
    },
  };

  const userLoginDto = {
    email: 'akandetunji2@gmail.com',
    password: 'Akande95+',
    location_data: {
      city: 'Lagos',
      region: 'Lagos State',
      country: 'Nigeria',
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prisma.session.deleteMany({});
    await prisma.otp.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should successfully login as admin with valid credentials', async () => {
      // Mock Firebase authentication
      jest.spyOn(admin.auth(), 'getUser').mockResolvedValueOnce({
        uid: 'test-admin-uid',
        email: adminLoginDto.email,
        emailVerified: true,
      } as any);

      // Create test admin in database
      await prisma.admin.create({
        data: {
          id: 'test-admin-id',
          email: adminLoginDto.email,
          firebaseUid: 'test-admin-uid',
          fullName: 'Shop Mate',
          role: 'ADMIN',
          isEmailVerified: true,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(adminLoginDto)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('admin');
      expect(response.body.admin).toHaveProperty('email', adminLoginDto.email);
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('accountType', 'admin');
    });

    it('should successfully login as user with valid credentials', async () => {
      // Mock Firebase authentication
      jest.spyOn(admin.auth(), 'getUser').mockResolvedValueOnce({
        uid: 'test-user-uid',
        email: userLoginDto.email,
        emailVerified: true,
      } as any);

      // Create test user in database
      await prisma.user.create({
        data: {
          id: 'test-user-id',
          email: userLoginDto.email,
          firebaseUid: 'test-user-uid',
          fullName: 'Akande Tunji',
          role: 'USER',
          isEmailVerified: true,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userLoginDto)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userLoginDto.email);
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('accountType', 'user');
      expect(response.body).toHaveProperty('hasCompanyData', false);
    });

    it('should fail login with unverified email', async () => {
      // Mock Firebase authentication with unverified email
      jest.spyOn(admin.auth(), 'getUser').mockResolvedValueOnce({
        uid: 'test-user-uid',
        email: userLoginDto.email,
        emailVerified: false,
      } as any);

      // Create test user in database
      await prisma.user.create({
        data: {
          id: 'test-user-id',
          email: userLoginDto.email,
          firebaseUid: 'test-user-uid',
          fullName: 'Akande Tunji',
          role: 'USER',
          isEmailVerified: false,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userLoginDto)
        .expect(401);

      expect(response.body.message).toContain('Please verify your email first');
    });

    it('should fail login with incorrect password', async () => {
      // Mock Firebase to throw error for invalid password
      jest
        .spyOn(admin.auth(), 'getUser')
        .mockRejectedValueOnce(new Error('auth/wrong-password'));

      const invalidLoginDto = {
        ...userLoginDto,
        password: 'wrongpassword',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLoginDto)
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should fail login with non-existent email', async () => {
      const nonExistentLoginDto = {
        email: 'nonexistent@gmail.com',
        password: 'SomePassword123+',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(nonExistentLoginDto)
        .expect(401);

      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        // missing email and password
        location_data: {
          city: 'Lagos',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });

    it('should create session with location data', async () => {
      // Mock Firebase authentication
      jest.spyOn(admin.auth(), 'getUser').mockResolvedValueOnce({
        uid: 'test-admin-uid',
        email: adminLoginDto.email,
        emailVerified: true,
      } as any);

      // Create test admin in database
      await prisma.admin.create({
        data: {
          id: 'test-admin-id',
          email: adminLoginDto.email,
          firebaseUid: 'test-admin-uid',
          fullName: 'Shop Mate',
          role: 'ADMIN',
          isEmailVerified: true,
        },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(adminLoginDto)
        .expect(200);

      // Verify session was created in database
      const session = await prisma.session.findUnique({
        where: { id: response.body.sessionId },
      });

      expect(session).toBeDefined();
      expect(session?.location).toContain('Lagos');
      expect(session?.isActive).toBe(true);
    });

    it('should invalidate previous sessions on new login', async () => {
      // Mock Firebase authentication
      jest.spyOn(admin.auth(), 'getUser').mockResolvedValue({
        uid: 'test-user-uid',
        email: userLoginDto.email,
        emailVerified: true,
      } as any);

      // Create test user in database
      await prisma.user.create({
        data: {
          id: 'test-user-id',
          email: userLoginDto.email,
          firebaseUid: 'test-user-uid',
          fullName: 'Akande Tunji',
          role: 'USER',
          isEmailVerified: true,
        },
      });

      // First login
      const firstLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userLoginDto)
        .expect(200);

      // Second login
      const secondLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userLoginDto)
        .expect(200);

      // First session should be invalidated
      const oldSession = await prisma.session.findUnique({
        where: { id: firstLogin.body.sessionId },
      });

      expect(oldSession?.isActive).toBe(false);
      expect(firstLogin.body.sessionId).not.toBe(secondLogin.body.sessionId);
    });
  });
});
