import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { participantId, isMale, estimatedDate, weightKg, babyFirstName, avatar } = body

  if (!participantId || isMale === undefined || !estimatedDate || !weightKg) {
    throw createError({
      statusCode: 400,
      message: 'Données de pari incomplètes'
    })
  }

  try {
    // Insert bet with avatar in a transaction
    const bet = await prisma.bet.create({
      data: {
        participantId,
        isMale,
        estimatedDate: new Date(estimatedDate),
        weightKg,
        babyFirstName: babyFirstName || null,
        avatar: avatar ? {
          create: {
            topLayer: avatar.topLayer || null,
            middleLayer: avatar.middleLayer || null,
            bottomLayer: avatar.bottomLayer || null
          }
        } : undefined
      }
    })

    return bet
  } catch (error: any) {
    // Prisma unique constraint violation
    if (error.code === 'P2002') {
      throw createError({
        statusCode: 409,
        message: 'Vous avez déjà placé un pari'
      })
    }
    console.error('Error creating bet:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la création du pari'
    })
  }
})
