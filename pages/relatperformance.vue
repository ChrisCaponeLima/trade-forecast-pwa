<script setup lang="ts">
import type { OperacaoPerformance } from '~/types/performance'

definePageMeta({
  layout: 'default'
})

// Busca os dados diretamente da API conectada ao Neon
const { data: operacoes, pending, error, refresh } = await useFetch<OperacaoPerformance[]>('/api/relatperformance', {
  default: () => []
})

const totalTaxas = ref<number>(0.00)

// Formatações
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val)
}

const formatDate = (dateString: string | Date) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Métricas Agregadas
const totalResultadoBruto = computed(() => {
  return operacoes.value.reduce((acc, op) => acc + Number(op.resIntervaloBruto), 0)
})

const totalContratos = computed(() => {
  return operacoes.value.reduce((acc, op) => acc + op.qtdCompra, 0)
})

const mediaPorOperacao = computed(() => {
  return operacoes.value.length ? totalResultadoBruto.value / operacoes.value.length : 0
})
</script>

<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
      <div>
        <h2 class="text-xl md:text-2xl font-light text-[#556b2f]">Relatório de Performance</h2>
        <p class="text-xs text-slate-500">Execuções e resultados operacionais carregados do Neon</p>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="() => refresh()" 
          class="text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 px-2.5 py-1 rounded-md transition-colors"
        >
          ↻ Atualizar
        </button>
        <NuxtLink to="/" class="text-xs md:text-sm font-semibold text-sky-700 hover:underline">
          ← Voltar ao Dashboard
        </NuxtLink>
      </div>
    </div>

    <!-- Cards de Resumo -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
      <div class="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Res. Bruto Total</span>
        <span :class="['text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-1 truncate', totalResultadoBruto >= 0 ? 'text-emerald-700' : 'text-rose-600']">
          {{ formatCurrency(totalResultadoBruto) }}
        </span>
      </div>

      <div class="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Contratos</span>
        <span class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-800 mt-1 truncate">
          {{ totalContratos }}
        </span>
      </div>

      <div class="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Taxas</span>
        <span class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-rose-700 mt-1 truncate">
          {{ formatCurrency(totalTaxas) }}
        </span>
      </div>

      <div class="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Média / Operação</span>
        <span :class="['text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-1 truncate', mediaPorOperacao >= 0 ? 'text-emerald-700' : 'text-rose-600']">
          {{ formatCurrency(mediaPorOperacao) }}
        </span>
      </div>
    </div>

    <!-- Tabela de Operações -->
    <section>
      <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Detalhamento de Trades</h3>
          <span class="text-xs text-slate-500 font-medium">{{ operacoes.length }} registros no banco</span>
        </div>

        <!-- Feedback de Carregamento / Erro -->
        <div v-if="pending" class="p-8 text-center text-slate-500 text-xs">
          Carregando dados do banco...
        </div>

        <div v-else-if="error" class="p-8 text-center text-rose-600 text-xs font-semibold">
          Erro ao conectar com o Neon. Verifique suas credenciais do banco.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs md:text-sm">
            <thead class="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th class="p-3 md:p-4">Ativo</th>
                <th class="p-3 md:p-4">Abertura</th>
                <th class="p-3 md:p-4">Fechamento</th>
                <th class="p-3 md:p-4 text-center">Qtd Compra</th>
                <th class="p-3 md:p-4 text-center">Qtd Venda</th>
                <th class="p-3 md:p-4 text-center">Lotes</th>
                <th class="p-3 md:p-4 text-right">Res. Intervalo Bruto</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-800">
              <tr v-for="op in operacoes" :key="op.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="p-3 md:p-4 font-bold text-slate-900 whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-mono text-xs">
                    {{ op.ativo }}
                  </span>
                </td>
                <td class="p-3 md:p-4 text-slate-600 whitespace-nowrap font-mono text-[11px] md:text-xs">
                  {{ formatDate(op.abertura) }}
                </td>
                <td class="p-3 md:p-4 text-slate-600 whitespace-nowrap font-mono text-[11px] md:text-xs">
                  {{ formatDate(op.fechamento) }}
                </td>
                <td class="p-3 md:p-4 text-center font-medium whitespace-nowrap">{{ op.qtdCompra }}</td>
                <td class="p-3 md:p-4 text-center font-medium whitespace-nowrap">{{ op.qtdVenda }}</td>
                <td class="p-3 md:p-4 text-center font-medium text-slate-600 whitespace-nowrap">{{ op.lotes }}</td>
                <td :class="['p-3 md:p-4 text-right font-bold whitespace-nowrap', Number(op.resIntervaloBruto) >= 0 ? 'text-emerald-700' : 'text-rose-600']">
                  {{ formatCurrency(Number(op.resIntervaloBruto)) }}
                </td>
              </tr>
              <tr v-if="operacoes.length === 0">
                <td colspan="7" class="p-6 text-center text-slate-400">Nenhum registro encontrado.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>