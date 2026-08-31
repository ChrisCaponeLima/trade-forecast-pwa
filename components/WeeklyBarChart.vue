<script setup lang="ts">
import { ref, computed } from 'vue'

interface OperacaoPerformance {
  abertura?: string
  resIntervaloLiquido?: number | string
  resIntervaloBruto?: number | string
}

interface AporteDB {
  id: string
  data_aporte: string | Date
  valor: number | string
}

interface RetiradaDB {
  id: string
  valorRetirada: number | string
  statusTransferencia: string
  created_at?: string
}

interface BarSeries {
  label: string
  color: string
  values: number[]
  isPercentage?: boolean
}

// 1. Busca de Dados Nativos via Nuxt 3
const { data: operacoes } = await useFetch<OperacaoPerformance[]>('/api/relatperformance', { default: () => [] })
const { data: aportesDb } = await useFetch<AporteDB[]>('/api/aportes', { default: () => [] })
const { data: retiradasDb } = await useFetch<RetiradaDB[]>('/api/retiradas', { default: () => [] })

// -------------------------------------------------------------
// Cálculo do Capital de Referência no Início do Mês Atual
// -------------------------------------------------------------
const capitalInicioMes = computed(() => {
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

  const capital = aportesInicioMes + (resultadoMesAnterior - retiradasMesAnterior)
  return capital > 0 ? capital : 20000 // Capital base fallback
})

// Meta semanal (Meta mensal de 15% dividida por 4 semanas)
const metaSemanalFixa = computed(() => {
  return (capitalInicioMes.value * 0.15) / 4
})

// -------------------------------------------------------------
// Agrupamento Semanal dos Dados do Mês Atual
// -------------------------------------------------------------
const nomeMesAtual = computed(() => {
  return new Date().toLocaleString('pt-BR', { month: 'long' })
})

const weeks = computed(() => [
  `${nomeMesAtual.value} - Sem. 1`,
  `${nomeMesAtual.value} - Sem. 2`,
  `${nomeMesAtual.value} - Sem. 3`,
  `${nomeMesAtual.value} - Sem. 4`
])

// Agrupa operações reais do mês por semana (dias 1-7, 8-14, 15-21, 22-fim)
const resultadosPorSemana = computed(() => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const sem = [0, 0, 0, 0]

  ;(operacoes.value || []).forEach(op => {
    if (!op.abertura) return
    const d = new Date(op.abertura)
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      const day = d.getDate()
      const val = op.resIntervaloLiquido !== undefined && op.resIntervaloLiquido !== null
        ? Number(op.resIntervaloLiquido)
        : Number(op.resIntervaloBruto || 0)
      
      const valValido = isNaN(val) ? 0 : val

      if (day <= 7) sem[0] += valValido
      else if (day <= 14) sem[1] += valValido
      else if (day <= 21) sem[2] += valValido
      else sem[3] += valValido
    }
  })

  return sem
})

// -------------------------------------------------------------
// Montagem das Séries do Gráfico (Verde Oliva Semântico)
// -------------------------------------------------------------
const series = computed<BarSeries[]>(() => {
  const mSemanal = metaSemanalFixa.value
  const resSemanas = resultadosPorSemana.value

  // Metas
  const metaRendimento = [mSemanal, mSemanal, mSemanal, mSemanal]
  const metaAcumulada = [mSemanal, mSemanal * 2, mSemanal * 3, mSemanal * 4]

  // Resultados e distribuições (divisão 50/50 do lucro realizado)
  const resultadoRealizado = resSemanas
  const devidoChris = resSemanas.map(r => r > 0 ? r * 0.5 : 0)
  const devidoVania = resSemanas.map(r => r > 0 ? r * 0.5 : 0)

  // Porcentagem da Meta Semanal Atingida
  const pctMetaAtingida = resSemanas.map(r => {
    if (mSemanal <= 0) return 0
    return Math.round((r / mSemanal) * 100)
  })

  return [
    { label: 'Meta Rendimento', color: '#3f4e2e', values: metaRendimento },     // Oliva Escuro Profundo
    { label: 'Meta Acumulada', color: '#556b2f', values: metaAcumulada },      // Verde Oliva Institucional
    { label: 'Resultado Realizado', color: '#6b8e23', values: resultadoRealizado }, // Oliva Vibrante
    { label: 'Devido Chris', color: '#809c13', values: devidoChris },          // Oliva Claro / Dourado
    { label: 'Devido Vânia', color: '#aacc00', values: devidoVania },          // Oliva Suave
    { label: '% Meta Atingida', color: '#cbd5e1', values: pctMetaAtingida, isPercentage: true } // Neutro de Apoio
  ]
})

// -------------------------------------------------------------
// Escala Dinâmica do Eixo Y SVG
// -------------------------------------------------------------
const svgHeight = 200

const minVal = computed(() => {
  let min = 0
  series.value.forEach(s => {
    if (!s.isPercentage) {
      min = Math.min(min, ...s.values)
    }
  })
  // Arredonda para baixo em múltiplos de 500 ou define limite mínimo seguro
  return Math.min(-500, Math.floor(min / 500) * 500)
})

const maxVal = computed(() => {
  let max = 1000
  series.value.forEach(s => {
    if (!s.isPercentage) {
      max = Math.max(max, ...s.values)
    }
  })
  return Math.max(2000, Math.ceil(max / 500) * 500)
})

// Linhas de Grade dinâmicas para o Eixo Y
const gridTicks = computed(() => {
  const step = (maxVal.value - minVal.value) / 4
  return [
    maxVal.value,
    maxVal.value - step,
    maxVal.value - (step * 2),
    maxVal.value - (step * 3),
    minVal.value
  ]
})

const getYCoordinate = (val: number): number => {
  const range = maxVal.value - minVal.value
  if (range === 0) return svgHeight / 2
  const percentage = (val - minVal.value) / range
  return svgHeight - (percentage * svgHeight)
}

const zeroY = computed(() => getYCoordinate(0))

// Formatador Monetário Resumido para o Eixo Y
const formatAxisVal = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(val)
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>

<template>
  <div class="bg-white p-4 md:p-6 border border-slate-200/80 rounded-lg shadow-xs space-y-4">
    <!-- Cabeçalho do Card em Verde Oliva -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
      <div>
        <h2 class="text-base md:text-lg font-bold text-[#3f4e2e] tracking-tight flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-[#556b2f]"></span>
          Acompanhamento Semanal de Rendimentos
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Evolução das metas e distribuição de resultados em {{ nomeMesAtual }}
        </p>
      </div>

      <!-- Indicador Resumido da Meta -->
      <div class="flex items-center space-x-2 text-xs bg-[#556b2f]/10 text-[#3f4e2e] px-3 py-1.5 rounded-md font-medium self-start sm:self-auto">
        <span>Meta Semanal:</span>
        <span class="font-bold">{{ formatCurrency(metaSemanalFixa) }}</span>
      </div>
    </div>

    <!-- Área Principal Gráfico + Legenda -->
    <div class="flex flex-col lg:flex-row gap-6 items-center">
      <!-- SVG Chart Area -->
      <div class="flex-1 w-full overflow-x-auto">
        <svg viewBox="0 0 600 230" class="w-full h-64 overflow-visible min-w-[480px]">
          <!-- Linhas de Grade e Eixo Y em Tons Oliva / Slate Suaves -->
          <g stroke="#e2e8f0" stroke-dasharray="2" stroke-width="1">
            <line 
              v-for="tick in gridTicks" 
              :key="tick" 
              x1="45" 
              :y1="getYCoordinate(tick)" 
              x2="585" 
              :y2="getYCoordinate(tick)" 
            />
            <!-- Linha do Zero Destacada -->
            <line 
              x1="45" 
              :y1="zeroY" 
              x2="585" 
              :y2="zeroY" 
              stroke="#556b2f" 
              stroke-opacity="0.5" 
              stroke-dasharray="0" 
              stroke-width="1.5" 
            />
          </g>

          <!-- Rótulos do Eixo Y -->
          <g font-size="10" fill="#64748b" text-anchor="end" class="font-medium">
            <text 
              v-for="tick in gridTicks" 
              :key="'text-' + tick" 
              x="40" 
              :y="getYCoordinate(tick) + 4"
            >
              {{ formatAxisVal(tick) }}
            </text>
          </g>

          <!-- Barras Agrupadas por Semana -->
          <g v-for="(week, wIdx) in weeks" :key="week">
            <g v-for="(s, sIdx) in series" :key="s.label">
              <rect
                :x="65 + (wIdx * 130) + (sIdx * 16)"
                :y="s.values[wIdx] >= 0 ? getYCoordinate(s.values[wIdx]) : zeroY"
                width="13"
                :height="Math.max(2, Math.abs(getYCoordinate(s.values[wIdx]) - zeroY))"
                :fill="s.color"
                rx="1.5"
                class="transition-all duration-300 hover:opacity-80 cursor-pointer"
              >
                <title>{{ week }} - {{ s.label }}: {{ s.isPercentage ? s.values[wIdx] + '%' : formatCurrency(s.values[wIdx]) }}</title>
              </rect>
            </g>

            <!-- Rótulos do Eixo X (Nome das Semanas em Verde Oliva) -->
            <text 
              :x="65 + (wIdx * 130) + 42" 
              y="222" 
              font-size="11" 
              fill="#3f4e2e" 
              text-anchor="middle" 
              font-weight="600"
            >
              {{ week }}
            </text>
          </g>
        </svg>
      </div>

      <!-- Legenda com Estilo de Card Oliva -->
      <div class="w-full lg:w-52 flex flex-col justify-center space-y-2.5 text-xs text-slate-700 bg-slate-50/70 p-3.5 border border-slate-200/60 rounded-lg">
        <span class="text-[11px] font-bold text-[#3f4e2e] uppercase tracking-wider mb-1 border-b border-slate-200 pb-1">
          Legendas da Série
        </span>

        <div v-for="item in series" :key="item.label" class="flex items-center justify-between space-x-2">
          <div class="flex items-center space-x-2 truncate">
            <span class="w-3 h-3 rounded-xs flex-shrink-0 shadow-xs" :style="{ backgroundColor: item.color }" />
            <span class="truncate text-slate-600 font-medium">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>