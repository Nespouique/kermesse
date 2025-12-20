import { useState } from '#app'

type LayerCategory = 'base' | 'top' | 'middle' | 'bottom'

interface LayerMeta {
  name: string
  x: number
  y: number
  width: number
  height: number
  z: number
  category: LayerCategory
  goesWith?: string
}

interface StructureJson {
  base: { width: number; height: number }
  layers: LayerMeta[]
}

export interface BetAvatarSelection {
  top_layer: string | null
  middle_layer: string | null
  bottom_layer: string | null
}

export interface AvatarImageLayer {
  key: string
  src: string
  width: number
  height: number
  left: number
  top: number
  z: number
}

export const useAvatar = () => {
  const structure = useState<StructureJson | null>('avatarStructure', () => null)

  async function loadStructure() {
    if (!structure.value) {
      try {
        structure.value = await $fetch<StructureJson>('/PigGenerator/structure.json')
      } catch (error) {
        console.error('Failed to load avatar structure', error)
      }
    }
  }

  function getLayers(bet: BetAvatarSelection, targetWidth = 64): AvatarImageLayer[] {
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
      if (!name) return
      const meta = structure.value.layers.find((l) => l.name === name)
      if (!meta) return
      push(meta)
      if (meta.goesWith) {
        const companion = structure.value.layers.find((l) => l.name === meta.goesWith)
        push(companion)
      }
    }

    const baseLayers = structure.value.layers.filter((l) => l.category === 'base')

    // Base
    baseLayers.forEach((l) => push(l))
    // Catégories sélectionnées
    addWithCompanion(bet.middle_layer)
    addWithCompanion(bet.top_layer)
    addWithCompanion(bet.bottom_layer)

    // Tri par z
    layers.sort((a, b) => a.z - b.z)

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

  return {
    loadStructure,
    getLayers,
  }
}
