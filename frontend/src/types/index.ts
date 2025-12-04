export interface Ingredient {
    _id: string;
    name: string;
    quantity: string;
    unit?: string;
    category: string;
}

export interface Recipe {
    _id: string;
    title: string;
    ingredients: Ingredient[];
    missingIngredients: string[];
    instructions: string[];
    imageUrl?: string;
}

export interface Inventory {
    _id: string;
    category: string;
    ingredient: Ingredient;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    ingredients: Ingredient[];
    recipes: Recipe[];
}
