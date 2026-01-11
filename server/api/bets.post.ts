import { sql } from '../utils/db'

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
    // Insert bet
    const [bet] = await sql`
      INSERT INTO bets (participant_id, is_male, estimated_date, weight_kg, baby_first_name)
      VALUES (${participantId}, ${isMale}, ${estimatedDate}, ${weightKg}, ${babyFirstName || null})
      RETURNING *
    `

    // Insert avatar if provided
    if (avatar) {
      await sql`
        INSERT INTO avatars (bet_id, top_layer, middle_layer, bottom_layer)
        VALUES (${bet.id}, ${avatar.topLayer || null}, ${avatar.middleLayer || null}, ${avatar.bottomLayer || null})
      `
    }

    return bet
  } catch (error: any) {
    if (error.code === '23505') {
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
