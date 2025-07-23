import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recipe } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name)
    private readonly recipeModel: Model<Recipe>,
  ) {}

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    try {
      const createdRecipe = await this.recipeModel.create(createRecipeDto);
      return createdRecipe;
    } catch (error) {
      throw new Error(
        `Failed to create recipe: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async findAll(queryDto: QueryRecipeDto) {
    // Destructure query parameters with default values
    const {
      page = 1, // Default to first page
      limit = 10, // Default to 10 items per page
      search, // Search term for recipe name
      difficulty, // Filter by difficulty level
      sortBy = 'createdAt', // Default sort by creation date
      sortOrder = 'DESC', // Default sort order
      maxPrepTime, // Filter by maximum preparation time
    } = queryDto;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build the query using Mongoose's query builder
    const query = this.recipeModel.find();

    // Apply search filter if search term is provided
    if (search) {
      // Case-insensitive search on recipe name using regex
      query.where('name', new RegExp(search, 'i'));
    }

    // Apply difficulty filter if specified
    if (difficulty) {
      // Exact match on difficulty level
      query.where('difficulty', difficulty);
    }

    // Apply maxPrepTime filter if specified
    if (maxPrepTime) {
      // Less than or equal to specified prep time
      query.where('prepTime').lte(maxPrepTime);
    }

    // Execute count query for total number of matching documents
    const total = await this.recipeModel.countDocuments(query.getQuery());

    // Apply sorting and pagination
    const recipes = await query
      .sort({ [sortBy]: sortOrder === 'DESC' ? -1 : 1 }) // Dynamic sorting
      .skip(skip) // Skip records for pagination
      .limit(limit) // Limit number of records
      .exec();

    // Return paginated result with metadata
    return {
      data: recipes,
      meta: {
        total, // Total number of matching records
        page, // Current page number
        limit, // Items per page
        totalPages: Math.ceil(total / limit), // Calculate total pages
      },
    };
  }

  async findOne(id: string): Promise<Recipe> {
    try {
      const recipe = await this.recipeModel.findById(id).exec();
      if (!recipe) {
        throw new NotFoundException(`Recipe with ID "${id}" not found`);
      }
      return recipe;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to fetch recipe: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<Recipe> {
    try {
      const updatedRecipe = await this.recipeModel
        .findByIdAndUpdate(id, updateRecipeDto, { new: true })
        .exec();

      if (!updatedRecipe) {
        throw new NotFoundException(`Recipe with ID "${id}" not found`);
      }
      return updatedRecipe;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to update recipe: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.recipeModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Recipe with ID "${id}" not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(
        `Failed to delete recipe: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }
}
