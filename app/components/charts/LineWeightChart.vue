<template>
  <div class="w-full overflow-x-auto">
    <div class="width-full">
      <canvas ref="canvasEl" aria-label="Distribution des poids" role="img"></canvas>
    </div>
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
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.15)',
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
            title: { display: false, text: 'Votants' },
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
