import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { QueryRecipeDto } from './dto/query-recipe.dto';
import { Recipe } from './entities/recipe.entity';
import { IsMongoId, IsNotEmpty } from 'class-validator';

// Parameter validation class
class RecipeIdParam {
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}

@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new recipe' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Recipe created successfully',
    type: Recipe,
  })
  create(@Body() createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    return this.recipesService.create(createRecipeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all recipes with pagination and filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns paginated recipes',
  })
  findAll(@Query() queryDto: QueryRecipeDto) {
    return this.recipesService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recipe by id' })
  @ApiParam({ name: 'id', description: 'Recipe ID', required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a recipe',
    type: Recipe,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recipe not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid recipe ID format',
  })
  findOne(@Param() params: RecipeIdParam): Promise<Recipe> {
    return this.recipesService.findOne(params.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recipe' })
  @ApiParam({ name: 'id', description: 'Recipe ID', required: true })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recipe updated successfully',
    type: Recipe,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recipe not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid recipe ID format',
  })
  update(
    @Param() params: RecipeIdParam,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ): Promise<Recipe> {
    return this.recipesService.update(params.id, updateRecipeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a recipe' })
  @ApiParam({ name: 'id', description: 'Recipe ID', required: true })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Recipe deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recipe not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid recipe ID format',
  })
  async remove(@Param() params: RecipeIdParam): Promise<void> {
    await this.recipesService.remove(params.id);
  }
}
