<script setup lang="ts">
import { ref } from 'vue'

interface KpiItem {
  label: string
  value: string
  icon: string
}

const isExpanded = ref<boolean>(false)

const kpis: KpiItem[] = [
  { label: 'Realizado', value: 'R$ 2.684,90', icon: 'check-circle' },
  { label: 'Forecast', value: 'R$ 3.000,00', icon: 'trending-up' },
  { label: 'Retiradas', value: 'R$ 0,00', icon: 'arrow-down-circle' },
  { label: 'Agregado', value: 'R$ 2.684,90', icon: 'layers' },
  { label: 'Principal', value: 'R$ 23.549,00', icon: 'wallet' }
]
</script>

<template>
  <div class="my-4">
    <!-- Grid base de 6 colunas no mobile, ajustando para 5 colunas no desktop -->
    <div class="grid grid-cols-6 md:grid-cols-5 gap-2 md:gap-3">
      <div 
        v-for="(card, index) in kpis" 
        :key="index"
        :class="[
          'bg-[#dce6d5] border border-[#c4d4b9] p-2 rounded-sm shadow-xs flex flex-col justify-between h-16 md:h-18 transition-all duration-200',
          /* Configuração de colunas: 3 primeiros (2 cols), 2 últimos (3 cols no mobile / 1 col no PC) */
          index < 3 ? 'col-span-2 md:col-span-1' : 'col-span-3 md:col-span-1',
          /* Suprime a segunda linha no mobile por padrão se isExpanded for false. No PC (md:) sempre visível */
          index >= 3 && !isExpanded ? 'hidden md:flex' : 'flex'
        ]"
      >
        <div class="flex items-center justify-between space-x-1">
          <span class="text-[10px] md:text-xs text-slate-700 font-semibold truncate leading-tight">
            {{ card.label }}
          </span>

          <!-- Ícones SVG Nativos -->
          <svg 
            v-if="card.icon === 'check-circle'" 
            class="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-700 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>

          <svg 
            v-else-if="card.icon === 'trending-up'" 
            class="w-3.5 h-3.5 md:w-4 md:h-4 text-sky-700 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>

          <svg 
            v-else-if="card.icon === 'arrow-down-circle'" 
            class="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-700 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
          </svg>

          <svg 
            v-else-if="card.icon === 'layers'" 
            class="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-700 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>

          <svg 
            v-else-if="card.icon === 'wallet'" 
            class="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-700 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>

        <span class="block text-xs md:text-sm lg:text-base font-bold text-slate-900 truncate mt-1">
          {{ card.value }}
        </span>
      </div>
    </div>

    <!-- Botão de Expandir / Recolher visível apenas no mobile -->
    <div class="mt-2 flex justify-center md:hidden">
      <button 
        @click="isExpanded = !isExpanded"
        class="flex items-center space-x-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-200/60 px-2.5 py-1 rounded-full transition-colors"
      >
        <span>{{ isExpanded ? 'Recolher métricas' : 'Ver mais métricas (+2)' }}</span>
        <svg 
          class="w-3 h-3 transition-transform duration-200" 
          :class="{ 'rotate-180': isExpanded }" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  </div>
</template>