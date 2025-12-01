const userModel = require('../models/user');
const aiService = require('../services/geminiApi');
const fs = require('fs-extra');
const getAllIngredients = async (req, res) => {
    try {
        const user = await userModel.findById(req.session.userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
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
        if (!user) return res.status(404).json({ error: "User not found" });

        const ingredient = user.inventory.id(req.params.id);

        if (!ingredient) {
            return res.status(404).json({ error: "Ingredient not found" });
        }
        return res.status(200).json(ingredient);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateUserInventoryLogic = async (userId, newIngredients) => {
    const user = await userModel.findById(userId);
    if (!user) throw new Error("User not found");

    for (const newItem of newIngredients) {
        const existingItemIndex = user.inventory.findIndex(item =>
            (newItem.id && item._id.toString() === newItem.id) ||
            (item.name && item.name.toLowerCase() === newItem.name.toLowerCase())
        );

        if (existingItemIndex > -1) {
            user.inventory[existingItemIndex].quantity = newItem.quantity;
            user.inventory[existingItemIndex].unit = newItem.unit;
            if (newItem.category) user.inventory[existingItemIndex].category = newItem.category;
        } else {
            user.inventory.push({
                name: newItem.name,
                quantity: newItem.quantity,
                unit: newItem.unit,
                category: newItem.category || 'Egyéb'
            });
        }
    }

    const savedUser = await user.save();
    return savedUser.inventory;
};

const addIngredient = async (req, res) => {
    try {
        if ((!req.body.name) && !req.file) {
            return res.status(400).json({
                error: "Invalid input",
                message: "Adjon meg adatokat vagy töltsön fel hangfájlt."
            });
        }

        let ingredientsToProcess = [];

        if (req.file) {
            console.log("Hang feldolgozása...");
            ingredientsToProcess = await aiService.parseIngredientsFromAudio(req.file.path);
            fs.unlinkSync(req.file.path);
        } else {
            ingredientsToProcess.push({
                name: req.body.name,
                quantity: req.body.quantity || "",
                unit: req.body.unit || "",
                category: req.body.category || "Egyéb",
                id: req.body.id
            });
        }


        const updatedInventory = await updateUserInventoryLogic(req.session.userId, ingredientsToProcess);

        return res.status(200).json(updatedInventory);

    } catch (error) {
        console.error("Hiba a hozzávaló mentésekor:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            error: "Szerver hiba",
            message: error.message
        });
    }
};

const deleteIngredient = async (req, res) => {
    try {
        const updatedUser = await userModel.findByIdAndUpdate(
            req.session.userId,
            {
                $pull: { inventory: { _id: req.params.id } }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json(updatedUser.inventory);

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
    deleteIngredient
};