import { useState } from '#app'

export const useAvatar = () => {
  const structure = useState<any>('avatarStructure', () => null)

  async function loadStructure() {
    if (!structure.value) {
      try {
        structure.value = await $fetch('/PigGenerator/structure.json')
      } catch (e) {
        console.error('Failed to load avatar structure', e)
      }
    }
  }

  function getLayers(bet: any, targetWidth = 64) {
    if (!structure.value) return []

    const origWidth = structure.value.base.width
    const scale = targetWidth / origWidth

    const layers: any[] = []
    const pushed = new Set<string>()

    function push(meta: any) {
      if (!meta) return
      if (pushed.has(meta.name)) return
      pushed.add(meta.name)
      layers.push(meta)
    }

    function addWithCompanion(name: string | null) {
      if (!name) return
      const meta = structure.value.layers.find((l: any) => l.name === name)
      if (!meta) return
      push(meta)
      if (meta.goesWith) {
        const companion = structure.value.layers.find((l: any) => l.name === meta.goesWith)
        push(companion)
      }
    }

    const baseLayers = structure.value.layers.filter((l: any) => l.category === 'base')
    
    // Base
    baseLayers.forEach((l: any) => push(l))
    // Catégories sélectionnées
    addWithCompanion(bet.middle_layer)
    addWithCompanion(bet.top_layer)
    addWithCompanion(bet.bottom_layer)

    // Tri par z
    layers.sort((a, b) => a.z - b.z)

    function categoryFolder(cat: string) {
      switch (cat) {
        case 'base': return 'Base'
        case 'top': return 'Top'
        case 'middle': return 'Middle'
        case 'bottom': return 'Bottom'
        default: return ''
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
    getLayers
  }
}
