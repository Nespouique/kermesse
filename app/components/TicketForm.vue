<template>
    <div>
        <form class="space-y-9" @submit.prevent="submitTicket">
            <!-- Première ligne : Sexe + Date -->
            <div class="grid grid-cols-2 gap-10">
                <!-- Sexe de l'enfant avec Switch -->
                <div>
                    <label class="block text-sm font-medium mb-3">Fille / Garçon ? *</label>
                    <div class="flex items-center justify-center gap-2">
                        <div class="flex items-center">
                            <UIcon name="i-lucide-venus" class="w-5 h-5 text-pink-500" />
                        </div>
                        <USwitch v-model="formData.isMale" :color="formData.isMale ? 'info' : 'error'" size="lg" :ui="{
                            base: formData.isMale
                                ? 'data-[state=unchecked]:bg-rose-300 data-[state=checked]:bg-blue-400'
                                : 'data-[state=unchecked]:bg-rose-300 data-[state=checked]:bg-blue-400'
                        }" />
                        <div class="flex items-center">
                            <UIcon name="i-lucide-mars" class="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                </div>

                <!-- Date estimée avec Calendar -->
                <div>
                    <label class="block text-sm font-medium mb-3">Date estimée *</label>
                    <UPopover>
                        <UButton color="neutral" variant="outline" class="w-full"
                            icon="i-lucide-calendar">
                            {{ calendarDate ? df.format((calendarDate as
                                CalendarDate).toDate(getLocalTimeZone())) : 'Sélectionner une date' }}
                        </UButton>

                        <template #content>
                            <!-- @ts-ignore : Problème de types complexes avec @internationalized/date -->
                            <UCalendar v-model="calendarDate" class="p-2" locale="fr-FR" :week-start-on="1" />
                        </template>
                    </UPopover>
                </div>
            </div>

            <!-- Deuxième ligne : Poids + Prénom -->
            <div class="grid grid-cols-2 gap-10">
                <!-- Poids avec Slider -->
                <div>
                    <label class="block text-sm font-medium mb-3">Poids estimé (kg) *</label>
                    <div class="space-y-3">
                        <USlider v-model="formData.weight" :min="2" :max="5" :step="0.1" color="primary" size="lg" />
                        <div class="text-center">
                            <span class="text-sm font-medium">{{ formData.weight.toFixed(1) }} kg</span>
                        </div>
                    </div>
                </div>

                <!-- Prénom optionnel -->
                <div>
                    <label class="block text-sm font-medium mb-3">Prénom (optionnel)</label>
                    <UInput v-model="formData.firstName" placeholder="Entrez un prénom" color="primary" variant="outline" class="w-full" />
                </div>
            </div>

            <!-- Boutons d'action -->
            <div class="flex gap-3 pt-4">
                <UButton label="Annuler" color="primary" variant="outline" size="lg" class="flex-1 justify-center" @click="emit('close')" />
                <UButton label="Confirmer" type="submit" color="primary" variant="solid" size="lg" class="flex-1 justify-center" />
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { DateFormatter, getLocalTimeZone, CalendarDate } from '@internationalized/date'

// Définir les événements émis
const emit = defineEmits<{
    close: []
    submit: [data: {
        isMale: boolean
        estimatedDate: unknown
        weight: number
        firstName: string
    }]
}>()

// Référence séparée pour le calendrier - type any pour éviter les conflits de types complexes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const calendarDate = shallowRef(new CalendarDate(2026, 1, 22))

// Données du formulaire
const formData = ref({
    isMale: false, // false = fille, true = garçon
    weight: 3.5, // poids en kg
    firstName: '' // prénom optionnel
})

// Formatter pour les dates
const df = new DateFormatter('fr-FR', {
    dateStyle: 'long'
})
// La date est maintenant initialisée directement dans la définition de formData

// Fonction de soumission
function submitTicket() {
    console.log('Données du ticket:', formData.value)

    // Émettre les données vers le parent
    emit('submit', {
        isMale: formData.value.isMale,
        estimatedDate: calendarDate.value,
        weight: formData.value.weight,
        firstName: formData.value.firstName
    })

    // TODO: Intégrer avec Supabase plus tard
    alert('Ticket soumis ! (pour le moment juste un log)')

    // Fermer la modal
    emit('close')
}
</script>
