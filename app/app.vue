<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
  import { useHead } from '#imports'

  useHead({
    bodyAttrs: {
      class: 'kermesse-bg',
    },
  })
</script>
