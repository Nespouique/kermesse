<template>
  <ClientOnly>
    <UModal
      v-model:open="internalOpen"
      title="Statistiques"
      :description="`${bets.length} paris chargés`"
      :ui="{
        header: 'flex justify-center',
        title: 'w-full text-center text-3xl font-extrabold',
        description: 'w-full text-center',
        body: 'p-0',
        footer: 'hidden',
      }"
      class="sm:max-w-5xl"
    >
      <template #body>
        <div class="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          <div v-if="bets.length === 0" class="text-sm">Rien à afficher pour le moment.</div>
          <div v-else class="space-y-10">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
              <!-- Pie Sexe -->
              <section class="grid grid-rows-[auto,1fr,auto] h-[320px]">
                <h3 class="text-base font-semibold mb-2">Répartition garçon / fille</h3>

                <div class="min-h-0">
                  <ClientOnly>
                    <PieChart :male="male" :female="female" />
                  </ClientOnly>
                </div>
                <p class="mt-2 text-xs text-center">
                  Garçon:
                  <strong>{{ male }}</strong>
                  ({{ malePct.toFixed(1) }}%) ; Fille:
                  <strong>{{ female }}</strong>
                  ({{ femalePct.toFixed(1) }}%)
                </p>
              </section>

              <!-- Line Poids -->
              <section class="grid grid-rows-[auto,1fr,auto] h-[320px]">
                <h3 class="text-base font-semibold mb-2">Distribution des poids (kg)</h3>

                <div class="min-h-0">
                  <ClientOnly>
                    <LineWeightChart :weights-counts="weightsCountsFullRange" />
                  </ClientOnly>
                </div>
                <p class="mt-2 text-xs text-[var(--ui-text-dimmed)]">
                  Chaque point représente un poids voté (kg) et le nombre de votants.
                </p>
              </section>

              <!-- Calendrier Dates -->
              <section class="md:col-span-2">
                <h3 class="text-base font-semibold mb-2">
                  Dates de naissance estimées (Déc / Jan)
                </h3>
                <CalendarVotes :date-map="dateMap" :all-dates="allCalendarDates" />
                <p class="mt-2 text-xs text-[var(--ui-text-dimmed)]">
                  Une pastille = un pari sur ce jour. Si le nombre est élevé, un badge +n résume les
                  pastilles supplémentaires.
                </p>
              </section>
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import PieChart from './charts/PieChart.vue'
  import LineWeightChart from './charts/LineWeightChart.vue'
  import CalendarVotes from './charts/CalendarVotes.vue'

  interface BetRow {
    id: string
    participant_first_name: string
    participant_last_name: string
    email: string
    is_male: boolean
    estimated_date: string
    weight_kg: number
    baby_first_name: string | null
    top_layer: string | null
    middle_layer: string | null
    bottom_layer: string | null
    created_at: string
  }

  const props = defineProps<{ bets: BetRow[]; modelValue: boolean }>()
  const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
  const internalOpen = computed({
    get: () => props.modelValue,
    set: (v: boolean) => emit('update:modelValue', v),
  })

  const male = computed(() => props.bets.filter((b) => b.is_male).length)
  const female = computed(() => props.bets.length - male.value)
  const malePct = computed(() => (props.bets.length ? (male.value / props.bets.length) * 100 : 0))
  const femalePct = computed(() =>
    props.bets.length ? (female.value / props.bets.length) * 100 : 0
  )

  // Weights distribution
  const weightsCounts = computed(() => {
    const map = new Map<string, number>()
    for (const b of props.bets) {
      if (b.weight_kg == null || Number.isNaN(b.weight_kg)) continue
      const key = Number(b.weight_kg).toFixed(1)
      map.set(key, (map.get(key) || 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
      .map(([w, c]) => ({ weight: w, count: c }))
  })

  // Full range 2.5 to 5.0 step 0.1
  const weightsCountsFullRange = computed(() => {
    const map = new Map(weightsCounts.value.map((r) => [r.weight, r.count]))
    const arr: { weight: string; count: number }[] = []
    for (let w = 2.5; w <= 5.0001; w += 0.1) {
      const key = w.toFixed(1)
      arr.push({ weight: key, count: map.get(key) || 0 })
    }
    return arr
  })

  // Calendar (Décembre & Janvier)
  function toDateKey(d: Date) {
    // Construit une clé locale (YYYY-MM-DD) sans conversion UTC pour éviter le décalage d'un jour.
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const dateMap = computed(() => {
    const m = new Map<string, BetRow[]>()
    for (const b of props.bets) {
      const d = new Date(b.estimated_date)
      if (Number.isNaN(d.getTime())) continue
      const month = d.getMonth() // 0 jan, 11 dec
      if (month !== 11 && month !== 0) continue
      const key = toDateKey(d)
      if (!m.has(key)) m.set(key, [])
      m.get(key)!.push(b)
    }
    return m
  })

  // Build list of calendar dates for both months (handle year boundary)
  const allCalendarDates = computed(() => {
    // Determine year(s) from bets: pick any dec year and jan year if present
    let decYear: number | null = null
    let janYear: number | null = null
    for (const b of props.bets) {
      const d = new Date(b.estimated_date)
      if (Number.isNaN(d.getTime())) continue
      if (d.getMonth() === 11 && decYear == null) decYear = d.getFullYear()
      if (d.getMonth() === 0 && janYear == null) janYear = d.getFullYear()
    }
    // Fallback: if none found, use current year logic
    const now = new Date()
    if (decYear == null && janYear == null) {
      decYear = now.getFullYear() - 1
      janYear = now.getFullYear()
    } else if (decYear != null && janYear == null) {
      janYear = decYear + 1
    } else if (decYear == null && janYear != null) {
      decYear = janYear - 1
    }
    const dates: Date[] = []
    if (decYear != null) {
      for (let day = 1; day <= 31; day++) dates.push(new Date(decYear, 11, day))
    }
    if (janYear != null) {
      const janDays = new Date(janYear, 1, 0).getDate()
      for (let day = 1; day <= janDays; day++) dates.push(new Date(janYear, 0, day))
    }
    return dates
  })
</script>
