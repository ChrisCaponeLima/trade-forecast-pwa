<script setup lang="ts">
import { ref, computed } from 'vue'

interface OperacaoPerformance {
  abertura?: string
  resIntervaloLiquido?: number | string
  resIntervaloBruto?: number | string
}

interface RetiradaDB {
  id: string
  valorRetirada: number | string
  statusTransferencia: string
  created_at?: string
}

interface AporteDB {
  id: string
  data_aporte: string | Date
  valor: number | string
}

interface SliceData {
  label: string
  value: number
  color: string
}

interface DonutChartConfig {
  id: string
  title: string
  centerValue: string
  centerLabel: string
  slices: {
    label: string
    value: number
    color: string
    percentage: number
    dashArray: string
    dashOffset: string
  }[]
}

// 1. Busca de Dados Nativos via Nuxt 3
const { data: operacoes } = await useFetch<OperacaoPerformance[]>('/api/relatperformance', { default: () => [] })
const { data: retiradasDb } = await useFetch<RetiradaDB[]>('/api/retiradas', { default: () => [] })
const { data: aportesDb } = await useFetch<AporteDB[]>('/api/aportes', { default: () => [] })

// Formatadores
const formatCurrency = (val: number) => {
  if (isNaN(val) || !isFinite(val)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatPercent = (val: number) => {
  if (isNaN(val) || !isFinite(val)) return '0,0%'
  return `${val.toFixed(1).replace('.', ',')}%`
}

// -------------------------------------------------------------
// Cálculos de Métricas Patrimoniais
// -------------------------------------------------------------

// Principal (Aportes Acumulados)
const valorPrincipal = computed(() => {
  return (aportesDb.value || []).reduce((acc, a) => acc + Number(a.valor || 0), 0)
})

// Realizado Total (Lucro Operacional Liquido Acumulado)
const valorRealizado = computed(() => {
  return (operacoes.value || []).reduce((sum, op) => {
    const val = op.resIntervaloLiquido !== undefined && op.resIntervaloLiquido !== null
      ? Number(op.resIntervaloLiquido)
      : Number(op.resIntervaloBruto || 0)
    return sum + (isNaN(val) ? 0 : val)
  }, 0)
})

// Retiradas Concluídas
const valorRetiradasConcluidas = computed(() => {
  return (retiradasDb.value || [])
    .filter(r => r.statusTransferencia === 'CONCLUIDO')
    .reduce((acc, r) => acc + Number(r.valorRetirada || 0), 0)
})

// Capital Agregado Atual
const valorAgregado = computed(() => {
  return valorPrincipal.value + (valorRealizado.value - valorRetiradasConcluidas.value)
})

// -------------------------------------------------------------
// Cálculo do Forecast Mensal (Meta Operacional de 15%)
// -------------------------------------------------------------
const metaForecastMes = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const inicioMesStr = `${year}-${String(month).padStart(2, '0')}-01`

  const aportesInicioMes = (aportesDb.value || []).reduce((sum, a) => {
    const dataStr = new Date(a.data_aporte).toISOString().split('T')[0]
    return dataStr <= inicioMesStr ? sum + Number(a.valor || 0) : sum
  }, 0)

  const resultadoMesAnterior = (operacoes.value || []).reduce((sum, op) => {
    if (!op.abertura) return sum
    const dataOp = new Date(op.abertura).toISOString().split('T')[0]
    if (dataOp < inicioMesStr) {
      const val = op.resIntervaloLiquido !== undefined && op.resIntervaloLiquido !== null
        ? Number(op.resIntervaloLiquido)
        : Number(op.resIntervaloBruto || 0)
      return sum + (isNaN(val) ? 0 : val)
    }
    return sum
  }, 0)

  const retiradasMesAnterior = (retiradasDb.value || []).reduce((sum, r) => {
    if (r.statusTransferencia !== 'CONCLUIDO' || !r.created_at) return sum
    const dataRet = new Date(r.created_at).toISOString().split('T')[0]
    return dataRet < inicioMesStr ? sum + Number(r.valorRetirada || 0) : sum
  }, 0)

  const capitalInicioMes = aportesInicioMes + (resultadoMesAnterior - retiradasMesAnterior)
  return capitalInicioMes > 0 ? capitalInicioMes * 0.15 : 0
})

// Realizado Apenas no Mês Atual
const realizadoMesAtual = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const inicioMesStr = `${year}-${String(month).padStart(2, '0')}-01`

  return (operacoes.value || []).reduce((sum, op) => {
    if (!op.abertura) return sum
    const dataOp = new Date(op.abertura).toISOString().split('T')[0]
    if (dataOp >= inicioMesStr) {
      const val = op.resIntervaloLiquido !== undefined && op.resIntervaloLiquido !== null
        ? Number(op.resIntervaloLiquido)
        : Number(op.resIntervaloBruto || 0)
      return sum + (isNaN(val) ? 0 : val)
    }
    return sum
  }, 0)
})

// -------------------------------------------------------------
// Função utilitária para calcular fatias SVG de Donut (Perímetro 100)
// -------------------------------------------------------------
function buildDonutSlices(rawSlices: SliceData[]) {
  const total = rawSlices.reduce((acc, s) => acc + Math.max(0, s.value), 0)
  let accumulatedPercent = 0

  return rawSlices.map(slice => {
    const val = Math.max(0, slice.value)
    const percentage = total > 0 ? (val / total) * 100 : 0
    
    const dashArray = `${percentage.toFixed(4)} ${(100 - percentage).toFixed(4)}`
    const dashOffset = `-${accumulatedPercent.toFixed(4)}`
    
    accumulatedPercent += percentage

    return {
      ...slice,
      percentage,
      dashArray,
      dashOffset
    }
  })
}

// -------------------------------------------------------------
// Estrutura Executiva dos 3 Donuts
// -------------------------------------------------------------
const charts = computed<DonutChartConfig[]>(() => {
  // --- Donut 1: Status da Meta Mensal ---
  const realizadoMes = Math.max(0, realizadoMesAtual.value)
  const metaTotal = metaForecastMes.value
  const restanteMeta = Math.max(0, metaTotal - realizadoMes)
  const pctMetaAtingida = metaTotal > 0 ? (realizadoMes / metaTotal) * 100 : 0

  const d1Slices = buildDonutSlices([
    { label: 'Realizado no Mês', value: realizadoMes, color: '#10b981' }, // Esmeralda
    { label: 'Faltante p/ Meta', value: restanteMeta, color: '#e2e8f0' }  // Slate Suave
  ])

  // --- Donut 2: Composição da Estrutura de Capital ---
  const principal = Math.max(0, valorPrincipal.value)
  const lucroRetido = Math.max(0, valorRealizado.value - valorRetiradasConcluidas.value)

  const d2Slices = buildDonutSlices([
    { label: 'Capital Principal (Aportes)', value: principal, color: '#475569' }, // Slate Escuro
    { label: 'Lucro Acumulado Retido', value: lucroRetido, color: '#0ea5e9' }      // Sky Blue
  ])

  // --- Donut 3: Gestão de Liquidez e Distribuição ---
  const retiradas = Math.max(0, valorRetiradasConcluidas.value)
  const saldoEmHaver = Math.max(0, valorRealizado.value - valorRetiradasConcluidas.value)

  const d3Slices = buildDonutSlices([
    { label: 'Retiradas Concluídas', value: retiradas, color: '#f59e0b' }, // Âmbar
    { label: 'Saldo em Haver (Disponível)', value: saldoEmHaver, color: '#6366f1' } // Índigo
  ])

  return [
    {
      id: 'forecast',
      title: 'Meta Mensal (15%)',
      centerValue: formatPercent(pctMetaAtingida),
      centerLabel: 'da Meta',
      slices: d1Slices
    },
    {
      id: 'capital',
      title: 'Estrutura de Capital',
      centerValue: formatCurrency(valorAgregado.value),
      centerLabel: 'Capital Agregado',
      slices: d2Slices
    },
    {
      id: 'retiradas',
      title: 'Status de Liquidez',
      centerValue: formatCurrency(saldoEmHaver),
      centerLabel: 'Em Haver',
      slices: d3Slices
    }
  ]
})
</script>

<template>
  <div class="my-4 md:my-6">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
      <div 
        v-for="chart in charts" 
        :key="chart.id" 
        class="flex flex-col items-center justify-between p-3 md:p-4 bg-white border border-slate-200/80 rounded-lg shadow-xs transition-all hover:border-slate-300"
      >
        <!-- Título Institucional -->
        <h3 class="text-xs md:text-sm font-semibold text-slate-700 mb-2 text-center tracking-tight">
          {{ chart.title }}
        </h3>

        <!-- Container do Gráfico Donut -->
        <div class="relative w-28 h-28 md:w-36 md:h-36 my-1">
          <svg viewBox="0 0 42 42" class="w-full h-full -rotate-90">
            <circle
              cx="21"
              cy="21"
              r="15.91549430918954"
              fill="transparent"
              stroke="#f1f5f9"
              stroke-width="5"
            />
            
            <circle 
              v-for="(seg, idx) in chart.slices" 
              :key="idx"
              cx="21" 
              cy="21" 
              r="15.91549430918954" 
              fill="transparent" 
              :stroke="seg.color" 
              stroke-width="5" 
              :stroke-dasharray="seg.dashArray" 
              :stroke-dashoffset="seg.dashOffset"
              stroke-linecap="round"
              class="transition-all duration-700 ease-out origin-center"
            >
              <title>{{ seg.label }}: {{ formatCurrency(seg.value) }} ({{ formatPercent(seg.percentage) }})</title>
            </circle>
          </svg>

          <!-- Centro do Donut -->
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-1 pointer-events-none">
            <span class="text-xs md:text-sm font-extrabold text-slate-900 leading-tight">
              {{ chart.centerValue }}
            </span>
            <span class="text-[9px] md:text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              {{ chart.centerLabel }}
            </span>
          </div>
        </div>

        <!-- Legenda -->
        <div class="w-full mt-3 pt-2 border-t border-slate-100 space-y-1">
          <div 
            v-for="(seg, idx) in chart.slices" 
            :key="idx" 
            class="flex items-center justify-between text-[10px] md:text-xs text-slate-600"
          >
            <div class="flex items-center space-x-1.5 truncate pr-1">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: seg.color }"></span>
              <span class="truncate">{{ seg.label }}</span>
            </div>
            <span class="font-semibold text-slate-800 flex-shrink-0">
              {{ formatPercent(seg.percentage) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>