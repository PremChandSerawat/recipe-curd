import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RecipesService } from './recipes.service';
import { Recipe } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { NotFoundException } from '@nestjs/common';

describe('RecipesService', () => {
  let service: RecipesService;
  let model: Model<Recipe>;

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

  const mockModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: getModelToken(Recipe.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
    model = module.get<Model<Recipe>>(getModelToken(Recipe.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new recipe', async () => {
      mockModel.create.mockResolvedValue(mockRecipe);

      const result = await service.create(mockCreateRecipeDto);
      expect(result).toEqual(mockRecipe);
      expect(mockModel.create).toHaveBeenCalledWith(mockCreateRecipeDto);
    });

    it('should throw an error if creation fails', async () => {
      const error = new Error('Creation failed');
      mockModel.create.mockRejectedValue(error);

      await expect(service.create(mockCreateRecipeDto)).rejects.toThrow(
        'Failed to create recipe: Creation failed',
      );
    });
  });

  describe('findAll', () => {
    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockRecipe]),
      getQuery: jest.fn().mockReturnValue({}),
    };

    beforeEach(() => {
      mockModel.find.mockReturnValue(mockQuery);
      mockModel.countDocuments.mockResolvedValue(1);
    });

    it('should return paginated recipes', async () => {
      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(result).toEqual({
        data: [mockRecipe],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should apply search filter', async () => {
      await service.findAll({
        search: 'test',
      });

      expect(mockQuery.where).toHaveBeenCalledWith('name', expect.any(RegExp));
    });
  });

  describe('findOne', () => {
    it('should return a recipe by id', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockRecipe);
      mockModel.findById.mockReturnValue({ exec: mockExec });

      const result = await service.findOne('some-id');
      expect(result).toEqual(mockRecipe);
      expect(mockModel.findById).toHaveBeenCalledWith('some-id');
    });

    it('should throw NotFoundException if recipe not found', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      mockModel.findById.mockReturnValue({ exec: mockExec });

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    const mockUpdateDto: UpdateRecipeDto = {
      name: 'Updated Recipe',
    };

    it('should update a recipe', async () => {
      const updatedRecipe = { ...mockRecipe, ...mockUpdateDto };
      const mockExec = jest.fn().mockResolvedValue(updatedRecipe);
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

      const result = await service.update('some-id', mockUpdateDto);
      expect(result).toEqual(updatedRecipe);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'some-id',
        mockUpdateDto,
        { new: true },
      );
    });

    it('should throw NotFoundException if recipe not found', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      mockModel.findByIdAndUpdate.mockReturnValue({ exec: mockExec });

      await expect(service.update('invalid-id', mockUpdateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a recipe', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockRecipe);
      mockModel.findByIdAndDelete.mockReturnValue({ exec: mockExec });

      await service.remove('some-id');
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('some-id');
    });

    it('should throw NotFoundException if recipe not found', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      mockModel.findByIdAndDelete.mockReturnValue({ exec: mockExec });

      await expect(service.remove('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
