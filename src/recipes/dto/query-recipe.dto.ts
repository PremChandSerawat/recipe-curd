import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class QueryRecipeDto {
  @ApiProperty({ required: false, description: 'Page number (1-based)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Number of items per page' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiProperty({
    required: false,
    description: 'Regular search term for recipe name',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    required: false,
    description:
      'Full-text search across name, ingredients, and instructions (minimum relevance score: 0.5)',
  })
  @IsString()
  @IsOptional()
  textSearch?: string;

  @ApiProperty({ required: false, description: 'Filter by difficulty level' })
  @IsString()
  @IsOptional()
  difficulty?: string;

  @ApiProperty({ required: false, description: 'Sort by field' })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiProperty({ required: false, enum: SortOrder, description: 'Sort order' })
  @IsEnum(SortOrder)
  @IsOptional()
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiProperty({
    required: false,
    description: 'Maximum preparation time in minutes',
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  maxPrepTime?: number;
}
