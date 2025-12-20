<script setup lang="ts">
import { computed } from "vue";
import katex from "katex";
import "katex/dist/katex.min.css";

const props = defineProps<{
  formula: string;
  displayMode?: boolean;
}>();

const renderedFormula = computed(() => {
  return katex.renderToString(props.formula, {
    throwOnError: false,
    displayMode: props.displayMode ?? true,
  });
});
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- KaTeX output is safe, formulas come from source code -->
  <span class="math-formula" v-html="renderedFormula" />
</template>

<style scoped>
.math-formula {
  display: inline-block;
}

.math-formula :deep(.katex) {
  font-size: 1.1em;
}
</style>
