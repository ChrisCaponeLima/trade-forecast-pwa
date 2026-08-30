<script setup lang="ts">
definePageMeta({
  layout: 'default'
})
</script>

<template>
  <div>
    <!-- Header Page -->
    <div class="flex justify-end border-b border-slate-200 pb-2 mb-6">
      <h2 class="text-2xl font-light text-[#556b2f]">Relatório de Performance</h2>
    </div>

    <!-- Components auto-imported by Nuxt 3 -->
    <KpiCards />
    <DonutSection />
    <WeeklyBarChart />
  </div>
</template>