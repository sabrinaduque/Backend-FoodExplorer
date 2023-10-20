const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const DiskStorage = require("../providers/DiskStorage")

class DishesController {
  async create(request, response) {
    const { title, description, ingredients, price, category } = JSON.parse(request.body.data)

    const checkDishAlreadyExists = await knex("dishes").where({ title }).first()

    if (checkDishAlreadyExists) {
      throw new AppError("Este prato já existe no cardápio!")
    }

    const diskStorage = new DiskStorage()
    const imageFileName = request.file.filename
    const filename = await diskStorage.saveFile(imageFileName)

    const [dish_id] = await knex("dishes").insert({
      image: filename,
      title,
      category,
      description,
      price,
    })

    const hasOnlyOneIngredient = ingredients.length === 1

    let dishIngredient

    if (hasOnlyOneIngredient) {
      dishIngredient = {
        name: ingredients[0],
        dish_id,
      }
    } else if (ingredients.length > 1) {
      dishIngredient = ingredients.map((name) => {
        return {
          name,
          dish_id,
        }
      })
    }

    await knex("ingredients").insert(dishIngredient)

    return response.status(201).json("Prato criado com sucesso")
  }

  async update(request, response) {
    const { title, description, ingredients, price, category, image } = JSON.parse(request.body.data)
    const { id } = request.params

    const dish = await knex("dishes").where({ id }).first()

    if (dish.title !== title) {
      const checkDishAlreadyExists = await knex("dishes")
        .where({ title })
        .first()
      if (checkDishAlreadyExists) {
        throw new AppError("Este prato já existe no cardápio!", 400)
      }
    }

    const diskStorage = new DiskStorage()

    const imageFileName = request.file.filename

    if (dish.image) {
      await diskStorage.deleteFile(dish.image)
    }

    const filename = await diskStorage.saveFile(imageFileName)

    dish.image = image ?? filename
    dish.title = title ?? dish.title
    dish.description = description ?? dish.description
    dish.category = category ?? dish.category
    dish.price = price ?? dish.price

    await knex("dishes").where({ id }).update(dish)

    const hasOnlyOneIngredient = ingredients.length === 1

    let dishIngredient

    if (hasOnlyOneIngredient) {
      dishIngredient = {
        name: ingredients[0],
        dish_id: dish.id,
      }
    } else if (ingredients.length > 1) {
      dishIngredient = ingredients.map((name) => {
        return {
          dish_id: dish.id,
          name,
        }
      })
    }

    await knex("ingredients").where({ dish_id: id }).delete()
    await knex("ingredients").where({ dish_id: id }).insert(dishIngredient)

    return response.status(201).json("Prato atualizado com sucesso")
  }

  async show(request, response) {
    const { id } = request.params

    const dishes = await knex("dishes").where({ id }).first()
    const ingredients = await knex("ingredients")
      .where({ dish_id: id })
      .orderBy("name")

    return response.json({
      ...dishes,
      ingredients,
    })
  }

  async delete(request, response) {
    const { id } = request.params

    await knex("dishes").where({ id }).delete()

    return response.status(201).json()
  }

  async index(request, response) {
    const { title, ingredients } = request.query

    let dishes

    if (ingredients) {
      const filterIngredients = ingredients
        .split(",")
        .map((ingredient) => ingredient.trim())

      dishes = await knex("ingredients")
        .select([
          "dishes.id",
          "dishes.title",
          "dishes.description",
          "dishes.category",
          "dishes.price",
        ])
        .whereLike("dishes.title", `%${title}%`)
        .whereIn("name", filterIngredients)
        .innerJoin("dishes", "dishes.id", "ingredients.dish_id")
        .groupBy("dishes.id")
        .orderBy("dishes.title")
    } else {
      dishes = await knex("dishes")
        .whereLike("title", `%${title}%`)
        .orderBy("title")
    }

    const dishesIngredient = await knex("ingredients")
    const dishWithIngredients = dishes.map((dish) => {
      const dishIngredient = dishesIngredient.filter(
        (ingredients) => ingredients.dish_id === dish.id
      )
      return {
        ...dish,
        ingredients: dishIngredient,
      }
    })

    return response.status(201).json(dishWithIngredients)
  }
}

module.exports = DishesController
