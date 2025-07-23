import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Recipe } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';

@Injectable()
export class RecipesService {
  private readonly TEXT_SCORE_THRESHOLD = 0.5;

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
    const {
      page = 1,
      limit = 10,
      search,
      textSearch,
      difficulty,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      maxPrepTime,
    } = queryDto;

    const skip = (page - 1) * limit;
    const query = this.recipeModel.find();

    // Apply text search if provided
    if (textSearch) {
      // Add text search query
      query.where({ $text: { $search: textSearch } });

      // Add score field and projection
      const projection = {
        score: { $meta: 'textScore' },
        name: 1,
        ingredients: 1,
        instructions: 1,
        prepTime: 1,
        cookTime: 1,
        difficulty: 1,
        servings: 1,
        createdAt: 1,
        updatedAt: 1,
        _id: 1,
      };

      query.select(projection);

      // Sort by text score
      query.sort({ score: { $meta: 'textScore' } });

      // Add score threshold using aggregation
      query.where({ score: { $gt: this.TEXT_SCORE_THRESHOLD } });
    }
    // Apply regular search if no text search is provided
    else if (search) {
      query.where('name', new RegExp(search, 'i'));
    }

    if (difficulty) {
      query.where('difficulty', difficulty);
    }

    if (maxPrepTime) {
      query.where('prepTime').lte(maxPrepTime);
    }

    // Apply default sorting if not using text search
    if (!textSearch) {
      query.sort({ [sortBy]: sortOrder === 'DESC' ? -1 : 1 });
    }

    // Debug: Log the query
    console.log('MongoDB Query:', query.getQuery());
    console.log('MongoDB Sort:', query.getOptions().sort);
    console.log('MongoDB Select:', query.getOptions().select);

    // Execute query with pagination
    const [recipes, total] = await Promise.all([
      query.skip(skip).limit(limit).exec(),
      this.recipeModel.countDocuments(query.getQuery()),
    ]);

    // Debug: Log the results
    console.log('Query Results:', recipes);

    return {
      data: recipes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
