const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientsController');
const multer = require('multer');

router.get('/ingredients', ingredientController.getAllIngredients);
router.post('/ingredients',multer.single('ingredients-list'), ingredientController.addIngredient);
router.get('/ingredients/:id', ingredientController.getIngredientById);
router.delete('/ingredients/:id', ingredientController.deleteIngredient);

module.exports = router;
