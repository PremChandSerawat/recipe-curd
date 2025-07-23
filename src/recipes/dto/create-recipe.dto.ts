import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsInt,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';

enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export class CreateRecipeDto {
  @ApiProperty({ description: 'The name of the recipe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'List of ingredients required for the recipe' })
  @IsArray()
  @IsString({ each: true })
  ingredients: string[];

  @ApiProperty({ description: 'Step by step instructions for the recipe' })
  @IsString()
  instructions: string;

  @ApiProperty({ description: 'Preparation time in minutes' })
  @IsInt()
  @Min(1)
  prepTime: number;

  @ApiProperty({ description: 'Cooking time in minutes' })
  @IsInt()
  @Min(0)
  cookTime: number;

  @ApiProperty({
    description: 'Difficulty level of the recipe',
    enum: DifficultyLevel,
  })
  @IsEnum(DifficultyLevel)
  @IsOptional()
  difficulty?: string;

  @ApiProperty({ description: 'Number of servings' })
  @IsInt()
  @Min(1)
  servings: number;
}
