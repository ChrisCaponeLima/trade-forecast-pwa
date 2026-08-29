<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const data = {
  labels: ['agosto - Semana 1', 'agosto - Semana 2', 'agosto - Semana 3', 'agosto - Semana 4'],
  datasets: [
    { label: 'Meta Rendimento', backgroundColor: '#0288d1', data: [700, 700, 700, 700] },
    { label: 'Meta Acumulada', backgroundColor: '#0091ea', data: [700, 1400, 2100, 2800] },
    { label: 'Resultado Realizado', backgroundColor: '#00b0ff', data: [-600, 1600, -600, 2500] },
    { label: 'Devido Chris', backgroundColor: '#4fc3f7', data: [0, 600, 0, 1000] },
    { label: 'Devido Vânia', backgroundColor: '#81d4fa', data: [0, 600, 0, 1000] },
    { label: '% Meta Atingida', backgroundColor: '#b3e5fc', data: [0, 50, 0, 90] }
  ]
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'right' as const }
  },
  scales: {
    y: { min: -1000, max: 3000 }
  }
}
</script>

<template>
  <div class="bg-white p-4 border border-slate-200 rounded-sm h-72">
    <Bar :data="data" :options="options" />
  </div>
</template>