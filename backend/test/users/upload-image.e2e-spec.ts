import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as path from 'path';
import * as fs from 'fs';

describe('UserController - Upload Image (e2e)', () => {
  let app: INestApplication;
  let testImagePath: string;
  const testUserId = 'cmmq7mugv0001zu3wss0g3kf2'; // Replace with actual user ID when testing

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    // Create a test image file
    testImagePath = path.join(__dirname, 'test-image.jpg');
    fs.writeFileSync(testImagePath, 'fake image content');

    await app.init();
  });

  afterAll(async () => {
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    await app.close();
  });

  describe('POST /api/users/admin/upload-to-user/:userId', () => {
    it('should return 401 without token', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/users/admin/upload-to-user/${testUserId}`)
        .attach('image', testImagePath)
        .expect(401);

      console.log('Upload without token response:', response.body);
    });

    it('should return 400 without file', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/users/admin/upload-to-user/${testUserId}`)
        .expect(400);

      console.log('Upload without file response:', response.body);
    });
  });
});
