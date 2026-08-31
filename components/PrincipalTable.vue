<script setup lang="ts">
import { computed } from 'vue'
import type { PrincipalItem } from '~/types/info'

// Formata o valor numérico em moeda BRL
const formatCurrency = (val: number | string) => {
  const num = typeof val === 'string' ? parseFloat(val) : val
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0)
}

// Formata a data ISO/Date para string no padrão BR
const formatDate = (dateStr: string | Date) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date)
}

// Busca os dados da tabela 'aportes' no backend
const { data: aportes, pending, refresh } = await useFetch('/api/aportes')

// Formata os dados para exibição
const formattedItems = computed<PrincipalItem[]>(() => {
  if (!aportes.value) return []
  return aportes.value.map((item) => ({
    id: item.id,
    data: formatDate(item.data_aporte),
    valor: formatCurrency(Number(item.valor)),
    observacoes: item.observacoes || item.origem || '-'
  }))
})

defineExpose({ refresh })
</script>

<template>
  <section>
    <div class="flex justify-between items-center mb-3">
      <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Principal (Aportes)</h3>
      <button 
        @click="() => refresh()" 
        class="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
      >
        Atualizar
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs max-w-2xl">
      <!-- State: Loading -->
      <div v-if="pending" class="p-6 text-center text-xs text-slate-400 font-medium">
        Carregando aportes...
      </div>

      <!-- State: Vazio -->
      <div v-else-if="!formattedItems.length" class="p-6 text-center text-xs text-slate-400 font-medium">
        Nenhum aporte registrado.
      </div>

      <!-- Tabela -->
      <table v-else class="w-full text-left text-xs md:text-sm">
        <thead class="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold">
          <tr>
            <th class="p-3">Data</th>
            <th class="p-3">Valor Aporte</th>
            <th class="p-3">Observações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-800">
          <tr v-for="(row, idx) in formattedItems" :key="row.id || idx" class="hover:bg-slate-50">
            <td class="p-3 font-medium whitespace-nowrap">{{ row.data }}</td>
            <td class="p-3 font-bold text-slate-900 whitespace-nowrap">{{ row.valor }}</td>
            <td class="p-3 text-slate-600 whitespace-nowrap">{{ row.observacoes }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>