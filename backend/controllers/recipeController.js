const Recipe = require('../models/Recipe');
const User = require('../models/User');
const aiService = require('../services/geminiApi');
const fs = require('fs-extra');


const getAllRecipes = async (req, res) => {
    User.findById(req.session.userId)
        .populate('recipe', 'title')
        .then(recipes => {
            return res.status(200).json(recipes.recipe);
        }).catch(error => {
        console.error("Error fetching recipes:", error);
        return res.status(500).json({
            error: "Failed to fetch recipes",
            message: error.message,
        });
    });
};

const getRecipeById = async (req, res) => {
    Recipe.findById(req.params.id)
        .then(recipe => {
                if (!recipe) {
                    return res.status(404).json({
                        error: "Recipe not found",
                        message: "The specified recipe does not exist"
                    });
                }
                return res.status(200).json(recipe);
            }
        ).catch(error => {
        console.error("Error fetching recipe:", error);
        return res.status(500).json({
            error: "Failed to fetch recipe",
            message: error.message,
        });
    });
}

const deleteRecipe = async (req, res) => {
    Recipe.findByIdAndDelete(req.params.id)
        .then(deletedRecipe => {
            if (!deletedRecipe) {
                return res.status(404).json({
                    error: "Recipe not found",
                    message: "The specified recipe does not exist"
                });
            }
            return res.status(200).json({
                message: "Recipe deleted successfully",
                recipe: deletedRecipe
            });
        }).catch(error => {
        console.error("Error deleting recipe:", error);
        return res.status(500).json({
            error: "Failed to delete recipe",
            message: error.message,
        });
    });
}
const getIngredientsData = async (userId) => {
    const user = await User.findById(userId);
    return user ? user.inventory : [];
};

const getIngredients = async (req, res) => {
    try {
        const ingredients = await getIngredientsData(req.session.userId);
        return res.status(200).json(ingredients);
    } catch (error) {
        console.error("Error fetching ingredients:", error);
        return res.status(500).json({
            error: "Failed to fetch ingredients",
            message: error.message,
        });
    }

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
            recipeData = await aiService.generateRecipe(req.file.path, ingredients, isAudio=true);
            fs.removeSync(req.file.path);
        } else {
            recipeData = await aiService.generateRecipe(req.body.instructions, ingredients);
        }

        if (recipeData && recipeData.imagePrompt) {
            const base64Image = await aiService.generateImage(recipeData.imagePrompt);

            if (base64Image) {
                recipeData.imageURL = aiService.saveImageToFile(base64Image);
            }
        }
        const newRecipe = new Recipe({
            user: req.session.userId,
            title: recipeData.title,
            shortDescription: recipeData.shortDescription,
            ingredients: recipeData.ingredients,
            missingIngredients: recipeData.missingIngredients,
            instructions: recipeData.instructions,
            imageURL: recipeData.imageURL,
        });
        const savedRecipe = await newRecipe.save();
        await User.findByIdAndUpdate(req.session.userId, {
            $push: {recipe: savedRecipe._id}
        });
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
