import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('UserController - Company Data (e2e)', () => {
  let app: INestApplication;

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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/users/company-data', () => {
    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/company-data')
        .send(companyDataDto)
        .expect(401);

      console.log('Company data without token response:', response.body);
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/users/company-data')
        .send({ companyName: 'Test' })
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
      console.log('Validation error:', response.body.message);
    });
  });
});
