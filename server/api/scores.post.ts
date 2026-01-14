import { prisma } from '../utils/prisma'

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
    const bets = await prisma.bet.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        estimatedDate: true,
        weightKg: true,
        isMale: true,
        createdAt: true
      }
    })

    if (bets.length === 0) {
      return { message: 'Aucun pari à scorer', count: 0 }
    }

    const actualDate = new Date(birthDate)
    const actualWeightGrams = weightKg * 1000

    // Calculer les écarts bruts pour chaque participant
    const betsWithDiffs = bets.map((bet) => {
      const betDate = new Date(bet.estimatedDate)
      const ecartDate = Math.abs(
        Math.floor((actualDate.getTime() - betDate.getTime()) / (1000 * 60 * 60 * 24))
      )

      const betWeightGrams = Number(bet.weightKg) * 1000
      const ecartPoidsExact = Math.abs(actualWeightGrams - betWeightGrams)
      const ecartPoids = Math.round(ecartPoidsExact / 100)

      const betSex = bet.isMale ? 'M' : 'F'
      const sexeCorrect = betSex === sex

      return {
        id: bet.id,
        ecartDate,
        ecartPoids,
        sexeCorrect,
        createdAt: new Date(bet.createdAt).getTime(),
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

    // Mettre à jour les scores dans la base de données avec une transaction
    await prisma.$transaction(
      betsWithScores.map((bet) =>
        prisma.bet.update({
          where: { id: bet.id },
          data: {
            score: bet.score,
            rangDate: bet.rangDate,
            rangPoids: bet.rangPoids,
            rangSexe: bet.rangSexe
          }
        })
      )
    )

    return { message: 'Scores calculés', count: betsWithScores.length }
  } catch (error) {
    console.error('Error calculating scores:', error)
    throw createError({
      statusCode: 500,
      message: 'Erreur lors du calcul des scores'
    })
  }
})
