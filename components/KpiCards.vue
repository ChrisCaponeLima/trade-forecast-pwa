<script setup lang="ts">
const kpis = [
  { label: 'Realizado', value: 'R$ 2.684,90' },
  { label: 'Forecast', value: 'R$ 3.000,00' },
  { label: 'Retiradas', value: 'R$ 0,00' },
  { label: 'Agregado', value: 'R$ 2.684,90' },
  { label: 'Principal', value: 'R$ 23.549,00' },
]
</script>

<template>
  <div class="grid grid-cols-5 gap-4">
    <div 
      v-for="(card, index) in kpis" 
      :key="index"
      class="bg-[#dce6d5] border border-[#c4d4b9] p-3 rounded-sm shadow-sm"
    >
      <span class="block text-xs text-slate-600 font-medium mb-1">{{ card.label }}</span>
      <span class="block text-lg font-bold text-slate-900">{{ card.value }}</span>
    </div>
  </div>
</template>