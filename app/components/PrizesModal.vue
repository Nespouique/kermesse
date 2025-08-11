<template>
  <ClientOnly>
    <UModal
      v-model:open="internalOpen"
      title="Lots en jeu ! 🎁"
      :ui="{
        header: 'flex justify-center',
        title: 'w-full text-center text-3xl font-extrabold',
        footer: 'justify-center',
      }"
    >
      <template #body>
        <div class="space-y-6 py-4 px-2">
          <ul class="space-y-4 text-sm list-none pb-4">
            <li class="flex gap-3 items-center">
              <UIcon name="i-lucide-sparkles" mode="css" class="prismatic-icon shrink-0 mt-0.5" />

              <span>Prix tout est bon dans le cochon !</span>
            </li>

            <li class="flex gap-3 items-center">
              <UIcon name="i-lucide-medal" class="text-yellow-500 shrink-0 mt-0.5" />
              <span>1ère place : Repas au restaurant</span>
            </li>
            <li class="flex gap-3 items-center">
              <UIcon
                name="i-lucide-medal"
                class="text-gray-400 dark:text-gray-300 shrink-0 mt-0.5"
              />
              <span>2ème place : Bouteille de champagne</span>
            </li>
            <li class="flex gap-3 items-center">
              <UIcon
                name="i-lucide-medal"
                class="text-amber-800 dark:text-amber-600 shrink-0 mt-0.5"
              />
              <span>3ème place : Terrines bretonnes</span>
            </li>
          </ul>
          <details class="text-xs text-[var(--ui-text-dimmed)] group">
            <summary
              class="cursor-pointer text-[var(--ui-text)] flex items-center gap-1 select-none"
            >
              <UIcon
                name="i-lucide-chevron-down"
                class="w-4 h-4 opacity-70 transition-transform group-open:rotate-180"
              />
              <i>Calcul des scores</i>
            </summary>
            <div class="mt-2">
              Le classement est établi en fonction de la proximité cumulée sur la date de naissance
              (jours d'écart), le sexe et l'écart de poids. En cas d'égalité parfaite, priorité au
              pari le plus ancien.
            </div>
          </details>
        </div>
      </template>
      <template #footer>
        <UButton color="neutral" variant="solid" @click="emit('update:modelValue', false)">
          <span>Fermer</span>
        </UButton>
      </template>
    </UModal>
  </ClientOnly>
</template>
<script setup lang="ts">
  const props = defineProps<{ modelValue: boolean }>()
  const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
  const internalOpen = computed({
    get: () => props.modelValue,
    set: (v: boolean) => emit('update:modelValue', v),
  })
</script>
