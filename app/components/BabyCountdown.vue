<template>
  <UCard class="shadow-lg p-2 sm:p-4">
    <template #header>
      <div class="flex items-center justify-center gap-2 text-center w-full">
        <Clock4 class="w-5 h-5 sm:w-7 sm:h-7" />
        <!-- Utilise uniquement les classes responsive pour éviter un mismatch SSR/CSR -->
        <span class="text-lg sm:text-3xl font-semibold">
          <span class="sm:hidden">Arrivée prévue le 22 janvier</span>
          <span class="hidden sm:inline">Livraison du colis prévue le 22 janvier 2026</span>
        </span>
      </div>
    </template>

    <div class="grid grid-cols-3 gap-4 text-center">
      <template v-if="isLoading">
        <USkeleton class="h-25 sm:h-31 rounded-2xl" />
        <USkeleton class="h-25 sm:h-31 rounded-2xl" />
        <USkeleton class="h-25 sm:h-31 rounded-2xl" />
      </template>
      <template v-else>
        <UCard variant="subtle">
          <div class="flex flex-col items-center">
            <span class="text-4xl sm:text-5xl font-bold mb-2">
              {{ countdown.days.toString().padStart(2, '0') }}
            </span>
            <span class="text-sm uppercase tracking-wider">JOURS</span>
          </div>
        </UCard>
        <UCard variant="subtle">
          <div class="flex flex-col items-center">
            <span class="text-4xl sm:text-5xl font-bold mb-2">
              {{ countdown.hours.toString().padStart(2, '0') }}
            </span>
            <span class="text-sm uppercase tracking-wider">HEURES</span>
          </div>
        </UCard>
        <UCard variant="subtle">
          <div class="flex flex-col items-center">
            <span class="text-4xl sm:text-5xl font-bold mb-2">
              {{ countdown.minutes.toString().padStart(2, '0') }}
            </span>
            <span class="text-sm uppercase tracking-wider">MINUTES</span>
          </div>
        </UCard>
      </template>
    </div>
  </UCard>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { Clock4 } from 'lucide-vue-next'

  const targetDate = new Date('2026-01-22T00:00:00')
  const countdown = ref({ days: 0, hours: 0, minutes: 0 })
  const isLoading = ref(true)
  let interval: ReturnType<typeof setInterval>

  function updateCountdown() {
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()
    if (diff > 0) {
      countdown.value = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
      }
    } else {
      countdown.value = { days: 0, hours: 0, minutes: 0 }
    }
    isLoading.value = false
  }

  onMounted(() => {
    updateCountdown()
    interval = setInterval(updateCountdown, 1000)
  })
  onUnmounted(() => clearInterval(interval))

  // Plus de logique conditionnelle côté rendu pour éviter mismatch hydration
</script>
