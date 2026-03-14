import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('UserController - User Dashboard (e2e)', () => {
  let app: INestApplication;
  const testUserId = 'cmmq7lwgc0000zu3wbtujbmyl'; // Replace with actual user ID when testing

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

  describe('GET /api/users/admin/user-dashboard/:userId', () => {
    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/admin/user-dashboard/${testUserId}`)
        .expect(401);

      console.log('Dashboard without token response:', response.body);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/users/admin/user-dashboard/${testUserId}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      console.log('Dashboard with invalid token response:', response.body);
    });
  });
});
