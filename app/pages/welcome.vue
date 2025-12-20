<template>
  <UContainer v-if="isReady">
    <!-- Switch dark mode en haut à droite -->
    <div class="flex justify-end">
      <USwitch
        :model-value="isMounted ? isDark : false"
        color="neutral"
        size="lg"
        unchecked-icon="i-lucide-sun"
        checked-icon="i-lucide-moon"
        @update:model-value="
          (val: boolean) => {
            if (isMounted) isDark = val
          }
        "
      />
    </div>

    <!-- Bannière d'information sur le bébé -->
    <div class="text-center mb-10 mt-4">
      <h1 class="text-2xl sm:text-3xl font-bold mb-6">
        {{ getBabyAnnouncement() }}
      </h1>

      <div class="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        <UCard variant="outline" :ui="{ body: 'p-3 sm:p-4' }">
          <div class="flex flex-col items-center gap-1">
            <UIcon name="i-lucide-weight" class="w-6 h-6 text-[var(--ui-primary)]" />
            <span class="text-xl sm:text-2xl font-bold">
              {{ formatWeight(babyConfig?.weight_kg) }}
            </span>
            <span class="text-xs uppercase tracking-wider text-[var(--ui-text-dimmed)]">Poids</span>
          </div>
        </UCard>
        <UCard variant="outline" :ui="{ body: 'p-3 sm:p-4' }">
          <div class="flex flex-col items-center gap-1">
            <UIcon name="i-lucide-ruler" class="w-6 h-6 text-[var(--ui-primary)]" />
            <span class="text-xl sm:text-2xl font-bold">
              {{ formatHeight(babyConfig?.height_cm) }}
            </span>
            <span class="text-xs uppercase tracking-wider text-[var(--ui-text-dimmed)]">
              Taille
            </span>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Section Podium -->
    <div class="mb-10 mt-16">
      <div v-if="loading" class="flex items-center justify-center py-10">
        <div class="flex flex-col items-center gap-3 text-sm text-[var(--ui-text-dimmed)]">
          <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
          <span>Chargement du classement…</span>
        </div>
      </div>

      <div
        v-else-if="podium.length > 0"
        class="flex justify-center items-end w-full max-w-3xl mx-auto px-1 sm:px-4"
      >
        <!-- 2ème place (gauche) -->
        <div v-if="podium[1]" class="flex flex-col items-center flex-1 max-w-[32%] sm:max-w-none">
          <!-- Avatar -->
          <div
            class="cursor-pointer transform transition-transform hover:scale-105 flex justify-center w-full"
            @click="triggerConfetti"
          >
            <div
              class="relative animate-bounce-dynamic animation-delay-100"
              :style="{
                width: (isMobile ? 80 : 140) + 'px',
                height: ((isMobile ? 80 : 140) * 15) / 13 + 'px',
              }"
            >
              <img
                v-for="img in avatarLayers(podium[1], isMobile ? 80 : 140)"
                :key="img.key"
                :src="img.src"
                :alt="img.key"
                class="absolute select-none pointer-events-none"
                :style="{
                  left: img.left + 'px',
                  top: img.top + 'px',
                  width: img.width + 'px',
                  height: img.height + 'px',
                  zIndex: img.z,
                }"
              />
            </div>
          </div>
          <!-- Nom entre avatar et podium -->
          <UPopover mode="click">
            <div class="text-center cursor-pointer px-1">
              <span class="text-sm sm:text-base font-semibold underline underline-offset-2 block">
                <span class="sm:hidden">
                  {{ podium[1].participant_first_name }}
                  <br />
                  {{ podium[1].participant_last_name }}
                </span>
                <span class="hidden sm:inline">
                  {{ podium[1].participant_first_name }}
                  {{ podium[1].participant_last_name }}
                </span>
              </span>
            </div>
            <template #content>
              <div class="p-2 text-sm space-y-1">
                <div>{{ getBetSummary(podium[1]) }}</div>
                <div v-if="podium[1].score !== null" class="font-semibold text-[var(--ui-primary)]">
                  Score : {{ podium[1].score }} pts
                </div>
              </div>
            </template>
          </UPopover>
          <!-- Podium block -->
          <div
            class="bg-gray-300 dark:bg-gray-600 rounded-t-lg flex items-center justify-center cursor-pointer w-full"
            style="height: 120px"
            @click="triggerConfetti"
          >
            <span class="text-4xl sm:text-6xl lg:text-7xl font-bold">2</span>
          </div>
        </div>

        <!-- 1ère place (centre) -->
        <div
          v-if="podium[0]"
          class="flex flex-col items-center flex-1 max-w-[36%] sm:max-w-none -mt-8 sm:-mt-16"
        >
          <!-- Avatar -->
          <div
            class="cursor-pointer transform transition-transform hover:scale-105 flex justify-center w-full"
            @click="triggerConfetti"
          >
            <div
              class="relative animate-bounce-dynamic"
              :style="{
                width: (isMobile ? 96 : 160) + 'px',
                height: ((isMobile ? 96 : 160) * 15) / 13 + 'px',
              }"
            >
              <img
                v-for="img in avatarLayers(podium[0], isMobile ? 96 : 160)"
                :key="img.key"
                :src="img.src"
                :alt="img.key"
                class="absolute select-none pointer-events-none"
                :style="{
                  left: img.left + 'px',
                  top: img.top + 'px',
                  width: img.width + 'px',
                  height: img.height + 'px',
                  zIndex: img.z,
                }"
              />
            </div>
          </div>
          <!-- Nom entre avatar et podium -->
          <UPopover mode="click">
            <div class="text-center cursor-pointer px-1">
              <span class="text-sm sm:text-lg font-semibold underline underline-offset-2 block">
                <span class="sm:hidden">
                  {{ podium[0].participant_first_name }}
                  <br />
                  {{ podium[0].participant_last_name }}
                </span>
                <span class="hidden sm:inline">
                  {{ podium[0].participant_first_name }}
                  {{ podium[0].participant_last_name }}
                </span>
              </span>
            </div>
            <template #content>
              <div class="p-2 text-sm space-y-1">
                <div>{{ getBetSummary(podium[0]) }}</div>
                <div v-if="podium[0].score !== null" class="font-semibold text-[var(--ui-primary)]">
                  Score : {{ podium[0].score }} pts
                </div>
              </div>
            </template>
          </UPopover>
          <!-- Podium block -->
          <div
            class="bg-yellow-400 dark:bg-yellow-600 rounded-t-lg flex items-center justify-center cursor-pointer w-full"
            style="height: 160px"
            @click="triggerConfetti"
          >
            <span class="text-5xl sm:text-7xl lg:text-8xl font-bold">1</span>
          </div>
        </div>

        <!-- 3ème place (droite) -->
        <div v-if="podium[2]" class="flex flex-col items-center flex-1 max-w-[32%] sm:max-w-none">
          <!-- Avatar -->
          <div
            class="cursor-pointer transform transition-transform hover:scale-105 flex justify-center w-full"
            @click="triggerConfetti"
          >
            <div
              class="relative animate-bounce-dynamic animation-delay-200"
              :style="{
                width: (isMobile ? 72 : 120) + 'px',
                height: ((isMobile ? 72 : 120) * 15) / 13 + 'px',
              }"
            >
              <img
                v-for="img in avatarLayers(podium[2], isMobile ? 72 : 120)"
                :key="img.key"
                :src="img.src"
                :alt="img.key"
                class="absolute select-none pointer-events-none"
                :style="{
                  left: img.left + 'px',
                  top: img.top + 'px',
                  width: img.width + 'px',
                  height: img.height + 'px',
                  zIndex: img.z,
                }"
              />
            </div>
          </div>
          <!-- Nom entre avatar et podium -->
          <UPopover mode="click">
            <div class="text-center cursor-pointer px-1">
              <span class="text-sm sm:text-base font-semibold underline underline-offset-2 block">
                <span class="sm:hidden">
                  {{ podium[2].participant_first_name }}
                  <br />
                  {{ podium[2].participant_last_name }}
                </span>
                <span class="hidden sm:inline">
                  {{ podium[2].participant_first_name }}
                  {{ podium[2].participant_last_name }}
                </span>
              </span>
            </div>
            <template #content>
              <div class="p-2 text-sm space-y-1">
                <div>{{ getBetSummary(podium[2]) }}</div>
                <div v-if="podium[2].score !== null" class="font-semibold text-[var(--ui-primary)]">
                  Score : {{ podium[2].score }} pts
                </div>
              </div>
            </template>
          </UPopover>
          <!-- Podium block -->
          <div
            class="bg-amber-600 dark:bg-amber-800 rounded-t-lg flex items-center justify-center cursor-pointer w-full"
            style="height: 100px"
            @click="triggerConfetti"
          >
            <span class="text-3xl sm:text-5xl lg:text-6xl font-bold">3</span>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-[var(--ui-text-dimmed)] py-10">
        Aucun pari enregistré pour le moment.
      </div>
    </div>

    <!-- Section des lots -->
    <UCard class="shadow-lg mb-10">
      <template #header>
        <div class="flex items-center justify-center gap-2 text-center w-full">
          <UIcon name="i-lucide-gift" class="w-6 h-6" />
          <span class="text-xl sm:text-2xl font-bold">Les Lots en Jeu</span>
        </div>
      </template>

      <div class="space-y-6 py-2 px-2">
        <ul class="space-y-4 text-base list-none">
          <li class="flex gap-3 items-center">
            <UIcon name="i-lucide-medal" class="text-yellow-500 shrink-0 w-6 h-6" />
            <span>
              <strong>1ère place :</strong>
              Repas au restaurant
            </span>
          </li>
          <li class="flex gap-3 items-center">
            <UIcon
              name="i-lucide-medal"
              class="text-gray-400 dark:text-gray-300 shrink-0 w-6 h-6"
            />
            <span>
              <strong>2ème place :</strong>
              Bouteille de champagne
            </span>
          </li>
          <li class="flex gap-3 items-center">
            <UIcon
              name="i-lucide-medal"
              class="text-amber-800 dark:text-amber-600 shrink-0 w-6 h-6"
            />
            <span>
              <strong>3ème place :</strong>
              Terrines bretonnes
            </span>
          </li>
        </ul>

        <details class="text-sm text-[var(--ui-text-dimmed)] group">
          <summary class="cursor-pointer text-[var(--ui-text)] flex items-center gap-1 select-none">
            <UIcon
              name="i-lucide-chevron-down"
              class="w-4 h-4 opacity-70 transition-transform group-open:rotate-180"
            />
            <i>Calcul des scores</i>
          </summary>
          <div class="mt-2 space-y-2">
            <p>
              Le score de chaque participant est calculé avec des poids dynamiques garantissant la
              hiérarchie
              <strong>Date &gt; Sexe &gt; Poids</strong>
              :
            </p>
            <div class="text-center bg-[var(--ui-bg-elevated)] p-4 rounded">
              <ClientOnly>
                <MathFormula
                  formula="\text{Score} = r_{\text{date}} \cdot (K+2)(N+1) + r_{\text{sexe}} \cdot (N+1) + r_{\text{poids}}"
                />
              </ClientOnly>
            </div>
            <ul class="list-disc list-inside space-y-1 mt-2 text-sm">
              <li>
                <ClientOnly><MathFormula formula="N" :display-mode="false" /></ClientOnly>
                = nombre total de parieurs
              </li>
              <li>
                <ClientOnly><MathFormula formula="K" :display-mode="false" /></ClientOnly>
                = nombre de parieurs ayant trouvé le bon sexe
              </li>
              <li>
                <ClientOnly>
                  <MathFormula formula="r_{\text{date}}" :display-mode="false" />
                </ClientOnly>
                : classement selon l'écart en jours avec la vraie date
              </li>
              <li>
                <ClientOnly>
                  <MathFormula formula="r_{\text{sexe}}" :display-mode="false" />
                </ClientOnly>
                : 1 si correct, K+1 si incorrect
              </li>
              <li>
                <ClientOnly>
                  <MathFormula formula="r_{\text{poids}}" :display-mode="false" />
                </ClientOnly>
                : classement selon l'écart de poids
              </li>
            </ul>
            <p class="mt-2">
              <strong>Le score le plus bas gagne.</strong>
              La date prime toujours sur le sexe, qui prime toujours sur le poids. En cas d'égalité
              parfaite, priorité au pari le plus ancien.
            </p>
          </div>
        </details>
      </div>
    </UCard>

    <!-- Lien Classement complet -->
    <div class="text-center mt-8 mb-10">
      <button
        class="text-[var(--ui-text)] underline underline-offset-2 hover:opacity-80 transition-opacity cursor-pointer"
        @click="showBetsModal = true"
      >
        Classement complet
      </button>
    </div>

    <!-- Modal du classement complet -->
    <ClientOnly>
      <UModal
        v-model:open="showBetsModal"
        title="Classement complet"
        :ui="{
          header: 'flex justify-center',
          title: 'w-full text-center text-2xl font-bold',
          content: 'sm:max-w-4xl max-w-[95vw] mx-auto',
        }"
      >
        <template #body>
          <div class="max-h-[60vh] overflow-y-auto">
            <UTable
              v-model:sorting="tableSorting"
              :data="tableData"
              :columns="tableColumns"
              :sorting-options="{ getSortedRowModel: getSortedRowModel() }"
              :ui="{
                th: 'text-center',
                td: 'text-center',
              }"
            />
          </div>
        </template>
        <template #footer>
          <div class="flex justify-center w-full">
            <UButton color="neutral" variant="solid" @click="showBetsModal = false">Fermer</UButton>
          </div>
        </template>
      </UModal>
    </ClientOnly>
  </UContainer>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, h, resolveComponent } from 'vue'
  import { useNuxtApp, useState } from '#app'
  import { useColorMode } from '@vueuse/core'

  // Table columns definition for the ranking modal (TanStack Table API)
  import type { TableColumn } from '@nuxt/ui'
  import type { Column } from '@tanstack/vue-table'
  import { getSortedRowModel } from '@tanstack/vue-table'

  // Wait for birth check to complete before rendering
  const birthCheckDone = useState<boolean>('birthCheckDone', () => false)
  const isReady = computed(() => birthCheckDone.value)

  // Dark mode
  const colorMode = useColorMode()
  const isDark = computed({
    get() {
      return colorMode.value === 'dark'
    },
    set(_isDark) {
      colorMode.value = _isDark ? 'dark' : 'light'
    },
  })

  const isMounted = ref(false)

  // Types
  interface BabyConfig {
    id: number
    is_born: boolean
    baby_name: string | null
    birth_date: string | null
    weight_kg: number | null
    height_cm: number | null
    sex: string | null
  }

  interface BetRow {
    id: string
    participant_first_name: string
    participant_last_name: string
    email: string
    is_male: boolean
    estimated_date: string
    weight_kg: number | string
    baby_first_name: string | null
    top_layer: string | null
    middle_layer: string | null
    bottom_layer: string | null
    created_at: string
    score: number | null
    rang_date: number | null
    rang_poids: number | null
    rang_sexe: number | null
  }

  interface LayerMeta {
    name: string
    x: number
    y: number
    width: number
    height: number
    z: number
    category: 'base' | 'top' | 'middle' | 'bottom'
    goesWith?: string
  }

  interface StructureJson {
    base: { width: number; height: number }
    layers: LayerMeta[]
  }

  // State
  const babyConfig = ref<BabyConfig | null>(null)
  const bets = ref<BetRow[]>([])
  const loading = ref(true)
  const structure = ref<StructureJson | null>(null)
  const showBetsModal = ref(false)
  const isMobile = ref(false)
  const tableSorting = ref<{ id: string; desc: boolean }[]>([{ id: 'score', desc: false }])

  // Supabase
  type SupabaseClient = import('@supabase/supabase-js').SupabaseClient
  const { $supabase } = useNuxtApp() as { $supabase: SupabaseClient }

  // Computed - Podium avec calcul des scores
  // Le classement utilise le score enregistré en base de données (calculé par l'admin)
  // Score = (K + 2) * (N + 1) * rang_date + (N + 1) * rang_sexe + rang_poids
  // où N = nombre total de parieurs, K = nombre ayant trouvé le bon sexe
  // Hiérarchie: Date > Sexe > Poids. Plus le score est bas, meilleur est le classement
  // En cas d'égalité parfaite, priorité au pari le plus ancien
  const rankedBets = computed(() => {
    if (!babyConfig.value || !bets.value.length) return []

    return [...bets.value]
      .map((bet) => ({
        ...bet,
        createdAt: new Date(bet.created_at).getTime(),
      }))
      .sort((a, b) => {
        // Si les scores sont disponibles, les utiliser
        if (a.score !== null && b.score !== null) {
          if (a.score !== b.score) return a.score - b.score
          // En cas d'égalité parfaite, le plus ancien pari gagne
          return a.createdAt - b.createdAt
        }

        // Fallback: si pas de score, utiliser l'ancien algorithme
        const config = babyConfig.value
        if (!config) return 0

        const birthDate = config.birth_date ? new Date(config.birth_date) : null
        const actualWeight = config.weight_kg ? Number(config.weight_kg) : null
        const actualSex = config.sex

        // Calcul de l'écart de date (en jours)
        let aDaysDiff = 0
        let bDaysDiff = 0
        if (birthDate) {
          const aDate = new Date(a.estimated_date)
          const bDate = new Date(b.estimated_date)
          aDaysDiff = Math.abs(
            Math.floor((birthDate.getTime() - aDate.getTime()) / (1000 * 60 * 60 * 24))
          )
          bDaysDiff = Math.abs(
            Math.floor((birthDate.getTime() - bDate.getTime()) / (1000 * 60 * 60 * 24))
          )
        }

        // Vérification du sexe
        const aSexCorrect = actualSex ? (a.is_male ? 'M' : 'F') === actualSex : true
        const bSexCorrect = actualSex ? (b.is_male ? 'M' : 'F') === actualSex : true

        // Calcul de l'écart de poids
        let aWeightDiff = 0
        let bWeightDiff = 0
        if (actualWeight !== null) {
          aWeightDiff = Math.abs(actualWeight - Number(a.weight_kg))
          bWeightDiff = Math.abs(actualWeight - Number(b.weight_kg))
        }

        // 1. Tri par écart de date (moins de jours = meilleur)
        if (aDaysDiff !== bDaysDiff) return aDaysDiff - bDaysDiff

        // 2. Tri par sexe correct (sexe correct gagne)
        if (aSexCorrect !== bSexCorrect) return aSexCorrect ? -1 : 1

        // 3. Tri par écart de poids (moins d'écart = meilleur)
        if (aWeightDiff !== bWeightDiff) return aWeightDiff - bWeightDiff

        // 4. En cas d'égalité parfaite, le plus ancien pari gagne
        return a.createdAt - b.createdAt
      })
  })

  const podium = computed(() => rankedBets.value.slice(0, 3))

  type TableRowData = {
    id: string
    rank: number
    name: string
    score: number
    rang_date: number
    rang_poids: number
    rang_sexe: number
    date_display: string
    poids_display: string
    sexe_display: string
  }

  // Helper function to create sortable header
  function getSortableHeader(column: Column<TableRowData>, label: string) {
    const UButton = resolveComponent('UButton')
    const isSorted = column.getIsSorted()

    return h(UButton, {
      color: 'neutral',
      variant: 'ghost',
      label,
      icon: isSorted
        ? isSorted === 'asc'
          ? 'i-lucide-arrow-up-narrow-wide'
          : 'i-lucide-arrow-down-wide-narrow'
        : 'i-lucide-arrow-up-down',
      class: '-mx-2.5',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    })
  }

  // Helper function to create formatted cell: **rang** - *valeur*
  function formatRankCell(rang: number, value: string) {
    if (rang === 0) return '-'
    return h('span', [
      h('strong', `${rang}`),
      ' - ',
      h('em', { class: 'text-sm text-muted' }, value),
    ])
  }

  const tableColumns: TableColumn<TableRowData>[] = [
    {
      id: 'score',
      accessorKey: 'score',
      header: ({ column }) => getSortableHeader(column, 'Rang'),
      cell: ({ row }) => {
        const score = row.original.score
        if (score === 999) return '-'
        return h('span', [
          h('strong', `${row.original.rank}`),
          ' - ',
          h('em', { class: 'text-sm text-muted' }, `${score} pts`),
        ])
      },
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Nom',
      enableSorting: false,
    },
    {
      id: 'date',
      accessorKey: 'rang_date',
      header: ({ column }) => getSortableHeader(column, 'Date'),
      cell: ({ row }) => formatRankCell(row.original.rang_date, row.original.date_display),
    },
    {
      id: 'sexe',
      accessorKey: 'rang_sexe',
      header: ({ column }) => getSortableHeader(column, 'Sexe'),
      cell: ({ row }) => formatRankCell(row.original.rang_sexe, row.original.sexe_display),
    },
    {
      id: 'poids',
      accessorKey: 'rang_poids',
      header: ({ column }) => getSortableHeader(column, 'Poids'),
      cell: ({ row }) => formatRankCell(row.original.rang_poids, row.original.poids_display),
    },
  ]

  // Format weight for table display
  function formatWeightForTable(weightKg: number | string): string {
    const kg = Number(weightKg)
    return `${kg.toFixed(1).replace('.', ',')}kg`
  }

  // Table data for the ranking modal (with bet details)
  const tableData = computed(() => {
    return rankedBets.value.map((bet, index) => ({
      id: bet.id,
      rank: index + 1,
      name: `${bet.participant_first_name} ${bet.participant_last_name}`,
      score: bet.score ?? 999,
      rang_date: bet.rang_date ?? 0,
      rang_poids: bet.rang_poids ?? 0,
      rang_sexe: bet.rang_sexe ?? 0,
      // Display values with bet details
      date_display: formatDateShort(bet.estimated_date),
      poids_display: formatWeightForTable(bet.weight_kg),
      sexe_display: bet.is_male ? 'garçon' : 'fille',
    }))
  })

  // Avatar layers
  const baseLayers = computed(
    () => structure.value?.layers.filter((l) => l.category === 'base') || []
  )

  function avatarLayers(bet: BetRow, targetWidth = 64) {
    if (!structure.value) return []

    const origWidth = structure.value.base.width
    const scale = targetWidth / origWidth

    const layers: LayerMeta[] = []
    const pushed = new Set<string>()

    function push(meta: LayerMeta | undefined) {
      if (!meta) return
      if (pushed.has(meta.name)) return
      pushed.add(meta.name)
      layers.push(meta)
    }

    function addWithCompanion(name: string | null) {
      if (!name || !structure.value) return
      const meta = structure.value.layers.find((l) => l.name === name)
      if (!meta) return
      push(meta)
      if (meta.goesWith) {
        const companion = structure.value.layers.find((l) => l.name === meta.goesWith)
        push(companion)
      }
    }

    // Base
    baseLayers.value.forEach((l) => push(l))
    // Catégories sélectionnées
    addWithCompanion(bet.middle_layer)
    addWithCompanion(bet.top_layer)
    addWithCompanion(bet.bottom_layer)

    // Tri par z
    layers.sort((a, b) => a.z - b.z)

    return layers.map((l) => ({
      key: l.name,
      src: `/PigGenerator/${categoryFolder(l.category)}/${l.name}.svg`,
      width: l.width * scale,
      height: l.height * scale,
      left: l.x * scale - (l.width * scale) / 2,
      top: l.y * scale - (l.height * scale) / 2,
      z: l.z,
    }))
  }

  function categoryFolder(cat: string) {
    switch (cat) {
      case 'base':
        return 'Base'
      case 'top':
        return 'Top'
      case 'middle':
        return 'Middle'
      case 'bottom':
        return 'Bottom'
      default:
        return ''
    }
  }

  // Baby announcement
  function getBabyAnnouncement(): string {
    if (!babyConfig.value) return 'Le bébé est arrivé !'

    const name = babyConfig.value.baby_name || 'Bébé'
    const isFemale = babyConfig.value.sex === 'F'
    const prefix = isFemale ? 'La petite' : 'Le petit'
    const arrived = isFemale ? 'arrivée' : 'arrivé'
    const dateFormatted = formatBirthDateShort(babyConfig.value.birth_date)

    return `${prefix} ${name} est ${arrived} ${dateFormatted} !`
  }

  function formatBirthDateShort(dateStr: string | null | undefined): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ''
    const jours = date.getDate()
    const mois = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ]
    const m = mois[date.getMonth()]
    const y = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const mins = date.getMinutes().toString().padStart(2, '0')
    return `le ${jours} ${m} ${y} à ${hours}h${mins}`
  }

  function formatWeight(weight: number | null | undefined): string {
    if (weight === null || weight === undefined) return '?'
    return `${Number(weight).toFixed(1).replace('.', ',')} kg`
  }

  function formatHeight(height: number | null | undefined): string {
    if (height === null || height === undefined) return '?'
    return `${Number(height).toFixed(0)} cm`
  }

  function formatDateShort(d: string) {
    const date = new Date(d)
    if (isNaN(date.getTime())) return '?'
    const jj = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${jj}/${mm}/${yyyy}`
  }

  function getBetSummary(bet: BetRow): string {
    const sexe = bet.is_male ? 'garçon' : 'fille'
    const prenom = bet.baby_first_name ? ` "${bet.baby_first_name}"` : ''
    const poids = `${Number(bet.weight_kg).toFixed(1).replace('.', ',')} kg`
    const date = formatDateShort(bet.estimated_date)
    return `${sexe}${prenom}, ${poids}, le ${date}`
  }

  function _getBetDescription(bet: BetRow): string {
    const sexePart = bet.is_male ? "d'un garçon" : "d'une fille"
    const prenomSegment = bet.baby_first_name
      ? bet.is_male
        ? ` appelé ${bet.baby_first_name}`
        : ` appelée ${bet.baby_first_name}`
      : ''
    const mois = [
      'janvier',
      'février',
      'mars',
      'avril',
      'mai',
      'juin',
      'juillet',
      'août',
      'septembre',
      'octobre',
      'novembre',
      'décembre',
    ]
    const d = new Date(bet.estimated_date)
    const dateSegment = `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`
    const poids = `${Number(bet.weight_kg).toFixed(1).replace('.', ',')} kg`
    return `A parié sur la naissance ${sexePart}${prenomSegment} le ${dateSegment}, pour un poids de ${poids}`
  }

  // Confetti
  async function triggerConfetti() {
    if (typeof window === 'undefined') return
    try {
      const { default: confetti } = await import('canvas-confetti')
      const fire = (particleCount: number, spread: number, delay = 0) =>
        setTimeout(() => confetti({ particleCount, spread, origin: { y: 0.6 } }), delay)
      fire(100, 70)
      fire(70, 60, 200)
      fire(50, 80, 400)
    } catch (e) {
      console.warn('Confetti non chargé', e)
    }
  }

  // Fetch data
  async function fetchData() {
    loading.value = true
    try {
      // Load structure
      structure.value = await $fetch<StructureJson>('/PigGenerator/structure.json')

      // Load baby config
      if ($supabase) {
        const { data: configData } = await $supabase.from('app_config').select('*').single()
        babyConfig.value = configData

        // Load bets
        const { data: betsData } = await $supabase
          .from('v_bets')
          .select('*')
          .order('created_at', { ascending: true })
        bets.value = (betsData as BetRow[]) || []
      }
    } catch (e) {
      console.error('Error loading data:', e)
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    isMounted.value = true
    // Détecter si mobile
    isMobile.value = window.innerWidth < 640
    window.addEventListener('resize', () => {
      isMobile.value = window.innerWidth < 640
    })
    await fetchData()
    // Confetti au chargement
    setTimeout(() => triggerConfetti(), 500)
  })
</script>

<style scoped>
  /* Animation de rebond dynamique pour les avatars */
  @keyframes bounce-dynamic {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    25% {
      transform: translateY(-12px) scale(1.02);
    }
    50% {
      transform: translateY(-4px) scale(0.98);
    }
    75% {
      transform: translateY(-16px) scale(1.03);
    }
  }

  .animate-bounce-dynamic {
    animation: bounce-dynamic 1.2s ease-in-out infinite;
  }

  .animation-delay-100 {
    animation-delay: 0.1s;
  }

  .animation-delay-200 {
    animation-delay: 0.25s;
  }
</style>
