const { Router } = require("express")

const UsersController = require("../controllers/UsersController")

const usersRoutes = Router()

function myMiddleware(request, response, next) {
  // if (!request.body.isAdmin) {
  //   return response.json({ message: "user unauthorized" })
  // }

  next()
}

const usersController = new UsersController
// fazer desse jeito para que pegue todas as rotas de user
// usersRoutes.use(myMiddleware)
usersRoutes.post("/", myMiddleware, usersController.create)

module.exports = usersRoutes