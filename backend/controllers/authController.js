const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

const validatePasswordComplexity = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    const errors = [];

    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters`);
    }
    if (!hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumber) {
        errors.push('Password must contain at least one number');
    }

    return errors;
};

const register = async (req, res, next) => {
    try {
        const { username, fullName, password, dateOfBirth } = req.body;

        if (!username || !fullName || !password || !dateOfBirth) {
            throw new AppError(
                'All fields are required (username, fullName, password, dateOfBirth)',
                400,
                'VALIDATION_ERROR'
            );
        }

        const passwordErrors = validatePasswordComplexity(password);
        if (passwordErrors.length > 0) {
            throw new AppError(
                'Password does not meet complexity requirements',
                400,
                'VALIDATION_ERROR',
                passwordErrors
            );
        }

        const hashedPassword = await User.hashPassword(password);

        const user = await User.create({
            username: username.trim(),
            fullName: fullName.trim(),
            hashedPassword,
            dateOfBirth: new Date(dateOfBirth)
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                userId: user._id,
                username: user.username,
                fullName: user.fullName,
                dateOfBirth: user.dateOfBirth
            }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        req.session.userId = user._id;

        res.json({
            user: {
                userId: user._id,
                username: user.username,
                fullName: user.fullName,
                dateOfBirth: user.dateOfBirth
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
};


module.exports = {
    register,
    login,
    logout
}