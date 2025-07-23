import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type RecipeDocument = HydratedDocument<Recipe>;

@Schema({ timestamps: true })
export class Recipe extends Document {
  @ApiProperty({ description: 'The name of the recipe' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'List of ingredients required for the recipe' })
  @Prop({ type: [String], required: true })
  ingredients: string[];

  @ApiProperty({ description: 'Step by step instructions for the recipe' })
  @Prop({ required: true })
  instructions: string;

  @ApiProperty({ description: 'Preparation time in minutes' })
  @Prop({ required: true })
  prepTime: number;

  @ApiProperty({ description: 'Cooking time in minutes' })
  @Prop({ required: true })
  cookTime: number;

  @ApiProperty({ description: 'Difficulty level of the recipe' })
  @Prop({ default: 'medium' })
  difficulty: string;

  @ApiProperty({ description: 'Number of servings' })
  @Prop({ required: true })
  servings: number;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
