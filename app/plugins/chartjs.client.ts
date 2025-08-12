import {
  Chart,
  ArcElement,
  PieController,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { defineNuxtPlugin } from '#app'

Chart.register(
  ArcElement,
  PieController,
  LineController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

export default defineNuxtPlugin(() => {
  // Could expose chart if needed later
  return { provide: { chart: Chart } }
})
