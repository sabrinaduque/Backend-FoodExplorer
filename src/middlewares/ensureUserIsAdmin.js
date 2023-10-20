const authConfig = require("../configs/auth")
const { decode } = require("jsonwebtoken")

async function ensureUserIsAdmin(request, response, next) {
  const bearer = request.headers.authorization
  const [type, token] = bearer.split(' ')

  const { secret } = authConfig.jwt

  if (!token) {
    return response.status(401).json({ message: 'Token necessário' })
  }

  try {
    const payload = decode(token, secret)

    payload.isAdmin = !!+payload.isAdmin

    if (!payload.isAdmin) {
      return response.status(403).json('Acesso negado')
    }

    next()
  } catch {
    return response.status(403).json({ message: 'Token inválido' })
  }
}

module.exports = ensureUserIsAdmin;