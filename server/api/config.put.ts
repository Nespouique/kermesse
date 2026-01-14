import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { isBorn, babyName, birthDate, weightKg, heightCm, sex } = body

  try {
    // Upsert config (insert or update)
    const config = await prisma.appConfig.upsert({
      where: { id: 1 },
      update: {
        isBorn: isBorn ?? false,
        babyName: babyName || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        weightKg: weightKg || null,
        heightCm: heightCm || null,
        sex: sex || null
      },
      create: {
        id: 1,
        isBorn: isBorn ?? false,
        babyName: babyName || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        weightKg: weightKg || null,
        heightCm: heightCm || null,
        sex: sex || null
      }
    })

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
    console.error('Error updating config:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la mise à jour de la configuration'
    })
  }
})
