import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/utils/prisma/prisma.service';
import { SessionService } from '../../src/utils/sessions/session.service';

describe('UserController (e2e) - User Dashboard', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sessionService: SessionService;
  let adminToken: string;
  let adminId: string;
  let userId: string;

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
    sessionService = app.get(SessionService);

    await app.init();
  });

  beforeEach(async () => {
    // Clean up database
    await prisma.session.deleteMany({});
    await prisma.image.deleteMany({});
    await prisma.companyData.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.admin.deleteMany({});

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'testuser@gmail.com',
        firebaseUid: 'test-user-uid',
        fullName: 'Test User',
        role: 'USER',
        isEmailVerified: true,
      },
    });
    userId = user.id;

    // Create test admin
    const admin = await prisma.admin.create({
      data: {
        email: 'testadmin@gmail.com',
        firebaseUid: 'test-admin-uid',
        fullName: 'Test Admin',
        role: 'ADMIN',
        isEmailVerified: true,
      },
    });
    adminId = admin.id;

    // Create admin session
    const adminSession = await sessionService.createSession({
      firebaseUid: 'test-admin-uid',
      email: 'testadmin@gmail.com',
      adminId: admin.id,
    });
    adminToken = adminSession.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/users/admin/user-dashboard/:userId (GET)', () => {
    it('should fetch user dashboard with company data and recent image', async () => {
      // Create company data
      await prisma.companyData.create({
        data: {
          companyName: 'Tech Solutions Ltd',
          numberOfUsers: 20,
          numberOfProducts: 450,
          percentage: 2250,
          userId,
        },
      });

      // Create an image
      await prisma.image.create({
        data: {
          filename: 'test-image.jpg',
          originalName: 'test-image.jpg',
          path: 'https://example.com/image.jpg',
          mimetype: 'image/jpeg',
          size: 1024,
          uploadedById: adminId,
          userId,
        },
      });

      const response = await request(app.getHttpServer())
        .get(`/users/admin/user-dashboard/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', userId);
      expect(response.body.user).toHaveProperty('name', 'Test User');
      expect(response.body.user).toHaveProperty('email', 'testuser@gmail.com');

      expect(response.body).toHaveProperty('mostRecentSubmission');
      expect(response.body.mostRecentSubmission).toHaveProperty(
        'companyName',
        'Tech Solutions Ltd',
      );
      expect(response.body.mostRecentSubmission).toHaveProperty(
        'numberOfUsers',
        20,
      );
      expect(response.body.mostRecentSubmission).toHaveProperty(
        'numberOfProducts',
        450,
      );
      expect(response.body.mostRecentSubmission).toHaveProperty(
        'percentage',
        2250,
      );

      expect(response.body).toHaveProperty('recentImage');
      expect(response.body.recentImage).toHaveProperty(
        'filename',
        'test-image.jpg',
      );
      expect(response.body.recentImage).toHaveProperty(
        'uploadedBy',
        'Test Admin',
      );

      expect(response.body).toHaveProperty('hasData', true);
      expect(response.body).toHaveProperty('hasImage', true);
    });

    it('should return null for missing data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/admin/user-dashboard/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.mostRecentSubmission).toBeNull();
      expect(response.body.recentImage).toBeNull();
      expect(response.body.hasData).toBe(false);
      expect(response.body.hasImage).toBe(false);
    });

    it('should fail for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/admin/user-dashboard/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });

    it('should fail without admin authentication', async () => {
      await request(app.getHttpServer())
        .get(`/users/admin/user-dashboard/${userId}`)
        .expect(401);
    });

    it('should fail with user token (non-admin)', async () => {
      // Create user session
      const userSession = await sessionService.createSession({
        firebaseUid: 'test-user-uid',
        email: 'testuser@gmail.com',
        userId,
      });

      await request(app.getHttpServer())
        .get(`/users/admin/user-dashboard/${userId}`)
        .set('Authorization', `Bearer ${userSession.token}`)
        .expect(403);
    });

    it('should return most recent company data when multiple exist', async () => {
      // Create multiple company data records
      await prisma.companyData.createMany({
        data: [
          {
            companyName: 'First Company',
            numberOfUsers: 10,
            numberOfProducts: 100,
            percentage: 1000,
            userId,
            createdAt: new Date('2024-01-01'),
          },
          {
            companyName: 'Second Company',
            numberOfUsers: 20,
            numberOfProducts: 400,
            percentage: 2000,
            userId,
            createdAt: new Date('2024-02-01'),
          },
          {
            companyName: 'Third Company',
            numberOfUsers: 30,
            numberOfProducts: 900,
            percentage: 3000,
            userId,
            createdAt: new Date('2024-03-01'),
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get(`/users/admin/user-dashboard/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.mostRecentSubmission.companyName).toBe(
        'Third Company',
      );
    });

    it('should return most recent image when multiple exist', async () => {
      // Create multiple images
      await prisma.image.createMany({
        data: [
          {
            filename: 'old-image.jpg',
            originalName: 'old.jpg',
            path: 'https://example.com/old.jpg',
            mimetype: 'image/jpeg',
            size: 1024,
            uploadedById: adminId,
            userId,
            createdAt: new Date('2024-01-01'),
          },
          {
            filename: 'recent-image.jpg',
            originalName: 'recent.jpg',
            path: 'https://example.com/recent.jpg',
            mimetype: 'image/jpeg',
            size: 2048,
            uploadedById: adminId,
            userId,
            createdAt: new Date('2024-02-01'),
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get(`/users/admin/user-dashboard/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.recentImage.filename).toBe('recent-image.jpg');
    });
  });
});
