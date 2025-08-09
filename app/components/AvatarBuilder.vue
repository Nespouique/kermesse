<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-6">
    <!-- Preview -->
    <div class="flex flex-col items-center gap-3 lg:col-span-1">
      <div ref="previewRef" class="relative w-full max-w-[250px] aspect-[13/15] overflow-hidden">
        <!-- Base + Selected layers -->
        <img
          v-for="img in renderedLayers"
          :key="img.key"
          :src="img.src"
          alt="layer"
          class="absolute select-none pointer-events-none"
          :style="{
            width: img.width + 'px',
            height: img.height + 'px',
            left: img.left + 'px',
            top: img.top + 'px',
            zIndex: String(img.z),
          }"
        />
      </div>
      <div class="flex gap-2">
        <UButton color="neutral" icon="i-lucide-shuffle" label="Générer" @click="generateRandom" />
        <UButton
          color="neutral"
          variant="outline"
          icon="i-lucide-rotate-ccw"
          label="Réinitialiser"
          @click="resetAll"
        />
      </div>
    </div>

    <!-- Controls -->
    <div class="space-y-4 lg:col-span-3">
      <div v-for="cat in selectableCategories" :key="cat.key">
        <UCollapsible v-model:open="openMap[cat.key]" class="flex flex-col">
          <UButton
            class="w-full flex items-center justify-between px-3 py-2 group"
            color="neutral"
            variant="soft"
            trailing-icon="i-lucide-chevron-down"
            :ui="{
              base: 'bg-[var(--ui-bg)] ',
              trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
            }"
          >
            <span class="flex items-center gap-2">
              <UIcon :name="cat.icon" />
              <span class="font-medium">{{ cat.label }}</span>
            </span>
          </UButton>
          <template #content>
            <div class="p-2 bg-[var(--ui-bg)]">
              <div class="grid grid-cols-6 sm:grid-cols-13 gap-2">
                <!-- Aucun -->
                <UButton
                  color="neutral"
                  variant="soft"
                  :class="[
                    'relative h-16 rounded-md border border-[var(--ui-border)] bg-[var(--ui-bg)] flex items-center justify-center',
                    { 'ring-2 ring-[var(--ui-primary)]': !selected[cat.key] },
                  ]"
                  aria-label="Aucun"
                  @click="selectNone(cat.key)"
                >
                  <UIcon name="i-lucide-x" class="text-[var(--ui-text-dimmed)]" />
                </UButton>

                <!-- Options with thumbnails (grouped) -->
                <UButton
                  v-for="opt in displayOptionsByCategory[cat.key] || []"
                  :key="opt.key"
                  color="neutral"
                  variant="soft"
                  :class="[
                    'p-0 sm:p-1 relative h-16 rounded-md bg-[var(--ui-bg)] flex items-center justify-center',
                    { 'ring-2 ring-[var(--ui-primary)]': isCompositeSelected(cat.key, opt) },
                  ]"
                  :aria-label="prettyName(opt.primary.name)"
                  @click="selectComposite(cat.key, opt)"
                >
                  <img
                    :src="thumbnailSrc(opt.primary)"
                    :alt="prettyName(opt.primary.name)"
                    class="max-w-full max-h-full object-contain select-none pointer-events-none"
                  />
                </UButton>
              </div>
            </div>
          </template>
        </UCollapsible>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, computed, watch } from 'vue'

  type CategoryKey = 'top' | 'middle' | 'bottom' | 'base'

  type LayerItem = {
    name: string
    x: number
    y: number
    width: number
    height: number
    z: number
    category: CategoryKey
    goesWith?: string
  }

  type Structure = {
    base: { width: number; height: number }
    layers: LayerItem[]
  }

  const emit = defineEmits<{
    (e: 'change', value: Record<'top' | 'middle' | 'bottom', LayerItem | null>): void
  }>()

  const previewRef = ref<HTMLElement | null>(null)
  const containerWidth = ref(0)
  const containerHeight = ref(0)

  const baseSize = ref({ width: 1300, height: 1500 })
  const layers = ref<LayerItem[]>([])

  const byCategory = computed<Record<CategoryKey, LayerItem[]>>(() => {
    const acc: Record<CategoryKey, LayerItem[]> = { base: [], top: [], middle: [], bottom: [] }
    for (const l of layers.value) acc[l.category].push(l)
    return acc
  })

  const selected = ref<Record<'top' | 'middle' | 'bottom', LayerItem | null>>({
    top: null,
    middle: null,
    bottom: null,
  })

  // Open state for collapsibles (so we can bind rotation deterministically)
  const openMap = ref<Record<'top' | 'middle' | 'bottom', boolean>>({
    top: true,
    middle: true,
    bottom: true,
  })

  const selectableCategories = [
    { key: 'top', label: 'Haut', icon: 'i-lucide-chevrons-up' },
    { key: 'middle', label: 'Milieu', icon: 'i-lucide-minus' },
    { key: 'bottom', label: 'Bas', icon: 'i-lucide-chevrons-down' },
  ] as const

  function prettyName(name: string) {
    return name.replaceAll('_', ' ')
  }

  function selectNone(key: 'top' | 'middle' | 'bottom') {
    selected.value[key] = null
  }

  // (obsolete) direct item selection handled via composites

  // Composite options (groups items that go together as a single selectable option)
  type CompositeOption = { key: string; primary: LayerItem; layers: LayerItem[] }

  const displayOptionsByCategory = computed<Record<'top' | 'middle' | 'bottom', CompositeOption[]>>(
    () => {
      const out: Record<'top' | 'middle' | 'bottom', CompositeOption[]> = {
        top: [],
        middle: [],
        bottom: [],
      }
      ;(['top', 'middle', 'bottom'] as const).forEach((cat) => {
        const items = (byCategory.value[cat] || []).slice()
        const visited = new Set<string>()
        for (const item of items) {
          if (visited.has(item.name)) continue
          let group: LayerItem[] = [item]
          if (item.goesWith) {
            const companion = items.find((i) => i.name === item.goesWith)
            if (companion) {
              group = [item, companion]
              visited.add(companion.name)
            }
          }
          visited.add(item.name)
          const primary = group.reduce((a, b) => (a.z >= b.z ? a : b))
          const key = group
            .map((g) => g.name)
            .sort()
            .join('+')
          out[cat].push({ key, primary, layers: group })
        }
      })
      return out
    }
  )

  function isCompositeSelected(key: 'top' | 'middle' | 'bottom', opt: CompositeOption) {
    const cur = selected.value[key]
    if (!cur) return false
    return opt.layers.some((l) => l.name === cur.name)
  }

  function selectComposite(key: 'top' | 'middle' | 'bottom', opt: CompositeOption) {
    selected.value[key] = opt.primary
  }

  function thumbnailSrc(item: LayerItem) {
    const catFolder: Record<CategoryKey, string> = {
      base: 'Base',
      top: 'Top',
      middle: 'Middle',
      bottom: 'Bottom',
    }
    return `/PigGenerator/${catFolder[item.category]}/${item.name}.svg`
  }

  function resetAll() {
    selected.value = { top: null, middle: null, bottom: null }
  }

  function generateRandom() {
    const out: Record<'top' | 'middle' | 'bottom', LayerItem | null> = {
      top: null,
      middle: null,
      bottom: null,
    }
    ;(['top', 'middle', 'bottom'] as const).forEach((key) => {
      const options = byCategory.value[key]
      if (!options || options.length === 0) return
      const idx = Math.floor(Math.random() * options.length)
      out[key] = options[idx] ?? null
    })
    selected.value = out
  }

  // Render calculation
  const scaleX = computed(() =>
    containerWidth.value > 0 ? containerWidth.value / baseSize.value.width : 1
  )
  const scaleY = computed(() =>
    containerHeight.value > 0 ? containerHeight.value / baseSize.value.height : 1
  )

  // Prepare list of images to render (base + selected + their dependencies)
  const renderedLayers = computed(() => {
    const imgs: Array<{
      key: string
      src: string
      width: number
      height: number
      left: number
      top: number
      z: number
    }> = []

    const catFolder: Record<CategoryKey, string> = {
      base: 'Base',
      top: 'Top',
      middle: 'Middle',
      bottom: 'Bottom',
    }

    function pushLayer(l: LayerItem) {
      const width = l.width * scaleX.value
      const height = l.height * scaleY.value
      const left = l.x * scaleX.value - width / 2
      const top = l.y * scaleY.value - height / 2
      imgs.push({
        key: l.category + ':' + l.name,
        src: `/PigGenerator/${catFolder[l.category]}/${l.name}.svg`,
        width,
        height,
        left,
        top,
        z: l.z,
      })
    }

    // Always base
    for (const b of byCategory.value.base || []) pushLayer(b)

    // Selected per category
    for (const key of ['top', 'middle', 'bottom'] as const) {
      const item = selected.value[key]
      if (!item) continue
      pushLayer(item)
      // Handle companion in same category
      if (item.goesWith) {
        const companion = byCategory.value[key].find((i) => i.name === item.goesWith)
        if (companion) pushLayer(companion)
      }
    }

    // Sort by z to ensure stacking order (lower first)
    imgs.sort((a, b) => a.z - b.z)
    return imgs
  })

  // Expose changes upstream
  watch(selected, (v) => emit('change', v), { deep: true })

  onMounted(async () => {
    // Resize observer to keep aspect
    const el = previewRef.value
    if (el) {
      const ro = new ResizeObserver(() => {
        const width = el.clientWidth
        const height = Math.round((width * baseSize.value.height) / baseSize.value.width)
        containerWidth.value = width
        containerHeight.value = height
        // sync aspect by setting inline height to avoid layout shift
        ;(el as HTMLElement).style.height = height + 'px'
      })
      ro.observe(el)
    }

    // Fetch structure.json from public
    const res = await fetch('/PigGenerator/structure.json')
    const data = (await res.json()) as Structure
    baseSize.value = { ...data.base }
    layers.value = data.layers
  })
</script>

<style scoped>
  .bulle-bg-subtle {
    background:
      radial-gradient(
        ellipse at top left,
        color-mix(in oklab, var(--ui-bg) 92%, transparent) 0%,
        transparent 70%
      ),
      radial-gradient(
        ellipse at bottom right,
        color-mix(in oklab, var(--ui-bg) 92%, transparent) 0%,
        transparent 70%
      ),
      var(--ui-bg);
  }
</style>
