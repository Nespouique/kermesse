<template>
  <div class="w-52 h-52">
    <canvas ref="canvasEl" aria-label="Répartition garçon fille" role="img"></canvas>
  </div>
</template>
<script setup lang="ts">
  import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
  import { Chart } from 'chart.js'

  const props = defineProps<{ male: number; female: number }>()
  const canvasEl = ref<HTMLCanvasElement | null>(null)
  let chart: Chart | null = null

  function render() {
    if (!canvasEl.value) return
    if (chart) {
      chart.destroy()
      chart = null
    }
    chart = new Chart(canvasEl.value, {
      type: 'pie',
      data: {
        labels: ['Garçon', 'Fille'],
        datasets: [
          {
            data: [props.male, props.female],
            backgroundColor: ['#3b82f6', '#ec4899'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: { label: (ctx) => `${ctx.label}: ${ctx.parsed} (${totalPct(ctx.parsed)})` },
          },
        },
      },
    })
  }
  function totalPct(value: number) {
    const total = props.male + props.female
    if (!total) return '0%'
    return ((value / total) * 100).toFixed(1) + '%'
  }

  onMounted(render)
  watch(() => [props.male, props.female], render)
  onBeforeUnmount(() => {
    if (chart) chart.destroy()
  })
</script>
