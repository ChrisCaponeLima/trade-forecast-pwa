<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const chartData = {
  labels: ['agosto - Q1', 'agosto - Q2', 'agosto - Q3', 'agosto - Q4'],
  datasets: [{
    data: [25, 25, 25, 25],
    backgroundColor: ['#689f38', '#00b0ff', '#0091ea', '#0288d1'],
    borderWidth: 1,
    borderColor: '#ffffff'
  }]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  cutout: '65%'
}
</script>

<template>
  <div class="grid grid-cols-3 gap-6 my-6">
    <div v-for="i in 3" :key="i" class="flex flex-col items-center justify-center relative h-48">
      <Doughnut :data="chartData" :options="chartOptions" />
      <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span class="text-xs font-semibold text-slate-500">25.0%</span>
      </div>
    </div>
  </div>
</template>