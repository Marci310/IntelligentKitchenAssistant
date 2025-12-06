const Recipe = require('../models/Recipe');
const User = require('../models/User');
const aiService = require('../services/geminiApi');
const fs = require('fs-extra');


const getAllRecipes = async (req, res) => {
    User.findById(req.session.userId)
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    error: "User not found",
                    message: "The specified user does not exist"
                });
            }
            let recipes = []
            return res.status(200).json(user.recipes);
        }).catch(error => {
        console.error("Error fetching recipes:", error);
        return res.status(500).json({
            error: "Failed to fetch recipes",
            message: error.message,
        });
    });
};

const getRecipeById = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({
                error: "User not found",
                message: "The specified user does not exist"
            });
        }

        const recipe = user.recipes.id(req.params.id);
        if (!recipe) {
            return res.status(404).json({
                error: "Recipe not found",
                message: "The specified recipe does not exist"
            });
        }

        return res.status(200).json(recipe);
    } catch (error) {
        console.error("Error fetching recipe:", error);
        return res.status(500).json({
            error: "Failed to fetch recipe",
            message: error.message,
        });
    }
};

const deleteRecipe = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({
                error: "User not found",
                message: "The specified user does not exist"
            });
        }

        const recipe = user.recipes.id(req.params.id);
        if (!recipe) {
            return res.status(404).json({
                error: "Recipe not found",
                message: "The specified recipe does not exist"
            });
        }

        recipe.deleteOne();
        await user.save();

        return res.status(200).json({
            message: "Recipe deleted successfully",
            recipe: recipe
        });
    } catch (error) {
        console.error("Error deleting recipe:", error);
        return res.status(500).json({
            error: "Failed to delete recipe",
            message: error.message,
        });
    }
};
const getIngredientsData = async (userId) => {
    const user = await User.findById(userId);
    return user ? user.inventory : [];
};

const generateRecipe = async (req, res) => {
    if(!req.file && !req.body.instructions) {
        return res.status(400).json({
            error: "No input provided",
            message: "Please provide either an audio file or text instructions to generate a recipe."
        });
    }

    try {
        const ingredients = await getIngredientsData(req.session.userId);
        let recipeData;
        if(req.file) {
            recipeData = await aiService.generateRecipe(req.file.path, ingredients, true);
            fs.removeSync(req.file.path);
        } else {
            recipeData = await aiService.generateRecipe(req.body.instructions, ingredients);
        }

        if (!recipeData) {
            throw new Error("AI service returned no data");
        }

        if (recipeData && recipeData.imagePrompt) {
            const base64Image = await aiService.generateImage(recipeData.imagePrompt);

            if (base64Image) {
                recipeData.imageURL = aiService.saveImageToFile(base64Image);
            }
        }

        const user = await User.findById(req.session.userId);
        const transformToIngredients = (stringArray) => {
            if (!Array.isArray(stringArray)) return [];
            return stringArray.map(str => ({
                name: str,
                quantity: 0,
                unit: 'db',
                category: 'Other'
            }));
        };

        user.recipes.push({
            title: recipeData.title || 'Untitled Recipe',
            shortDescription: recipeData.shortDescription || '',
            ingredients: recipeData.ingredients || [],
            missingIngredients: recipeData.missingIngredients || [],
            instructions: recipeData.instructions || [],
            imageUrl: recipeData.imageURL || ''
        });
        await user.save();

        const savedRecipe = user.recipes[user.recipes.length - 1];
        return res.status(200).json(savedRecipe);
    } catch (error) {
        console.error("Error generating recipe:", error);
        return res.status(500).json({
            error: "Failed to generate recipe",
            message: error.message,
        });
    }
};
module.exports = {
    getAllRecipes,
    getRecipeById,
    deleteRecipe,
    generateRecipe,
}
