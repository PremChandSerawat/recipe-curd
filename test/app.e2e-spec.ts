import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configure validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // Configure Swagger
    const config = new DocumentBuilder()
      .setTitle('Recipe API')
      .setDescription('API for managing cooking recipes')
      .setVersion('1.0')
      .addTag('recipes')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('OpenAPI Documentation', () => {
    it('/api-json (GET)', () => {
      return request(app.getHttpServer())
        .get('/api-json')
        .expect(200)
        .expect('Content-Type', /application\/json/);
    });

    it('/api (GET)', () => {
      return request(app.getHttpServer())
        .get('/api')
        .expect(200)
        .expect('Content-Type', /html/);
    });
  });
});
