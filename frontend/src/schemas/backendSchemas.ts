import { z } from 'zod';

export const ingredientSchema = z.object({
    id: z.bigint(),
    name: z.string().max(150),
    quantity: z.number().min(0),
    unit: z.string(),
});

export const recipeSchema = z.object({
    id: z.bigint(),
    title: z.string(),
    shortDescription: z.string().optional(),
    ingredients: z.array(ingredientSchema),
    missingIngredients: z.array(ingredientSchema).optional(),
    instructions: z.string(),
    imageUrl: z.string().optional(),
});

export const inventoryItemSchema = z.object({
    id: z.bigint(),
    ingredient: ingredientSchema,
    category: z.enum(['Vegetables', 'Fruits', 'Dairies', 'Meats', 'Pastries', 'Spices', 'Cans', 'Other']),
});

export const userSchema = z.object({
    userId: z.bigint(),
    username: z.string(),
    fullName: z.string(),
    dateOfBirth: z.date(),
});