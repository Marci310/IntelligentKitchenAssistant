const mongoose = require('mongoose');
const IngredientSchema = require('./ingredient');

const RecipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    shortDescription: String,
    ingredients: [IngredientSchema],
    missingIngredients: [IngredientSchema],
    instructions: [{
        type: String
    }],
    prepTime: String,
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: function(doc, ret) {
            ret.id = ret._id.toString();
            delete ret._id;
            return ret;
        }
    },
});

module.exports = RecipeSchema;