import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { password } = body
  const config = useRuntimeConfig()

  if (password !== config.adminPassword) {
    throw createError({
      statusCode: 401,
      message: 'Mot de passe incorrect',
    })
  }

  return { success: true }
})
