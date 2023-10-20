const knex = require("../database/knex")
const { hash, compare } = require("bcryptjs")
const AppError = require("../utils/AppError");

class UsersController {
  async create(request, response) {
    const { name, email, password } = request.body

    const [checkUserExist] = await knex("users").where({ email: email })

    if (checkUserExist) {
      throw new AppError("Este e-mail já está em uso.")
    }

    if (name.length < 3) {
      throw new AppError('Erro: Digite um nome válido!');
    }

    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regex.test(email)) {
      throw new AppError('Erro: Digite um email válido!');
    }

    if (password.length < 6) {
      throw new AppError('Erro: A senha deve ter pelo menos 6 dígitos!');
    }

    const hashedPassword = await hash(password, 8)

    const [id] = await knex("users").insert({
      name,
      email,
      password: hashedPassword
    })

    return response.status(201).json()
  }
}

module.exports = UsersController