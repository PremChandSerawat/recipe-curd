import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';

describe('RecipesController', () => {
  let controller: RecipesController;
  let service: RecipesService;

  const mockRecipe = {
    id: 'some-id',
    name: 'Test Recipe',
    ingredients: ['ingredient1', 'ingredient2'],
    instructions: 'Test instructions',
    prepTime: 30,
    cookTime: 45,
    difficulty: 'medium',
    servings: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateRecipeDto: CreateRecipeDto = {
    name: 'Test Recipe',
    ingredients: ['ingredient1', 'ingredient2'],
    instructions: 'Test instructions',
    prepTime: 30,
    cookTime: 45,
    difficulty: 'medium',
    servings: 4,
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<RecipesController>(RecipesController);
    service = module.get<RecipesService>(RecipesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new recipe', async () => {
      mockService.create.mockResolvedValue(mockRecipe);

      const result = await controller.create(mockCreateRecipeDto);
      expect(result).toEqual(mockRecipe);
      expect(mockService.create).toHaveBeenCalledWith(mockCreateRecipeDto);
    });
  });

  describe('findAll', () => {
    const mockPaginatedResponse = {
      data: [mockRecipe],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    it('should return paginated recipes', async () => {
      mockService.findAll.mockResolvedValue(mockPaginatedResponse);

      const queryDto: QueryRecipeDto = {
        page: 1,
        limit: 10,
      };

      const result = await controller.findAll(queryDto);
      expect(result).toEqual(mockPaginatedResponse);
      expect(mockService.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('findOne', () => {
    it('should return a recipe by id', async () => {
      mockService.findOne.mockResolvedValue(mockRecipe);

      const result = await controller.findOne('some-id');
      expect(result).toEqual(mockRecipe);
      expect(mockService.findOne).toHaveBeenCalledWith('some-id');
    });
  });

  describe('update', () => {
    it('should update a recipe', async () => {
      const updateDto: UpdateRecipeDto = {
        name: 'Updated Recipe',
      };
      const updatedRecipe = { ...mockRecipe, ...updateDto };
      mockService.update.mockResolvedValue(updatedRecipe);

      const result = await controller.update('some-id', updateDto);
      expect(result).toEqual(updatedRecipe);
      expect(mockService.update).toHaveBeenCalledWith('some-id', updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a recipe', async () => {
      await controller.remove('some-id');
      expect(mockService.remove).toHaveBeenCalledWith('some-id');
    });
  });
});
