const mongoose = require('mongoose');
const IngredientSchema = require('./ingredient');

const InverntorySchema = new mongoose.Schema({
    ...IngredientSchema.obj,
    category: {
        type: String,
        enum: ['Zöldség', 'Gyümölcs', 'Hús', 'Tejtermék', 'Egyéb'],
        default: 'Egyéb',
    },
    addedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Inventory', InverntorySchema);