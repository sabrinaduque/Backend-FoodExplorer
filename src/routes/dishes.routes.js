const { Router } = require("express")
const multer = require("multer")
const uploadConfig = require("../configs/upload")

const DishesController = require("../controllers/DishesController")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")
const ensureUserIsAdmin = require("../middlewares/ensureUserIsAdmin")

const dishesRoutes = Router()
const upload = multer(uploadConfig.MULTER)

const dishesController = new DishesController()

dishesRoutes.use(ensureAuthenticated)

dishesRoutes.get("/",  dishesController.index)
dishesRoutes.get("/:id", dishesController.show)
dishesRoutes.post("/", ensureUserIsAdmin, upload.single("image"), dishesController.create)
dishesRoutes.delete("/:id", ensureUserIsAdmin, dishesController.delete)
dishesRoutes.put("/:id", ensureUserIsAdmin, upload.single("image"), dishesController.update)

module.exports = dishesRoutes