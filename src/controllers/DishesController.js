const knex = require("../database/knex")
const AppError = require('../utils/AppError');

class DishesController {
  async create(request, response) {
    const { title, description, ingredients, price, category } = request.body

    const checkDishAlreadyExists = await knex("dishes").where({ title }).first();

    if (checkDishAlreadyExists) {
      throw new AppError("Este prato já existe no cardápio!")
    }

    const [dish_id] = await knex("dishes").insert({
      title,
      category,
      description,
      price
    })

    const hasOnlyOneIngredient = typeof (ingredients) === "string";

    let dishIngredient

    if (hasOnlyOneIngredient) {
      dishIngredient = {
        name: ingredients,
        dish_id
      }
    } else if (ingredients.length > 1) {
      dishIngredient = ingredients.map(name => {
        return {
          name,
          dish_id
        }
      });
    }

    await knex("ingredients").insert(dishIngredient)

    response.json()
  }

  async update(request, response) {
    const { title, description, ingredients, price, category } = request.body
    const { id } = request.params;

    const dish = await knex("dishes").where({ id }).first()

    if (dish.title !== title) {
      const checkDishAlreadyExists = await knex("dishes").where({ title }).first();
      if (checkDishAlreadyExists) {
        throw new AppError("Este prato já existe no cardápio!")
      }
    }

    dish.title = title ?? dish.title;
    dish.description = description ?? dish.description;
    dish.category = category ?? dish.category;
    dish.price = price ?? dish.price;

    await knex("dishes").where({ id }).update(dish);

    const hasOnlyOneIngredient = typeof (ingredients) === "string";

    let dishIngredient

    if (hasOnlyOneIngredient) {
      dishIngredient = {
        name: ingredients,
        dish_id: dish.id
      }
    } else if (ingredients.length > 1) {
      dishIngredient = ingredients.map(name => {
        return {
          name: ingredients,
          dish_id: dish.id
        }
      });
    }

    await knex("ingredients").where({ dish_id: id }).delete()
    await knex("ingredients").where({ dish_id: id }).insert(dishIngredient)

    response.json()

  }

  async show(request, response) {
    const { id } = request.params

    const dishes = await knex("dishes").where({ id }).first()
    const ingredients = await knex("ingredients").where({ dish_id: id }).orderBy("name")

    return response.json({
      ...dishes,
      ingredients
    })
  }

  async delete(request, response) {
    const { id } = request.params

    await knex("dishes").where({ id }).delete()

    return response.json()
  }

  async index(request, response) {
    const { title, ingredients } = request.query;

    let dishes;

    if (ingredients) {
      const filterIngredients = ingredients.split(',').map(ingredient => ingredient.trim());

      dishes = await knex("ingredients")
        .select([
          "dishes.id",
          "dishes.title",
          "dishes.description",
          "dishes.category",
          "dishes.price"
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
    const dishWithIngredients = dishes.map(dish => {
      const dishIngredient = dishesIngredient.filter(ingredients => ingredients.dishes_id === dish.id)
      return {
        ...dish,
        ingredients: dishIngredient
      }
    })

    return response.json(dishWithIngredients)
  }
}

module.exports = DishesController