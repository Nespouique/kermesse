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
      <UModal 
        v-model:open="isModalOpen"
        title="Mon pari"
        :ui="{
          header: 'text-2xl font-bold'
        }"
      >
        <UButton 
          label="Prendre un ticket" 
          icon="i-lucide-ticket-slash" 
          size="xl" 
          class="font-semibold rounded-full mx-auto px-4 py-3 sm:px-6 sm:py-4 text-lg sm:text-xl"
          @click="isModalOpen = true"
        />

        <template #body>
          <TicketForm @submit="handleTicketSubmit" @close="closeModal" />
        </template>
      </UModal>
    </div>

  </UContainer>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import CountdownBlock from '~/components/Countdown.vue'
import TicketForm from '~/components/TicketForm.vue'
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
const isModalOpen = ref(false)

onMounted(() => {
  isMounted.value = true
})

function handleTicketSubmit(data: {
  isMale: boolean
  estimatedDate: unknown
  weight: number
  firstName: string
}) {
  console.log('Ticket reçu dans la page parent:', data)
  // TODO: Ici on pourra intégrer avec Supabase
}

function closeModal() {
  isModalOpen.value = false
}
</script>
