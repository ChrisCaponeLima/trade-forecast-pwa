<script setup lang="ts">
export interface ForecastRow {
  semana: string
  semanaNum: number
  metaRendimento: string
  metaAcumulada: string
  resultadoRealizado: string
  devidoChris: string
  devidoVania: string
  metaAtingidaPct: string
  isNegative: boolean
}

defineProps<{
  items: ForecastRow[]
  loading: boolean
  disponiveisMeses: string[]
  selectedMonthKey: string
  getMonthLabel: (key: string) => string
}>()

const emit = defineEmits<{
  (e: 'update:selectedMonthKey', value: string): void
}>()
</script>

<template>
  <section>
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Forecast de Rendimento</h3>
        <span v-if="loading" class="text-xs text-slate-400">Calculando metas...</span>
      </div>

      <div class="flex items-center gap-2">
        <label for="mes-select" class="text-xs font-semibold text-slate-500">Mês de Referência:</label>
        <select 
          id="mes-select"
          :value="selectedMonthKey" 
          @change="emit('update:selectedMonthKey', ($event.target as HTMLSelectElement).value)"
          class="bg-white border border-slate-300 rounded-lg px-3 py-1 text-xs font-medium text-slate-800 shadow-xs focus:ring-2 focus:ring-[#556b2f] outline-hidden"
        >
          <option v-for="mesKey in disponiveisMeses" :key="mesKey" :value="mesKey">
            {{ getMonthLabel(mesKey) }}
          </option>
        </select>
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
      <table class="w-full text-left text-xs md:text-sm">
        <thead class="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
          <tr>
            <th class="p-3">Semana</th>
            <th class="p-3 text-center">Nº</th>
            <th class="p-3">Meta Rend.</th>
            <th class="p-3">Meta Acum.</th>
            <th class="p-3">Resultado Realizado</th>
            <th class="p-3">Devido Chris</th>
            <th class="p-3">Devido Vânia</th>
            <th class="p-3">% Meta Atingida</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-800">
          <tr v-for="(row, idx) in items" :key="idx" class="hover:bg-slate-50 transition-colors">
            <td class="p-3 font-medium whitespace-nowrap capitalize">{{ row.semana }}</td>
            <td class="p-3 text-center text-slate-400 whitespace-nowrap">{{ row.semanaNum }}</td>
            <td class="p-3 text-slate-700 whitespace-nowrap">{{ row.metaRendimento }}</td>
            <td class="p-3 text-slate-700 whitespace-nowrap">{{ row.metaAcumulada }}</td>
            <td 
              :class="[
                'p-3 font-bold whitespace-nowrap', 
                row.isNegative ? 'text-rose-600' : 'text-emerald-600'
              ]"
            >
              {{ row.resultadoRealizado }}
            </td>
            <td class="p-3 whitespace-nowrap font-medium text-slate-700">{{ row.devidoChris }}</td>
            <td class="p-3 whitespace-nowrap font-medium text-slate-700">{{ row.devidoVania }}</td>
            <td 
              :class="[
                'p-3 font-semibold whitespace-nowrap',
                row.isNegative ? 'text-rose-600' : 'text-emerald-700'
              ]"
            >
              {{ row.metaAtingidaPct }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>