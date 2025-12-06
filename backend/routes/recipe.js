const express = require('express');
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.get("/recipes", recipeController.getAllRecipes);
router.post("/recipes", upload.single('recipe_generation'), recipeController.generateRecipe);
router.get("/recipes/:id", recipeController.getRecipeById);
router.delete("/recipes/:id", recipeController.deleteRecipe);
router.post("/recipes/generate", recipeController.generateRecipe);

module.exports = router;