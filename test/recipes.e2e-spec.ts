import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CreateRecipeDto } from '../src/recipes/dto/create-recipe.dto';
import { Model, Types } from 'mongoose';
import { Recipe } from '../src/recipes/entities/recipe.entity';
import { getModelToken } from '@nestjs/mongoose';

interface RecipeDocument extends Recipe {
  _id: Types.ObjectId;
}

describe('RecipesController (e2e)', () => {
  let app: INestApplication;
  let recipeModel: Model<RecipeDocument>;

  const mockRecipes = [
    {
      name: 'Garlic Parmesan Pasta',
      ingredients: ['pasta', 'garlic', 'parmesan', 'olive oil'],
      instructions: 'Cook pasta, add lots of garlic and parmesan',
      prepTime: 10,
      cookTime: 20,
      difficulty: 'easy',
      servings: 4,
    },
    {
      name: 'Simple Toast',
      ingredients: ['bread', 'butter'],
      instructions: 'Just toast the bread lightly',
      prepTime: 2,
      cookTime: 3,
      difficulty: 'easy',
      servings: 1,
    },
    {
      name: 'Garlic Bread',
      ingredients: ['bread', 'garlic', 'butter', 'herbs'],
      instructions: 'Toast bread with garlic butter',
      prepTime: 5,
      cookTime: 10,
      difficulty: 'easy',
      servings: 2,
    }
  ];

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

    recipeModel = moduleFixture.get<Model<RecipeDocument>>(getModelToken(Recipe.name));

    // Drop existing indexes and collection
    try {
      await recipeModel.collection.dropIndexes();
      await recipeModel.collection.drop();
    } catch (error) {
      // Collection might not exist yet
    }

    await app.init();
  });

  afterAll(async () => {
    await recipeModel.deleteMany({});
    await app.close();
  });

  beforeEach(async () => {
    await recipeModel.deleteMany({});
  });

  describe('Text Search', () => {
    beforeEach(async () => {
      // Create test recipes
      await Promise.all(mockRecipes.map(recipe => recipeModel.create(recipe)));
      
      // Wait for indexes to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    it('should return high-relevance results with scores', () => {
      return request(app.getHttpServer())
        .get('/recipes?textSearch=garlic')
        .expect(200)
        .expect((res) => {
          const { data, meta } = res.body;
          expect(data.length).toBeGreaterThan(0);
          expect(data[0]).toHaveProperty('score');
          expect(data[0].score).toBeGreaterThan(0.5);
          // First result should be most relevant
          expect(data[0].name).toContain('Garlic');
        });
    });

    it('should not return low-relevance results', () => {
      return request(app.getHttpServer())
        .get('/recipes?textSearch=food')
        .expect(200)
        .expect((res) => {
          const { data } = res.body;
          expect(data.length).toBe(0);
        });
    });

    it('should combine text search with filters', () => {
      return request(app.getHttpServer())
        .get('/recipes?textSearch=garlic&difficulty=easy&maxPrepTime=7')
        .expect(200)
        .expect((res) => {
          const { data } = res.body;
          expect(data.length).toBeGreaterThan(0);
          data.forEach(recipe => {
            expect(recipe.score).toBeGreaterThan(0.5);
            expect(recipe.difficulty).toBe('easy');
            expect(recipe.prepTime).toBeLessThanOrEqual(7);
            expect(recipe.name.toLowerCase()).toContain('garlic');
          });
        });
    });

    it('should return results sorted by text score', () => {
      return request(app.getHttpServer())
        .get('/recipes?textSearch=garlic')
        .expect(200)
        .expect((res) => {
          const { data } = res.body;
          expect(data.length).toBeGreaterThan(1);
          // Verify scores are in descending order
          for (let i = 1; i < data.length; i++) {
            expect(data[i-1].score).toBeGreaterThanOrEqual(data[i].score);
          }
        });
    });
  });

  describe('Regular Search', () => {
    beforeEach(async () => {
      await Promise.all(mockRecipes.map(recipe => recipeModel.create(recipe)));
    });

    it('should search by name without score threshold', () => {
      return request(app.getHttpServer())
        .get('/recipes?search=toast')
        .expect(200)
        .expect((res) => {
          const { data } = res.body;
          expect(data.length).toBeGreaterThan(0);
          data.forEach(recipe => {
            expect(recipe.name.toLowerCase()).toContain('toast');
            expect(recipe).not.toHaveProperty('score');
          });
        });
    });

    it('should handle pagination with search', () => {
      return request(app.getHttpServer())
        .get('/recipes?search=bread&page=1&limit=1')
        .expect(200)
        .expect((res) => {
          const { data, meta } = res.body;
          expect(data.length).toBe(1);
          expect(meta.total).toBeGreaterThan(1);
          expect(meta.totalPages).toBeGreaterThan(1);
        });
    });
  });

  describe('CRUD Operations', () => {
    it('/recipes (POST) - should create recipe', () => {
      const createRecipeDto: CreateRecipeDto = mockRecipes[0];
      return request(app.getHttpServer())
        .post('/recipes')
        .send(createRecipeDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('_id');
          expect(res.body.name).toBe(createRecipeDto.name);
        });
    });

    it('/recipes/:id (PATCH) - should update recipe', async () => {
      const recipe = await recipeModel.create(mockRecipes[0]) as RecipeDocument;
      const updateData = { name: 'Updated Recipe Name' };

      return request(app.getHttpServer())
        .patch(`/recipes/${recipe._id.toString()}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateData.name);
          expect(res.body._id).toBe(recipe._id.toString());
        });
    });

    it('/recipes/:id (DELETE) - should delete recipe', async () => {
      const recipe = await recipeModel.create(mockRecipes[0]) as RecipeDocument;

      await request(app.getHttpServer())
        .delete(`/recipes/${recipe._id.toString()}`)
        .expect(204);

      const deletedRecipe = await recipeModel.findById(recipe._id);
      expect(deletedRecipe).toBeNull();
    });
  });
});
