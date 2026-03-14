import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/utils/prisma/prisma.service';
import { SessionService } from '../../src/utils/sessions/session.service';

describe('UserController (e2e) - Company Data', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sessionService: SessionService;
  let authToken: string;
  let userId: string;

  const companyDataDto = {
    companyName: 'Tech Solutions Ltd',
    numberOfUsers: 20,
    numberOfProducts: 450,
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
    sessionService = app.get(SessionService);

    await app.init();
  });

  beforeEach(async () => {
    // Clean up database
    await prisma.session.deleteMany({});
    await prisma.companyData.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'testuser@gmail.com',
        firebaseUid: 'test-firebase-uid',
        fullName: 'Test User',
        role: 'USER',
        isEmailVerified: true,
      },
    });
    userId = user.id;

    // Create session for authentication
    const session = await sessionService.createSession({
      firebaseUid: 'test-firebase-uid',
      email: 'testuser@gmail.com',
      userId: user.id,
    });
    authToken = session.token;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/users/company-data (POST)', () => {
    it('should successfully submit company data with valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/company-data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyDataDto)
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'Company data submitted successfully',
      );
      expect(response.body.data).toHaveProperty(
        'companyName',
        companyDataDto.companyName,
      );
      expect(response.body.data).toHaveProperty(
        'numberOfUsers',
        companyDataDto.numberOfUsers,
      );
      expect(response.body.data).toHaveProperty(
        'numberOfProducts',
        companyDataDto.numberOfProducts,
      );
      expect(response.body.data).toHaveProperty('percentage');
      expect(response.body.data.percentage).toBe(2250); // (450/20)*100 = 2250
    });

    it('should fail without authentication token', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/company-data')
        .send(companyDataDto)
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/company-data')
        .set('Authorization', 'Bearer invalid-token')
        .send(companyDataDto)
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        companyName: 'Tech Solutions Ltd',
        // missing numberOfUsers and numberOfProducts
      };

      const response = await request(app.getHttpServer())
        .post('/users/company-data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      expect(response.body.message).toContain('numberOfUsers must be a number');
      expect(response.body.message).toContain(
        'numberOfProducts must be a number',
      );
    });

    it('should validate field types', async () => {
      const invalidDto = {
        companyName: 123, // should be string
        numberOfUsers: '20', // should be number
        numberOfProducts: '450', // should be number
      };

      await request(app.getHttpServer())
        .post('/users/company-data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should validate number ranges', async () => {
      const invalidDto = {
        companyName: 'Tech Solutions Ltd',
        numberOfUsers: -5, // negative number
        numberOfProducts: 0, // zero
      };

      await request(app.getHttpServer())
        .post('/users/company-data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should prevent duplicate submission without creating multiple records', async () => {
      // First submission
      await request(app.getHttpServer())
        .post('/users/company-data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(companyDataDto)
        .expect(201);

      // Second submission
      await request(app.getHttpServer())
        .post('/users/company-data')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...companyDataDto,
          companyName: 'Updated Tech Solutions',
        })
        .expect(201);

      // Check that we have 2 records (history is preserved)
      const companyDataRecords = await prisma.companyData.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      expect(companyDataRecords).toHaveLength(2);
      expect(companyDataRecords[0].companyName).toBe('Updated Tech Solutions');
      expect(companyDataRecords[1].companyName).toBe('Tech Solutions Ltd');
    });

    it('should calculate percentage correctly', async () => {
      const testCases = [
        {
          input: { numberOfUsers: 10, numberOfProducts: 100 },
          expected: 1000, // (100/10)*100 = 1000
        },
        {
          input: { numberOfUsers: 50, numberOfProducts: 25 },
          expected: 50, // (25/50)*100 = 50
        },
        {
          input: { numberOfUsers: 100, numberOfProducts: 100 },
          expected: 100, // (100/100)*100 = 100
        },
      ];

      for (const testCase of testCases) {
        const response = await request(app.getHttpServer())
          .post('/users/company-data')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            companyName: 'Test Company',
            ...testCase.input,
          })
          .expect(201);

        expect(response.body.data.percentage).toBe(testCase.expected);
      }
    });
  });
});
