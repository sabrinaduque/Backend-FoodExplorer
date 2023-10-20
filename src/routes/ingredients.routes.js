const { Router } = require("express")

const IngredientsController = require("../controllers/IngredientsController")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

const ingredientsController = new IngredientsController()

const ingredientsRoutes = Router()


ingredientsRoutes.get("/:dish_id", ensureAuthenticated, ingredientsController.index)

module.exports = ingredientsRoutes