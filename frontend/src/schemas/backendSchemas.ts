import { z } from 'zod';

export const ingredientSchema = z.object({
    id: z.string(),
    name: z.string().max(150),
    quantity: z.union([
        z.string().transform((str) => parseFloat(str)),
        z.number()
    ]).pipe(z.number().min(0)),
    unit: z.string(),
    category: z.enum(['Vegetables', 'Fruits', 'Dairies', 'Meats', 'Pastries', 'Spices', 'Cans', 'Other']),
});

export const recipeSchema = z.object({
    id: z.string(),
    title: z.string(),
    shortDescription: z.string().optional(),
    ingredients: z.array(ingredientSchema),
    missingIngredients: z.array(ingredientSchema).optional(),
    instructions: z.array(z.string()),
    imageUrl: z.string().optional(),
    createdAt: z.string().optional(),
});

export const userSchema = z.object({
    userId: z.string(),
    username: z.string(),
    fullName: z.string(),
    dateOfBirth: z.string().transform((str) => new Date(str)),
});