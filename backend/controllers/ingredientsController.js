const userModel = require('../models/user');
const aiService = require('../services/geminiApi');
const fs = require('fs-extra');

const getAllIngredients = async (req, res) => {
    try {
        const user = await userModel.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({error: "User not found"});
        }
        return res.status(200).json(user.inventory);

    } catch (error) {
        console.error("Error fetching ingredients:", error);
        return res.status(500).json({
            error: "Failed to fetch ingredients",
            message: error.message,
        });
    }
};

const getIngredientById = async (req, res) => {
    try {
        const user = await userModel.findById(req.session.userId);
        if (!user) return res.status(404).json({error: "User not found"});

        const ingredient = user.inventory.id(req.params.id);

        if (!ingredient) {
            return res.status(404).json({error: "Ingredient not found"});
        }
        return res.status(200).json(ingredient);
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
};

const addIngredient = async (req, res) => {
    try {
        if (!req.body.name && !req.file) {
            return res.status(400).json({
                error: "Invalid input",
                message: "Adjon meg adatokat vagy töltsön fel hangfájlt."
            });
        }

        const user = await userModel.findById(req.session.userId);
        if (!user) return res.status(404).json({error: "User not found"});

        let ingredientsToProcess = [];

        if (req.file) {
            console.log("Hang feldolgozása...");
            ingredientsToProcess = await aiService.parseIngredientsFromAudio(req.file.path);
            fs.removeSync(req.file.path);
        } else {
            ingredientsToProcess.push({
                name: req.body.name,
                quantity: req.body.quantity || 0,
                unit: req.body.unit || "db",
                category: req.body.category || "Other"
            });
        }

        for (const ingredient of ingredientsToProcess) {
            user.inventory.push(ingredient);
        }

        await user.save();
        return res.status(200).json(user.inventory);

    } catch (error) {
        console.error("Hiba a hozzávaló mentésekor:", error);
        if (req.file && fs.pathExistsSync(req.file.path)) {
            fs.removeSync(req.file.path);
        }

        return res.status(500).json({
            error: "Szerver hiba",
            message: error.message
        });
    }
};

const updateIngredient = async (req, res) => {
    try {
        const user = await userModel.findById(req.session.userId);
        if (!user) return res.status(404).json({error: "User not found"});

        const ingredient = user.inventory.id(req.params.id);
        if (!ingredient) {
            return res.status(404).json({error: "Ingredient not found"});
        }

        if (req.body.name) ingredient.name = req.body.name;
        if (req.body.quantity !== undefined) ingredient.quantity = req.body.quantity;
        if (req.body.unit) ingredient.unit = req.body.unit;
        if (req.body.category) ingredient.category = req.body.category;

        await user.save();
        return res.status(200).json(user.inventory);

    } catch (error) {
        console.error("Error updating ingredient:", error);
        return res.status(500).json({
            error: "Failed to update ingredient",
            message: error.message,
        });
    }
};

const deleteIngredient = async (req, res) => {
    try {
        const user = await userModel.findById(req.session.userId);
        if (!user) return res.status(404).json({error: "User not found"});

        user.inventory.pull(req.params.id);
        await user.save();

        return res.status(200).json(user.inventory);

    } catch (error) {
        console.error("Error deleting ingredient:", error);
        return res.status(500).json({
            error: "Failed to delete ingredient",
            message: error.message,
        });
    }
};

module.exports = {
    getAllIngredients,
    getIngredientById,
    addIngredient,
    updateIngredient,
    deleteIngredient
};