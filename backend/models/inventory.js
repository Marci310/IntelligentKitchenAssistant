const mongoose = require('mongoose');
const ingredientSchema = require('./ingredient');

const inventorySchema = new mongoose.Schema({
    ...ingredientSchema.obj,
    addedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = inventorySchema;
