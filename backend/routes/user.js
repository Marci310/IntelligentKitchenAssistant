const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.put('/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({
                error: "User not found",
                message: "The specified user does not exist"
            });
        }

        const updatableFields = ["fullName", "username", "dateOfBirth"];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        await user.save();

        const updatedUser = user.toObject();
        delete updatedUser.hashedPassword;

        res.json(updatedUser);

    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            error: "Failed to update user",
            message: error.message,
        });
    }
});

module.exports = router;