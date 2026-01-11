import { sql } from '../utils/db'

interface BetForScoring {
  id: string
  estimated_date: string
  weight_kg: number
  is_male: boolean
  created_at: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { birthDate, weightKg, sex } = body

  if (!birthDate || !weightKg || !sex) {
    throw createError({
      statusCode: 400,
      message: 'Date de naissance, poids et sexe requis'
    })
  }

  try {
    // Récupérer tous les paris
    const bets = await sql<BetForScoring[]>`
      SELECT id, estimated_date, weight_kg, is_male, created_at
      FROM bets
      ORDER BY created_at ASC
    `

    if (bets.length === 0) {
      return { message: 'Aucun pari à scorer', count: 0 }
    }

    const actualDate = new Date(birthDate)
    const actualWeightGrams = weightKg * 1000

    // Calculer les écarts bruts pour chaque participant
    const betsWithDiffs = bets.map((bet) => {
      const betDate = new Date(bet.estimated_date)
      const ecartDate = Math.abs(
        Math.floor((actualDate.getTime() - betDate.getTime()) / (1000 * 60 * 60 * 24))
      )

      const betWeightGrams = Number(bet.weight_kg) * 1000
      const ecartPoidsExact = Math.abs(actualWeightGrams - betWeightGrams)
      const ecartPoids = Math.round(ecartPoidsExact / 100)

      const betSex = bet.is_male ? 'M' : 'F'
      const sexeCorrect = betSex === sex

      return {
        id: bet.id,
        ecartDate,
        ecartPoids,
        sexeCorrect,
        createdAt: new Date(bet.created_at).getTime(),
      }
    })

    // Classement sur la date
    const sortedByDate = [...betsWithDiffs].sort((a, b) => a.ecartDate - b.ecartDate)
    const rangDate: Record<string, number> = {}
    let currentRank = 1
    for (let i = 0; i < sortedByDate.length; i++) {
      const current = sortedByDate[i]
      const previous = sortedByDate[i - 1]
      if (current && i > 0 && previous && current.ecartDate !== previous.ecartDate) {
        currentRank = i + 1
      }
      if (current) {
        rangDate[current.id] = currentRank
      }
    }

    // Classement sur le poids
    const sortedByWeight = [...betsWithDiffs].sort((a, b) => a.ecartPoids - b.ecartPoids)
    const rangPoids: Record<string, number> = {}
    currentRank = 1
    for (let i = 0; i < sortedByWeight.length; i++) {
      const current = sortedByWeight[i]
      const previous = sortedByWeight[i - 1]
      if (current && i > 0 && previous && current.ecartPoids !== previous.ecartPoids) {
        currentRank = i + 1
      }
      if (current) {
        rangPoids[current.id] = currentRank
      }
    }

    // Classement sur le sexe
    const rangSexe: Record<string, number> = {}
    const N = betsWithDiffs.length
    const K = betsWithDiffs.filter((bet) => bet.sexeCorrect).length
    const rangIncorrect = K + 1
    for (const bet of betsWithDiffs) {
      rangSexe[bet.id] = bet.sexeCorrect ? 1 : rangIncorrect
    }

    // Calcul du score final
    const betsWithScores = betsWithDiffs.map((bet) => ({
      id: bet.id,
      score:
        (K + 2) * (N + 1) * (rangDate[bet.id] ?? 0) +
        (N + 1) * (rangSexe[bet.id] ?? 0) +
        (rangPoids[bet.id] ?? 0),
      rangDate: rangDate[bet.id] ?? 0,
      rangPoids: rangPoids[bet.id] ?? 0,
      rangSexe: rangSexe[bet.id] ?? 0,
    }))

    // Mettre à jour les scores dans la base de données
    for (const bet of betsWithScores) {
      await sql`
        UPDATE bets
        SET score = ${bet.score},
            rang_date = ${bet.rangDate},
            rang_poids = ${bet.rangPoids},
            rang_sexe = ${bet.rangSexe}
        WHERE id = ${bet.id}
      `
    }

    return { message: 'Scores calculés', count: betsWithScores.length }
  } catch (error) {
    console.error('Error calculating scores:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors du calcul des scores'
    })
  }
})
