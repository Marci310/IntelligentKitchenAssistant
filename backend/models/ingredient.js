const mongoose = require('mongoose');

const IngredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ingredient name is required'],
        trim: true
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity must be non-negative']
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        trim: true
    },
    category: {
        type: String,
        enum: ['Vegetables', 'Fruits', 'Dairies', 'Meats', 'Pastries', 'Spices', 'Cans', 'Other'],
        default: 'Other',
    },
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

module.exports = IngredientSchema;
