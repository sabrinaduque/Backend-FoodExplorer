const { Router } = require("express")

const IngredientsController = require("../controllers/IngredientsController")

const ingredientsController = new IngredientsController()

const ingredientsRoutes = Router()


ingredientsRoutes.get("/:dish_id", ingredientsController.index)

module.exports = ingredientsRoutes