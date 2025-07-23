import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateRecipeDto } from '../src/recipes/dto/create-recipe.dto';
import { Model } from 'mongoose';
import { Recipe } from '../src/recipes/entities/recipe.entity';
import { getModelToken } from '@nestjs/mongoose';

describe('RecipesController (e2e)', () => {
  let app: INestApplication;
  let recipeModel: Model<Recipe>;

  const mockRecipe: CreateRecipeDto = {
    name: 'Test Recipe',
    ingredients: ['ingredient1', 'ingredient2'],
    instructions: 'Test instructions',
    prepTime: 30,
    cookTime: 45,
    difficulty: 'medium',
    servings: 4,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    recipeModel = moduleFixture.get<Model<Recipe>>(getModelToken(Recipe.name));
    await app.init();
  });

  afterAll(async () => {
    await recipeModel.deleteMany({});
    await app.close();
  });

  beforeEach(async () => {
    await recipeModel.deleteMany({});
  });

  describe('/recipes (POST)', () => {
    it('should create a new recipe', () => {
      return request(app.getHttpServer())
        .post('/recipes')
        .send(mockRecipe)
        .expect(201)
        .expect((res) => {
          expect(res.body).toMatchObject({
            ...mockRecipe,
            _id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          });
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/recipes')
        .send({})
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toEqual(expect.any(Array));
        });
    });
  });

  describe('/recipes (GET)', () => {
    beforeEach(async () => {
      await recipeModel.create(mockRecipe);
    });

    it('should return paginated recipes', () => {
      return request(app.getHttpServer())
        .get('/recipes')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            data: expect.arrayContaining([
              expect.objectContaining({
                name: mockRecipe.name,
              }),
            ]),
            meta: expect.objectContaining({
              total: 1,
              page: 1,
              limit: 10,
              totalPages: 1,
            }),
          });
        });
    });

    it('should filter recipes by search term', () => {
      return request(app.getHttpServer())
        .get('/recipes?search=Test')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(1);
          expect(res.body.data[0].name).toContain('Test');
        });
    });
  });

  describe('/recipes/:id (GET)', () => {
    let createdRecipe;

    beforeEach(async () => {
      createdRecipe = await recipeModel.create(mockRecipe);
    });

    it('should return a recipe by id', () => {
      return request(app.getHttpServer())
        .get(`/recipes/${createdRecipe._id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            ...mockRecipe,
            _id: createdRecipe._id.toString(),
          });
        });
    });

    it('should return 404 for non-existent recipe', () => {
      return request(app.getHttpServer())
        .get('/recipes/5f7d7c3c9d3e2a1234567890')
        .expect(404);
    });
  });

  describe('/recipes/:id (PATCH)', () => {
    let createdRecipe;

    beforeEach(async () => {
      createdRecipe = await recipeModel.create(mockRecipe);
    });

    it('should update a recipe', () => {
      const updateDto = { name: 'Updated Recipe Name' };
      return request(app.getHttpServer())
        .patch(`/recipes/${createdRecipe._id}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            ...mockRecipe,
            ...updateDto,
            _id: createdRecipe._id.toString(),
          });
        });
    });
  });

  describe('/recipes/:id (DELETE)', () => {
    let createdRecipe;

    beforeEach(async () => {
      createdRecipe = await recipeModel.create(mockRecipe);
    });

    it('should delete a recipe', () => {
      return request(app.getHttpServer())
        .delete(`/recipes/${createdRecipe._id}`)
        .expect(204);
    });

    it('should return 404 for non-existent recipe', () => {
      return request(app.getHttpServer())
        .delete('/recipes/5f7d7c3c9d3e2a1234567890')
        .expect(404);
    });
  });
});
