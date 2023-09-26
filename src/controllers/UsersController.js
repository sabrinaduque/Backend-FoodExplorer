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

    if (!email.includes("@", ".") || !email.includes(".")) {
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

    response.status(201).json()
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body
    const { id } = request.params

    const [user] = await knex("users").where({ id })

    if (!user) {
      throw new AppError("Usuário não encontrado")
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    const [userWithUpdateEmail] = await knex("users").where({ email })

    if (userWithUpdateEmail && userWithUpdateEmail.id !== user.id) {
      throw new AppError("Este e-mail já está em uso.")
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password)

      if (!checkOldPassword) {
        throw new AppError("A senha antiga não confere.")
      }

      user.password = await hash(password, 8)
    }

    await knex("users")
      .where({ id: id })
      .update({
        name: user.name,
        email: user.email,
        password: user.password,
        updated_at: knex.fn.now(),
      })

    return response.json()
  }

}

module.exports = UsersController