<template>
    <NuxtLayout name="dashboard">
      <!-- Header Page -->
      <div class="flex justify-end border-b border-slate-200 pb-2">
        <h2 class="text-2xl font-light text-[#556b2f]">Relatório de Performance</h2>
      </div>
  
      <!-- KPI Section -->
      <KpiCards />
  
      <!-- Donut Charts Section -->
      <DonutSection />
  
      <!-- Bar Chart Section -->
      <WeeklyBarChart />
    </NuxtLayout>
  </template>