const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const IngredientSchema = require('./ingredient');
const RecipeSchema = require('./recipe');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [50, 'Username cannot exceed 50 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },

    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters'],
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },

    hashedPassword: {
        type: String,
        required: [true, 'Password is required']
    },

    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: {
            validator: function(value) {
                const eighteenYearsAgo = new Date();
                eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);
                return value <= eighteenYearsAgo;
            },
            message: 'User must be at least 18 years old'
        }
    },
    inventory: {
        type: [IngredientSchema],
        default: []
    },
    recipes: {
        type: [RecipeSchema],
        default: []
    }
}, {
    timestamps: true
}, {
});

userSchema.set('toJSON', {
    transform: function(doc, ret) {
        ret.userId = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.hashedPassword;
        return ret;
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.hashedPassword);
};

userSchema.statics.hashPassword = async function(password) {
    const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return bcrypt.hash(password, SALT_ROUNDS);
};


module.exports = mongoose.models.User || mongoose.model('User', userSchema);