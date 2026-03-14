import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/utils/prisma/prisma.service';
import { SessionService } from '../../src/utils/sessions/session.service';
import * as path from 'path';
import * as fs from 'fs';

describe('UserController (e2e) - Upload Image', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sessionService: SessionService;
  let adminToken: string;
  let adminId: string;
  let userId: string;
  let testImagePath: string;

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

    // Create a test image file
    testImagePath = path.join(__dirname, 'test-image.jpg');
    fs.writeFileSync(testImagePath, 'fake image content');

    await app.init();
  });

  beforeEach(async () => {
    // Clean up database
    await prisma.session.deleteMany({});
    await prisma.image.deleteMany({});
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
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    await prisma.$disconnect();
    await app.close();
  });

  describe('/users/admin/upload-to-user/:userId (POST)', () => {
    it('should successfully upload an image to user', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/admin/upload-to-user/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', testImagePath)
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'Image uploaded successfully to user',
      );
      expect(response.body.image).toHaveProperty('id');
      expect(response.body.image).toHaveProperty('url');
      expect(response.body.image).toHaveProperty('filename');
      expect(response.body.image).toHaveProperty('uploadedAt');

      // Verify image was saved in database
      const image = await prisma.image.findFirst({
        where: { userId },
      });

      expect(image).toBeDefined();
      expect(image?.uploadedById).toBe(adminId);
      expect(image?.userId).toBe(userId);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/users/admin/upload-to-user/${userId}`)
        .attach('image', testImagePath)
        .expect(401);
    });

    it('should fail with non-admin token', async () => {
      // Create user session
      const userSession = await sessionService.createSession({
        firebaseUid: 'test-user-uid',
        email: 'testuser@gmail.com',
        userId,
      });

      await request(app.getHttpServer())
        .post(`/users/admin/upload-to-user/${userId}`)
        .set('Authorization', `Bearer ${userSession.token}`)
        .attach('image', testImagePath)
        .expect(403);
    });

    it('should fail for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/users/admin/upload-to-user/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', testImagePath)
        .expect(404);
    });

    it('should fail without image file', async () => {
      await request(app.getHttpServer())
        .post(`/users/admin/upload-to-user/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should fail with invalid file type', async () => {
      // Create a text file
      const textFilePath = path.join(__dirname, 'test.txt');
      fs.writeFileSync(textFilePath, 'text content');

      const response = await request(app.getHttpServer())
        .post(`/users/admin/upload-to-user/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', textFilePath)
        .expect(400);

      // Clean up
      fs.unlinkSync(textFilePath);

      expect(response.body.message).toContain('Only image files are allowed');
    });

    it('should handle large file size', async () => {
      // Create a large file (mock large size)
      const largeFilePath = path.join(__dirname, 'large-image.jpg');
      const largeContent = Buffer.alloc(15 * 1024 * 1024); // 15MB
      fs.writeFileSync(largeFilePath, largeContent);

      await request(app.getHttpServer())
        .post(`/users/admin/upload-to-user/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', largeFilePath)
        .expect(413);

      // Clean up
      fs.unlinkSync(largeFilePath);
    });

    it('should create image record with correct metadata', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/admin/upload-to-user/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', testImagePath)
        .expect(201);

      const image = await prisma.image.findUnique({
        where: { id: response.body.image.id },
        include: {
          uploadedBy: true,
          user: true,
        },
      });

      expect(image?.originalName).toBe('test-image.jpg');
      expect(image?.uploadedBy.fullName).toBe('Test Admin');
      expect(image?.user.fullName).toBe('Test User');
      expect(image?.size).toBeGreaterThan(0);
    });

    it('should allow multiple images for same user', async () => {
      // Upload first image
      await request(app.getHttpServer())
        .post(`/users/admin/upload-to-user/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', testImagePath)
        .expect(201);

      // Upload second image
      await request(app.getHttpServer())
        .post(`/users/admin/upload-to-user/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', testImagePath)
        .expect(201);

      const images = await prisma.image.findMany({
        where: { userId },
      });

      expect(images).toHaveLength(2);
    });

    it('should log activity for image upload', async () => {
      await request(app.getHttpServer())
        .post(`/users/admin/upload-to-user/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('image', testImagePath)
        .expect(201);
    });
  });
});
