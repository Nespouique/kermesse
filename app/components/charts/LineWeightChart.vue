<template>
  <div class="relative w-full h-full min-h-0">
    <canvas
      ref="canvasEl"
      class="w-full h-full block"
      aria-label="Distribution des poids"
      role="img"
    ></canvas>
  </div>
</template>
<script setup lang="ts">
  import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
  import { Chart } from 'chart.js'

  interface WeightCount {
    weight: string
    count: number
  }
  const props = defineProps<{ weightsCounts: WeightCount[] }>()

  const canvasEl = ref<HTMLCanvasElement | null>(null)
  let chart: Chart | null = null

  const uiText = getComputedStyle(document.documentElement).getPropertyValue('--ui-text')
  console.log('uiText', uiText)

  function render() {
    if (!canvasEl.value) return
    if (chart) {
      chart.destroy()
      chart = null
    }
    const labels = props.weightsCounts.map((w) => w.weight)
    const data = props.weightsCounts.map((w) => w.count)
    chart = new Chart(canvasEl.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Nombre de votants',
            data,
            borderColor: 'rgba(99, 48, 138)',
            backgroundColor: 'rgba(99, 48, 138,0.15)',
            tension: 0.25,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: 'Poids (kg)' } },
          y: {
            title: { display: true, text: 'Votants' },
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
        plugins: { legend: { display: false } },
      },
    })
  }

  onMounted(render)
  watch(() => props.weightsCounts, render, { deep: true })
  onBeforeUnmount(() => {
    if (chart) chart.destroy()
  })
</script>
