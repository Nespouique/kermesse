<template>
  <div class="space-y-6">
    <div class="grid md:grid-cols-2 gap-8">
      <div v-for="monthDates in months" :key="monthKey(monthDates)" class="space-y-2">
        <h4 class="font-medium text-xs">
          {{ formatMonthYear(monthDates[0]) }}
        </h4>
        <div
          class="grid grid-cols-7 gap-1 text-[10px] uppercase tracking-wide text-[var(--ui-text-dimmed)]"
        >
          <span v-for="d in weekDays" :key="d" class="text-center">{{ d }}</span>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <template v-for="cell in buildMonthCells(monthDates)" :key="cell.key">
            <div v-if="!cell.date" class="h-14 rounded-md bg-transparent" />
            <div
              v-else
              class="h-14 rounded-md border border-[var(--ui-border)] p-0.5 flex flex-col"
              :title="cell.title"
            >
              <div class="text-[10px] leading-none text-right text-[var(--ui-text-dimmed)] mb-0.5">
                {{ cell.date.getDate() }}
              </div>
              <div class="flex flex-wrap gap-[2px] content-start">
                <template v-for="(b, idx) in cell.betsLimited" :key="b.id + idx">
                  <span
                    class="w-3 h-3 rounded-full"
                    :class="b.is_male ? 'bg-blue-500' : 'bg-pink-500'"
                    :title="participantName(b)"
                  />
                </template>
                <div
                  v-if="cell.extraCount > 0"
                  class="w-4 h-4 rounded-full bg-[var(--ui-bg-elevated)] border border-[var(--ui-border)] text-[9px] flex items-center justify-center"
                >
                  +{{ cell.extraCount }}
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { computed } from 'vue'

  interface BetRow {
    id: string
    participant_first_name: string
    participant_last_name: string
    is_male: boolean
    estimated_date: string
    weight_kg: number
    baby_first_name: string | null
  }

  const props = defineProps<{ dateMap: Map<string, BetRow[]>; allDates: Date[] }>()
  const allDates = computed(() => props.allDates || [])

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

  function formatMonthYear(d?: Date) {
    const months = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ]
    if (!d) return ''
    return months[d.getMonth()] + ' ' + d.getFullYear()
  }

  function participantName(b: BetRow) {
    return b.participant_first_name + ' ' + b.participant_last_name
  }

  // Split dates into arrays per month
  const months = computed(() => {
    const groups: Record<string, Date[]> = {}
    for (const d of allDates.value) {
      const k = d.getFullYear() + '-' + d.getMonth()
      if (!groups[k]) groups[k] = []
      groups[k].push(d)
    }
    return Object.values(groups)
  })

  function monthKey(dates: Date[]) {
    return dates[0] ? dates[0].getFullYear() + '-' + dates[0].getMonth() : 'm'
  }

  interface CalendarCell {
    key: string
    date: Date | null
    bets: BetRow[]
    betsLimited: BetRow[]
    extraCount: number
    title: string
  }

  function buildMonthCells(dates: Date[]): CalendarCell[] {
    if (!dates.length) return [] as CalendarCell[]
    // First day of month weekday (Mon=1 .. Sun=7) using getDay (Sun=0)
    const firstRef = dates[0]
    if (!firstRef) return []
    const first = new Date(firstRef.getFullYear(), firstRef.getMonth(), 1)
    let startWeekday = first.getDay() // 0 Sun, 1 Mon ...
    // Convert to Monday-first index
    startWeekday = startWeekday === 0 ? 6 : startWeekday - 1
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    const cells: CalendarCell[] = []
    for (let i = 0; i < startWeekday; i++)
      cells.push({
        key: 'empty-' + i,
        date: null,
        bets: [],
        betsLimited: [],
        extraCount: 0,
        title: '',
      })
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(first.getFullYear(), first.getMonth(), day)
      const key = date.toISOString().slice(0, 10)
      const bets = props.dateMap.get(key) || []
      const betsLimited = bets.slice(0, 6)
      const extraCount = bets.length > 6 ? bets.length - 6 : 0
      cells.push({
        key,
        date,
        bets,
        betsLimited,
        extraCount,
        title: bets.length ? bets.length + ' pari' + (bets.length > 1 ? 's' : '') : 'Aucun pari',
      })
    }
    return cells
  }
</script>
