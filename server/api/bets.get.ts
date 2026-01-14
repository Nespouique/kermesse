import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const orderBy = query.orderBy as string || 'created_at'
  const limit = parseInt(query.limit as string) || 300

  try {
    // Fetch bets with participant and avatar relations (replaces v_bets view)
    const bets = await prisma.bet.findMany({
      take: limit,
      orderBy: orderBy === 'estimated_date' 
        ? [
            { estimatedDate: 'asc' },
            { isMale: 'desc' },
            { weightKg: 'asc' }
          ]
        : { createdAt: 'asc' },
      include: {
        participant: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        avatar: {
          select: {
            topLayer: true,
            middleLayer: true,
            bottomLayer: true
          }
        }
      }
    })

    // Transform to match v_bets view format for frontend compatibility
    return bets.map(bet => ({
      id: bet.id,
      participant_id: bet.participantId,
      is_male: bet.isMale,
      estimated_date: bet.estimatedDate,
      weight_kg: bet.weightKg,
      baby_first_name: bet.babyFirstName,
      created_at: bet.createdAt,
      score: bet.score,
      rang_date: bet.rangDate,
      rang_poids: bet.rangPoids,
      rang_sexe: bet.rangSexe,
      email: bet.participant.email,
      participant_first_name: bet.participant.firstName,
      participant_last_name: bet.participant.lastName,
      top_layer: bet.avatar?.topLayer || null,
      middle_layer: bet.avatar?.middleLayer || null,
      bottom_layer: bet.avatar?.bottomLayer || null
    }))
  } catch (error) {
    console.error('Error fetching bets:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des paris'
    })
  }
})
