import { sql } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, firstName, lastName } = body

  if (!email || !firstName || !lastName) {
    throw createError({
      statusCode: 400,
      message: 'Email, prénom et nom sont requis'
    })
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const [participant] = await sql`
      INSERT INTO participants (email, first_name, last_name)
      VALUES (${normalizedEmail}, ${firstName}, ${lastName})
      RETURNING id
    `
    return { id: participant.id }
  } catch (error: any) {
    if (error.code === '23505') {
      throw createError({
        statusCode: 409,
        message: 'Email déjà utilisé'
      })
    }
    console.error('Error creating participant:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la création du participant'
    })
  }
})
