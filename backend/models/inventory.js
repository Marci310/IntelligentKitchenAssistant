const mongoose = require('mongoose');
const IngredientSchema = require('./ingredient');

const InventorySchema = new mongoose.Schema({
    ...IngredientSchema.obj,
    category: {
        type: String,
        enum: ['Vegetables', 'Fruits', 'Dairies', 'Meats', 'Pastries', 'Spices', 'Cans', 'Other'],
        default: 'Egyéb',
    },
    addedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Inventory', InventorySchema);