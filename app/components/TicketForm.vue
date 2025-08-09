<template>
  <div>
    <form class="space-y-9" @submit.prevent="submitTicket">
      <h3 class="text-lg font-bold mb-6 text-center">Faites vos jeux !</h3>
      <div class="space-y-9">
        <!-- Première ligne : Sexe + Date -->
        <div class="grid grid-cols-2 gap-6 sm:gap-16">
          <!-- Sexe de l'enfant avec Switch -->
          <div>
            <label class="block text-sm font-medium mb-5">Fille / Garçon ? *</label>
            <div class="flex items-center justify-center gap-2">
              <div class="flex items-center">
                <UIcon name="i-lucide-venus" class="w-5 h-5 text-pink-500" />
              </div>
              <USwitch
                v-model="formData.isMale"
                :color="formData.isMale ? 'info' : 'error'"
                size="lg"
                :ui="{
                  base: formData.isMale
                    ? 'data-[state=unchecked]:bg-rose-300 data-[state=checked]:bg-blue-400'
                    : 'data-[state=unchecked]:bg-rose-300 data-[state=checked]:bg-blue-400',
                }"
              />
              <div class="flex items-center">
                <UIcon name="i-lucide-mars" class="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <!-- Date estimée avec Calendar -->
          <div>
            <label class="block text-sm font-medium mb-3">Date estimée *</label>
            <UPopover>
              <UButton color="neutral" variant="outline" class="w-full" icon="i-lucide-calendar">
                <template v-if="calendarDate">
                  <!-- Format court sur mobile -->
                  <span class="inline sm:hidden">
                    {{ dfShort.format((calendarDate as CalendarDate).toDate(getLocalTimeZone())) }}
                  </span>
                  <!-- Format long à partir du breakpoint sm -->
                  <span class="hidden sm:inline">
                    {{ dfLong.format((calendarDate as CalendarDate).toDate(getLocalTimeZone())) }}
                  </span>
                </template>
                <template v-else>Sélectionner une date</template>
              </UButton>

              <template #content>
                <!-- @ts-ignore : Problème de types complexes avec @internationalized/date -->
                <UCalendar v-model="calendarDate" class="p-2" locale="fr-FR" :week-start-on="1" />
              </template>
            </UPopover>
          </div>
        </div>

        <!-- Deuxième ligne : Poids + Prénom -->
        <div class="grid grid-cols-2 gap-6 sm:gap-16">
          <!-- Poids avec Slider -->
          <div>
            <label class="block text-sm font-medium">Poids estimé *</label>
            <div class="space-y-2">
              <div class="text-center">
                <span class="text-sm font-medium">{{ formData.weight.toFixed(1) }} kg</span>
              </div>
              <USlider
                v-model="formData.weight"
                :min="2"
                :max="5"
                :step="0.1"
                color="neutral"
                size="lg"
              />
            </div>
          </div>

          <!-- Prénom optionnel -->
          <div>
            <label class="block text-sm font-medium mb-3">Prénom (optionnel)</label>
            <UInput
              v-model="formData.firstName"
              placeholder="Entrez un prénom"
              color="primary"
              variant="outline"
              class="w-full"
            />
          </div>
        </div>
      </div>
      <!-- Plus de boutons ici, navigation gérée par le stepper parent -->
    </form>
  </div>
</template>

<script setup lang="ts">
  import { ref, shallowRef, watch } from 'vue'
  import { DateFormatter, getLocalTimeZone, CalendarDate } from '@internationalized/date'

  // Définir les événements émis
  const emit = defineEmits<{
    cancel: []
    change: [
      data: {
        isMale: boolean
        estimatedDate: unknown
        weight: number
        firstName: string
      },
    ]
  }>()

  // Référence séparée pour le calendrier
  const calendarDate = shallowRef(new CalendarDate(2026, 1, 22))

  // Données du formulaire
  const formData = ref({
    isMale: false, // false = fille, true = garçon
    weight: 3.5, // poids en kg
    firstName: '', // prénom optionnel
  })

  // Formatters de date : long (desktop) et court (mobile)
  const dfLong = new DateFormatter('fr-FR', { dateStyle: 'long' })
  const dfShort = new DateFormatter('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  // Watcher pour émettre les changements
  watch(
    [formData, calendarDate],
    () => {
      emit('change', {
        isMale: formData.value.isMale,
        estimatedDate: calendarDate.value,
        weight: formData.value.weight,
        firstName: formData.value.firstName,
      })
    },
    { deep: true, immediate: true }
  ) // immediate: true pour émettre les valeurs initiales

  // Fonction de soumission (maintenant juste pour validation)
  function submitTicket() {
    console.log('Formulaire validé:', formData.value)
  }
</script>
