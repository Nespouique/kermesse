import { sql } from '../utils/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const orderBy = query.orderBy as string || 'created_at'
  const limit = parseInt(query.limit as string) || 300

  try {
    // Dynamic ordering based on query params
    let bets
    if (orderBy === 'estimated_date') {
      bets = await sql`
        SELECT * FROM v_bets
        ORDER BY estimated_date ASC, is_male DESC, weight_kg ASC
        LIMIT ${limit}
      `
    } else {
      bets = await sql`
        SELECT * FROM v_bets
        ORDER BY created_at ASC
        LIMIT ${limit}
      `
    }
    return bets
  } catch (error) {
    console.error('Error fetching bets:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération des paris'
    })
  }
})
