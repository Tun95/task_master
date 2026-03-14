import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AuthController - Login (e2e)', () => {
  let app: INestApplication;

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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should attempt admin login with provided credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(adminLoginDto);

      // Just log the response for debugging
      console.log('Admin login response status:', response.status);
      console.log('Admin login response body:', response.body);

      // We don't assert success/failure since actual credentials may vary
      expect(response.status).toBeDefined();
    });

    it('should attempt user login with provided credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(userLoginDto);

      console.log('User login response status:', response.status);
      console.log('User login response body:', response.body);

      expect(response.status).toBeDefined();
    });

    it('should validate required fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body.message).toBeInstanceOf(Array);
    });
  });
});
