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
  @ApiParam({ name: 'id', description: 'Recipe ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns a recipe',
    type: Recipe,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recipe not found',
  })
  findOne(@Param('id') id: string): Promise<Recipe> {
    return this.recipesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a recipe' })
  @ApiParam({ name: 'id', description: 'Recipe ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recipe updated successfully',
    type: Recipe,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recipe not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
  ): Promise<Recipe> {
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a recipe' })
  @ApiParam({ name: 'id', description: 'Recipe ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Recipe deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recipe not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.recipesService.remove(id);
  }
}
