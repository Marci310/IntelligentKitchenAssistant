const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
};

// GET current user
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update user
router.put('/', isAuthenticated, async (req, res) => {
    try {
        const { fullName, username, dateOfBirth } = req.body;
        const user = await User.findByIdAndUpdate(
            req.session.userId,
            { fullName, username, dateOfBirth },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user' });
    }
});

module.exports = router;
