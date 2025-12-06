import { z } from 'zod';

export const registerFormSchema = z.object({
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    fullName: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/, "Full name can only contain letters and spaces"),
    password: z.string().min(8).max(100),
    confirmPassword: z.string(),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
}).refine((data) => {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18;
}, {
    message: "You must be at least 18 years old",
    path: ["dateOfBirth"],
});

export const loginFormSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
});

export const ingredientFormSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Ingredient name is required").max(150, "Ingredient name must be at most 150 characters"),
    quantity: z.number().min(0, "Quantity cannot be negative"),
    unit: z.string().min(1, "Unit is required"),
    category: z.enum(['Vegetables', 'Fruits', 'Dairies', 'Meats', 'Pastries', 'Spices', 'Cans', 'Other']),
});

export const profileFormSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    fullName: z.string().min(1, "Full name is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
});