<template>
  <UContainer>
    <!-- Switch en haut à droite -->
    <div class="flex justify-end">
      <USwitch :model-value="isMounted ? isDark : false" color="neutral" size="lg" unchecked-icon="i-lucide-sun"
        checked-icon="i-lucide-moon" @update:model-value="val => { if (isMounted) isDark = val }" />
    </div>

    <!-- Section image + titre -->
    <div class="flex flex-col sm:flex-row items-center gap-6 mb-6">
      <div
        class="rounded-full shadow-xl flex items-center justify-center shrink-0 bulle-bg-subtle max-w-[200px] aspect-square mx-auto sm:w-44 sm:h-44 sm:max-w-none sm:mx-0 md:w-56 md:h-56">
        <img src="/kermesse.svg" alt="Kermesse" class="object-contain w-4/5 h-4/5 max-w-full max-h-full">
      </div>
      <div class="text-center sm:text-left">
        <h1 class="font-bold mb-6 sm:mb-2 drop-shadow-lg text-5xl">Kermesse du Bébé</h1>
        <h2 class="text-xl font-medium">
          Inspiré des kermesses bretonnes où les participants parient sur le poids d'un cochon.
          <br>Ici, c'est notre petit cochon à naître qui fait l'objet de tous les paris !
          <br>Que la tradition continue...
        </h2>
      </div>
    </div>

    <CountdownBlock class="mb-8 sm:mb-12" />

    <div class="flex justify-center">
      <UButton icon="i-lucide-ticket-slash" size="xl" color="neutral" class="font-semibold rounded-full mx-auto px-4 py-3 sm:px-6 sm:py-4 text-lg sm:text-xl">
        Prendre un ticket
      </UButton>
    </div>

  </UContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CountdownBlock from '~/components/Countdown.vue'
import { useColorMode } from '@vueuse/core'

const colorMode = useColorMode()
const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set(_isDark) {
    colorMode.value = _isDark ? 'dark' : 'light'
  }
})

const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})

</script>
