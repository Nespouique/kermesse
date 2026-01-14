import { prisma } from '../utils/prisma'

export default defineEventHandler(async () => {
  try {
    const config = await prisma.appConfig.findUnique({
      where: { id: 1 }
    })

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

    // Transform to snake_case for frontend compatibility
    return {
      id: config.id,
      is_born: config.isBorn,
      baby_name: config.babyName,
      birth_date: config.birthDate,
      weight_kg: config.weightKg,
      height_cm: config.heightCm,
      sex: config.sex
    }
  } catch (error) {
    console.error('Error fetching config:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la récupération de la configuration'
    })
  }
})
