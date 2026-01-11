<template>
  <div v-if="loaded" class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <h3 class="text-lg font-semibold">Paris enregistrés</h3>
      <div class="flex items-center gap-2">
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-chart-line"
          :disabled="loading || bets.length === 0"
          aria-label="Voir les graphiques"
          @click="showAnalytics = true"
        />
        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          :loading="loading"
          aria-label="Rafraîchir"
          @click="fetchBets"
        />
      </div>
    </div>
    <div v-if="error" class="text-red-500 text-sm">Erreur: {{ error }}</div>
    <div v-if="bets.length === 0 && !error" class="text-sm text-[var(--ui-text-dimmed)]">
      Aucun pari pour le moment.
    </div>
    <ul
      class="divide-y divide-[var(--ui-border)] border border-[var(--ui-border)] rounded-md overflow-hidden"
    >
      <li v-for="b in bets" :key="b.id" class="p-3 sm:p-4 flex items-center gap-4">
        <div class="relative w-16 h-20 shrink-0">
          <div class="relative w-16 h-20">
            <img
              v-for="img in avatarLayers(b)"
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
        <div class="flex-1 min-w-0 leading-relaxed">
          <div class="text-base font-semibold mb-1">
            {{ b.participant_first_name }} {{ b.participant_last_name }}
          </div>
          <div class="text-sm">
            <span class="hidden sm:inline">{{ betRest(b) }}</span>
            <span class="sm:hidden">{{ betRestMobile(b) }}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
  <div v-else class="flex items-center justify-center py-10">
    <div class="flex flex-col items-center gap-3 text-sm text-[var(--ui-text-dimmed)]">
      <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
      <span>Chargement…</span>
    </div>
  </div>
  <ClientOnly>
    <BetsAnalyticsModal v-if="showAnalytics" v-model="showAnalytics" :bets="bets" />
  </ClientOnly>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import BetsAnalyticsModal from './BetsAnalyticsModal.vue'

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

  // Chargement du JSON placé dans /public (non importable directement via bundler)
  // NOTE: /public est servi à la racine, donc l'URL est /PigGenerator/structure.json
  const structure = await $fetch<StructureJson>('/PigGenerator/structure.json')

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

  const bets = ref<BetRow[]>([])
  const showAnalytics = ref(false)
  const loading = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  const emit = defineEmits<{ (e: 'loaded'): void }>()

  async function fetchBets() {
    loading.value = true
    error.value = null
    try {
      const data = await $fetch<BetRow[]>('/api/bets', {
        query: { orderBy: 'estimated_date', limit: 300 }
      })
      bets.value = data
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
      loaded.value = true
      emit('loaded')
    }
  }

  onMounted(fetchBets)

  // Avatar layering (miniature)
  const baseLayers = structure.layers.filter((l) => l.category === 'base')

  function avatarLayers(b: BetRow) {
    // Échelle mini (largeur 64px)
    const targetWidth = 64
    const origWidth = structure.base.width
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
      if (!name) return
      const meta = structure.layers.find((l) => l.name === name)
      if (!meta) return
      push(meta)
      if (meta.goesWith) {
        const companion = structure.layers.find((l) => l.name === meta.goesWith)
        push(companion)
      }
    }

    // Base
    baseLayers.forEach((l) => push(l))
    // Catégories sélectionnées (ordre similaire à l'affichage)
    addWithCompanion(b.middle_layer)
    addWithCompanion(b.top_layer)
    addWithCompanion(b.bottom_layer)

    // Tri par z pour un empilement cohérent
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

  function formatDateLong(d: string) {
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return '?'
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
    return `${jours} ${m} ${y}`
  }

  function formatDateShort(d: string) {
    const date = new Date(d)
    if (Number.isNaN(date.getTime())) return '?'
    const jj = String(date.getDate()).padStart(2, '0')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${jj}/${mm}/${yyyy}`
  }

  function betRest(b: BetRow) {
    const sexePart = b.is_male ? "d'un garçon" : "d'une fille"
    const prenomSegment = b.baby_first_name
      ? b.is_male
        ? ` appelé ${b.baby_first_name}`
        : ` appelée ${b.baby_first_name}`
      : ''
    const dateSegment = formatDateLong(b.estimated_date)
    const poids = `${Number(b.weight_kg).toFixed(1).replace('.', ',')}kg`
    return `A parié sur la naissance ${sexePart}${prenomSegment} le ${dateSegment}, pour un poids de ${poids}`
  }

  function betRestMobile(b: BetRow) {
    const articleAdj = b.is_male ? 'un petit' : 'une petite'
    const nameOrWord = b.baby_first_name ? b.baby_first_name : b.is_male ? 'garçon' : 'fille'
    const poids = `${Number(b.weight_kg).toFixed(1).replace('.', ',')}kg`
    const dateSegment = formatDateShort(b.estimated_date)
    return `A parié sur ${articleAdj} ${nameOrWord} de ${poids} pour le ${dateSegment}`
  }
</script>
