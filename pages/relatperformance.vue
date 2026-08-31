<script setup lang="ts">
import type { OperacaoPerformance } from '~/types/performance'

definePageMeta({
  layout: 'default'
})

// Estados Reativos para os Filtros
const filtroAtivo = ref('')
const filtroDataInicio = ref('')
const filtroDataFim = ref('')

// Estados Reativos para Importação CSV
const isUploading = ref(false)
const importMessage = ref('')
const importError = ref(false)

// Transforma os estados em query reativa para o useFetch
const queryParams = computed(() => {
  const params: Record<string, string> = {}
  if (filtroAtivo.value) params.ativo = filtroAtivo.value
  if (filtroDataInicio.value) params.dataInicio = filtroDataInicio.value
  if (filtroDataFim.value) params.dataFim = filtroDataFim.value
  return params
})

const { data: operacoes, pending, error, refresh } = await useFetch<OperacaoPerformance[]>('/api/relatperformance', {
  query: queryParams,
  default: () => []
})

// Função para Importar CSV
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
    importMessage.value = 'Por favor, selecione um arquivo no formato .csv'
    importError.value = true
    return
  }

  isUploading.value = true
  importMessage.value = ''
  importError.value = false

  try {
    const csvContent = await file.text()

    const response = await $fetch<{ success: boolean; importedCount: number }>('/api/relatperformance/import', {
      method: 'POST',
      body: { csvContent }
    })

    if (response.success) {
      importMessage.value = `Relatório atualizado com sucesso! ${response.importedCount} operações importadas.`
      await refresh()
    }
  } catch (err: any) {
    importError.value = true
    importMessage.value = err.data?.statusMessage || 'Erro ao importar o arquivo CSV.'
  } finally {
    isUploading.value = false
    target.value = ''
  }
}

// Limpar Filtros
const limparFiltros = () => {
  filtroAtivo.value = ''
  filtroDataInicio.value = ''
  filtroDataFim.value = ''
}

// Formatações
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val || 0)
}

const formatDate = (dateString: string | Date) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Métricas Agregadas
const totalResultadoBruto = computed(() => {
  return operacoes.value.reduce((acc, op) => acc + Number(op.resIntervaloBruto || 0), 0)
})

const totalContratos = computed(() => {
  return operacoes.value.reduce((acc, op) => acc + (op.qtdCompra + op.qtdVenda), 0)
})

const totalTaxas = computed(() => {
  return operacoes.value.reduce((acc, op) => acc + (op.taxaOperacao || 0), 0)
})

const totalResultadoLiquido = computed(() => {
  return totalResultadoBruto.value - totalTaxas.value
})
</script>

<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
      <div>
        <h2 class="text-xl md:text-2xl font-light text-[#556b2f]">Relatório de Performance</h2>
        <p class="text-xs text-slate-500">Execuções, taxas de emolumentos e resultados líquidos operacionais</p>
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

    <!-- Painel de Importação CSV -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Importar Relatório (Profit / Nelogica)</h3>
        <p class="text-xs text-slate-500 mt-0.5">Substitui os dados antigos ao enviar o arquivo .CSV exportado</p>
      </div>

      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
        <label 
          class="w-full sm:w-auto text-center cursor-pointer px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
          :class="{ 'opacity-50 pointer-events-none': isUploading }"
        >
          <span>{{ isUploading ? 'Substituindo dados...' : '↑ Enviar Novo CSV' }}</span>
          <input 
            type="file" 
            accept=".csv" 
            class="hidden" 
            @change="handleFileUpload" 
            :disabled="isUploading"
          />
        </label>
      </div>
    </div>

    <!-- Feedback da Importação -->
    <div 
      v-if="importMessage" 
      :class="[
        'p-3 rounded-lg border text-xs font-medium flex items-center justify-between',
        importError ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      ]"
    >
      <span>{{ importMessage }}</span>
      <button @click="importMessage = ''" class="text-slate-400 hover:text-slate-600 ml-2 font-bold">✕</button>
    </div>

    <!-- Painel de Filtros -->
    <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
      <div class="flex justify-between items-center">
        <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Filtros de Busca</h3>
        <button 
          v-if="filtroAtivo || filtroDataInicio || filtroDataFim" 
          @click="limparFiltros" 
          class="text-xs text-rose-600 hover:underline font-medium"
        >
          Limpar Filtros
        </button>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Filtro Ativo -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Código do Ativo</label>
          <input 
            v-model="filtroAtivo" 
            type="text" 
            placeholder="Ex: WIN, WDO, WINQ26" 
            class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-slate-500 uppercase font-mono"
          />
        </div>

        <!-- Filtro Data Início -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Data Inicial</label>
          <input 
            v-model="filtroDataInicio" 
            type="date" 
            class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-slate-500"
          />
        </div>

        <!-- Filtro Data Fim -->
        <div>
          <label class="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Data Final</label>
          <input 
            v-model="filtroDataFim" 
            type="date" 
            class="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:border-slate-500"
          />
        </div>
      </div>
    </div>

    <!-- Cards de Resumo Reordenados -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
      <!-- 1. Resultado Líquido -->
      <div class="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Resultado Líquido</span>
        <span :class="['text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-1 truncate', totalResultadoLiquido >= 0 ? 'text-emerald-700' : 'text-rose-600']">
          {{ formatCurrency(totalResultadoLiquido) }}
        </span>
      </div>

      <!-- 2. Resultado Bruto -->
      <div class="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Resultado Bruto</span>
        <span :class="['text-base sm:text-lg md:text-xl lg:text-2xl font-bold mt-1 truncate', totalResultadoBruto >= 0 ? 'text-emerald-700' : 'text-rose-600']">
          {{ formatCurrency(totalResultadoBruto) }}
        </span>
      </div>

      <!-- 3. Número de Contratos -->
      <div class="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Número de Contratos</span>
        <span class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-800 mt-1 truncate">
          {{ totalContratos }}
        </span>
      </div>

      <!-- 4. Taxas -->
      <div class="bg-white p-3 md:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <span class="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">Taxas</span>
        <span class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-rose-700 mt-1 truncate">
          {{ formatCurrency(totalTaxas) }}
        </span>
      </div>
    </div>

    <!-- Tabela de Operações -->
    <section>
      <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Detalhamento de Trades</h3>
          <span class="text-xs text-slate-500 font-medium">{{ operacoes.length }} registros encontrados</span>
        </div>

        <div v-if="pending" class="p-8 text-center text-slate-500 text-xs">
          Filtrando dados...
        </div>

        <div v-else-if="error" class="p-8 text-center text-rose-600 text-xs font-semibold">
          Erro ao conectar com o banco Neon.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs md:text-sm">
            <thead class="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th class="p-3 md:p-4">Ativo</th>
                <th class="p-3 md:p-4">Abertura</th>
                <th class="p-3 md:p-4">Fechamento</th>
                <th class="p-3 md:p-4 text-center">Compra</th>
                <th class="p-3 md:p-4 text-center">Venda</th>
                <th class="p-3 md:p-4 text-right">Res. Bruto</th>
                <th class="p-3 md:p-4 text-right">Taxas</th>
                <th class="p-3 md:p-4 text-right">Res. Líquido</th>
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
                <td class="p-3 md:p-4 text-right font-semibold text-slate-700 whitespace-nowrap">
                  {{ formatCurrency(op.resIntervaloBruto) }}
                </td>
                <td class="p-3 md:p-4 text-right font-medium text-rose-600 whitespace-nowrap">
                  -{{ formatCurrency(op.taxaOperacao || 0) }}
                </td>
                <td :class="['p-3 md:p-4 text-right font-bold whitespace-nowrap', (op.resIntervaloLiquido || 0) >= 0 ? 'text-emerald-700' : 'text-rose-600']">
                  {{ formatCurrency(op.resIntervaloLiquido || 0) }}
                </td>
              </tr>
              <tr v-if="operacoes.length === 0">
                <td colspan="8" class="p-6 text-center text-slate-400">Nenhum registro encontrado para os filtros selecionados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>