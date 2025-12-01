const mongoose = require('mongoose');
const IngredientSchema = require('./ingredient');

const RecipeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    ingredients: [IngredientSchema],
    missingIngredients: [IngredientSchema],
    instructions: [{
        type: String
    }],
    prepTime: String,
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recipe', RecipeSchema);