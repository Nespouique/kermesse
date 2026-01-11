import { sql } from '../utils/db'

export default defineEventHandler(async () => {
  try {
    const [config] = await sql`
      SELECT * FROM app_config WHERE id = 1
    `

    if (!config) {
      // Return default config if none exists
      return {
        id: 1,
        is_born: false,
        baby_name: null,
        birth_date: null,
        weight_kg: null,
        height_cm: null,
        sex: null
      }
    }

    return config
  } catch (error) {
    console.error('Error fetching config:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération de la configuration'
    })
  }
})
