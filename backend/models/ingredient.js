const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ingredient name is required'],
    },
    quantity: {
        type: String,
        required: [true, 'Quantity is required'],
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
    },
});
module.exports = ingredientSchema;