import { sql } from '../utils/db'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { isBorn, babyName, birthDate, weightKg, heightCm, sex } = body

  try {
    // Upsert config (insert or update)
    const [config] = await sql`
      INSERT INTO app_config (id, is_born, baby_name, birth_date, weight_kg, height_cm, sex)
      VALUES (1, ${isBorn ?? false}, ${babyName || null}, ${birthDate || null}, ${weightKg || null}, ${heightCm || null}, ${sex || null})
      ON CONFLICT (id) DO UPDATE SET
        is_born = EXCLUDED.is_born,
        baby_name = EXCLUDED.baby_name,
        birth_date = EXCLUDED.birth_date,
        weight_kg = EXCLUDED.weight_kg,
        height_cm = EXCLUDED.height_cm,
        sex = EXCLUDED.sex
      RETURNING *
    `

    return config
  } catch (error) {
    console.error('Error updating config:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors de la mise à jour de la configuration'
    })
  }
})
