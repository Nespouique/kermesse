import { prisma } from '../utils/prisma'

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
    const participant = await prisma.participant.create({
      data: {
        email: normalizedEmail,
        firstName,
        lastName
      },
      select: { id: true }
    })
    return { id: participant.id }
  } catch (error: any) {
    // Prisma unique constraint violation
    if (error.code === 'P2002') {
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
