const { Router } = require("express")

const routes = Router()

const usersRouter = require("./users.routes")
const dishesRouter = require("./dishes.routes")
const ingredientsRouter = require("./ingredients.routes")

routes.use("/users", usersRouter)
routes.use("/dishes", dishesRouter)
routes.use("/ingredients", ingredientsRouter)

module.exports = routes