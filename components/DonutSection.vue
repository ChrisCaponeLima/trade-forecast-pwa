<script setup lang="ts">
interface DonutSegment {
  color: string
  dashArray: string
  dashOffset: string
}

const segments: DonutSegment[] = [
  { color: '#689f38', dashArray: '25 75', dashOffset: '0' },
  { color: '#00b0ff', dashArray: '25 75', dashOffset: '-25' },
  { color: '#0091ea', dashArray: '25 75', dashOffset: '-50' },
  { color: '#0288d1', dashArray: '25 75', dashOffset: '-75' }
]
</script>

<template>
  <!-- Mantém 3 colunas no mobile e no desktop com espaçamento responsivo -->
  <div class="grid grid-cols-3 gap-2 md:gap-6 my-4 md:my-6">
    <div 
      v-for="i in 3" 
      :key="i" 
      class="flex flex-col items-center justify-center p-2 md:p-4 bg-white border border-slate-100 rounded-sm shadow-xs h-24 md:h-auto"
    >
      <!-- No mobile: miniatura (w-14 h-14) | No PC (md:): tamanho original (w-40 h-40) -->
      <div class="relative w-14 h-14 md:w-40 md:h-40">
        <svg viewBox="0 0 42 42" class="w-full h-full -rotate-90">
          <circle 
            v-for="(seg, idx) in segments" 
            :key="idx"
            cx="21" 
            cy="21" 
            r="15.91549430918954" 
            fill="transparent" 
            :stroke="seg.color" 
            stroke-width="7" 
            :stroke-dasharray="seg.dashArray" 
            :stroke-dashoffset="seg.dashOffset" 
          />
        </svg>
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span class="text-[10px] md:text-xs font-semibold text-slate-500">25.0%</span>
        </div>
      </div>
    </div>
  </div>
</template>