<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { InfoGeralItem, PrincipalItem } from '~/types/info'
import type { OperacaoPerformance } from '~/types/performance'
import type { RetiradaDB } from '~/components/RetiradasTable.vue'
import type { ItemSaldoSemanal } from '~/components/ModalNovaRetirada.vue'

definePageMeta({
  layout: 'default'
})

interface AporteDB {
  id: string
  usuario_id?: string | null
  data_aporte: string | Date
  valor: number | string
  observacoes?: string | null
  origem?: string | null
}

// Data Fetching
const { data: operacoes, pending: loadingOperacoes } = await useFetch<OperacaoPerformance[]>('/api/relatperformance', {
  default: () => []
})

const { data: retiradasDb, pending: loadingRetiradas, error: errorRetiradas, refresh: refreshRetiradas } = await useFetch<RetiradaDB[]>('/api/retiradas', {
  default: () => []
})

const { data: aportesDb } = await useFetch<AporteDB[]>('/api/aportes', {
  default: () => []
})

// Estado do Modal
const isModalOpen = ref(false)

const formatCurrency = (val: number | string) => {
  const num = typeof val === 'string' ? parseFloat(val) : val
  if (isNaN(num)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}

// Controle Dinâmico de Meses
const selectedMonthKey = ref<string>('')

const disponiveisMeses = computed(() => {
  const setMeses = new Set<string>()
  const now = new Date()
  setMeses.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

  ;(operacoes.value || []).forEach(op => {
    if (op.abertura) {
      const d = new Date(op.abertura)
      if (!isNaN(d.getTime())) {
        setMeses.add(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`)
      }
    }
  })

  return Array.from(setMeses).sort().reverse()
})

watch(disponiveisMeses, (meses) => {
  if (meses.length > 0 && !selectedMonthKey.value) {
    selectedMonthKey.value = meses[0]
  }
}, { immediate: true })

const getMonthLabel = (key: string) => {
  if (!key) return ''
  const [year, month] = key.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, 1))
  const nomeMes = date.toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' })
  return `${nomeMes} de ${year}`
}

const semanasDoMes = computed(() => {
  if (!selectedMonthKey.value) return []
  const [year, month] = selectedMonthKey.value.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  const nomeMesStr = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' })
  const monthStr = String(month).padStart(2, '0')

  return [
    { semana: `${nomeMesStr} - Semana 1`, semanaNum: 1, inicio: `${year}-${monthStr}-01`, fim: `${year}-${monthStr}-07` },
    { semana: `${nomeMesStr} - Semana 2`, semanaNum: 2, inicio: `${year}-${monthStr}-08`, fim: `${year}-${monthStr}-14` },
    { semana: `${nomeMesStr} - Semana 3`, semanaNum: 3, inicio: `${year}-${monthStr}-15`, fim: `${year}-${monthStr}-21` },
    { semana: `${nomeMesStr} - Semana 4`, semanaNum: 4, inicio: `${year}-${monthStr}-22`, fim: `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}` }
  ]
})

// Computeds para a Forecast (Cálculo semanal)
const forecastRawData = computed(() => {
  let prejuizoAcumulado = 0

  return semanasDoMes.value.map((s) => {
    const opsSemana = (operacoes.value || []).filter((op) => {
      if (!op.abertura) return false
      const dataOp = new Date(op.abertura).toISOString().split('T')[0]
      return dataOp >= s.inicio && dataOp <= s.fim
    })

    const totalLiquidoSemana = opsSemana.reduce((sum, op) => {
      const val = op.resIntervaloLiquido !== undefined && op.resIntervaloLiquido !== null
        ? Number(op.resIntervaloLiquido)
        : Number(op.resIntervaloBruto || 0)
      return sum + (isNaN(val) ? 0 : val)
    }, 0)

    let saldoDistribuidivel = 0

    if (totalLiquidoSemana < 0) {
      prejuizoAcumulado += Math.abs(totalLiquidoSemana)
      saldoDistribuidivel = 0
    } else {
      if (prejuizoAcumulado > 0) {
        if (totalLiquidoSemana > prejuizoAcumulado) {
          saldoDistribuidivel = totalLiquidoSemana - prejuizoAcumulado
          prejuizoAcumulado = 0
        } else {
          prejuizoAcumulado -= totalLiquidoSemana
          saldoDistribuidivel = 0
        }
      } else {
        saldoDistribuidivel = totalLiquidoSemana
      }
    }

    const devidoPartes = saldoDistribuidivel > 0 ? saldoDistribuidivel * 0.5 : 0

    return {
      semana: s.semana,
      semanaNum: s.semanaNum,
      resultadoRealizado: totalLiquidoSemana,
      devidoPartes,
      isNegative: totalLiquidoSemana < 0
    }
  })
})

// Mapeamento dos saldos pendentes dinâmicos para Chris
const saldosChris = computed<ItemSaldoSemanal[]>(() => {
  return forecastRawData.value
    .filter(row => row.devidoPartes > 0)
    .map(row => {
      const retirado = (retiradasDb.value || [])
        .filter(r => {
          const isChris = r.sacadoNome?.toLowerCase().includes('chris')
          const isAtivo = r.statusTransferencia === 'CONCLUIDO' || r.statusTransferencia === 'EM_PROCESSAMENTO'
          const mesmaSemana = r.semanaRef?.toLowerCase().includes(`semana ${row.semanaNum}`)
          return isChris && isAtivo && mesmaSemana
        })
        .reduce((sum, r) => sum + Number(r.valorRetirada || 0), 0)
      
      const restante = row.devidoPartes - retirado
      return {
        semanaRef: `Semana ${row.semanaNum}`,
        valorDevido: restante > 0 ? Number(restante.toFixed(2)) : 0
      }
    })
    .filter(item => item.valorDevido > 0)
})

// Mapeamento dos saldos pendentes dinâmicos para Vânia
const saldosVania = computed<ItemSaldoSemanal[]>(() => {
  return forecastRawData.value
    .filter(row => row.devidoPartes > 0)
    .map(row => {
      const retirado = (retiradasDb.value || [])
        .filter(r => {
          const isVania = r.sacadoNome?.toLowerCase().includes('vânia') || r.sacadoNome?.toLowerCase().includes('vania')
          const isAtivo = r.statusTransferencia === 'CONCLUIDO' || r.statusTransferencia === 'EM_PROCESSAMENTO'
          const mesmaSemana = r.semanaRef?.toLowerCase().includes(`semana ${row.semanaNum}`)
          return isVania && isAtivo && mesmaSemana
        })
        .reduce((sum, r) => sum + Number(r.valorRetirada || 0), 0)
      
      const restante = row.devidoPartes - retirado
      return {
        semanaRef: `Semana ${row.semanaNum}`,
        valorDevido: restante > 0 ? Number(restante.toFixed(2)) : 0
      }
    })
    .filter(item => item.valorDevido > 0)
})

// Total acumulado em haver
const totalEmHaverChris = computed(() => saldosChris.value.reduce((acc, s) => acc + s.valorDevido, 0))
const totalEmHaverVania = computed(() => saldosVania.value.reduce((acc, s) => acc + s.valorDevido, 0))

// Totais das Retiradas
const totalRetiradoChris = computed(() => 
  (retiradasDb.value || [])
    .filter(r => r.sacadoNome?.toLowerCase().includes('chris') && r.statusTransferencia === 'CONCLUIDO')
    .reduce((acc, r) => acc + (Number(r.valorRetirada) || 0), 0)
)

const totalRetiradoVania = computed(() => 
  (retiradasDb.value || [])
    .filter(r => (r.sacadoNome?.toLowerCase().includes('vânia') || r.sacadoNome?.toLowerCase().includes('vania')) && r.statusTransferencia === 'CONCLUIDO')
    .reduce((acc, r) => acc + (Number(r.valorRetirada) || 0), 0)
)

const totalRetiradasGerais = computed(() => 
  (retiradasDb.value || [])
    .filter(r => r.statusTransferencia === 'CONCLUIDO')
    .reduce((acc, r) => acc + (Number(r.valorRetirada) || 0), 0)
)

const totalResultadoOperacoes = computed(() => 
  (operacoes.value || []).reduce((sum, op) => {
    const val = op.resIntervaloLiquido !== undefined && op.resIntervaloLiquido !== null
      ? Number(op.resIntervaloLiquido)
      : Number(op.resIntervaloBruto || 0)
    return sum + (isNaN(val) ? 0 : val)
  }, 0)
)

// Aportes acumulados da tabela de aportes
const aportesAcumulados = computed(() => {
  if (!aportesDb.value || aportesDb.value.length === 0) return 0
  return aportesDb.value.reduce((acc, a) => acc + Number(a.valor || 0), 0)
})

// Capital Total Atual (Dramático/Real-time)
const capitalTotalAtual = computed(() => {
  return aportesAcumulados.value + (totalResultadoOperacoes.value - totalRetiradasGerais.value)
})

/* ==============================================================================
   REGRA: CAPITAL INICIAL DO MÊS SELECIONADO & META MENSAL FIXA DO MÊS
   ============================================================================== */
const capitalInicioDoMes = computed(() => {
  if (!selectedMonthKey.value) return capitalTotalAtual.value

  const [year, month] = selectedMonthKey.value.split('-').map(Number)
  const inicioMesStr = `${year}-${String(month).padStart(2, '0')}-01`

  // 1. Aportes realizados antes/no 1º dia do mês selecionado
  const aportesAteInicio = (aportesDb.value || []).reduce((sum, a) => {
    const dataStr = new Date(a.data_aporte).toISOString().split('T')[0]
    return dataStr <= inicioMesStr ? sum + Number(a.valor || 0) : sum
  }, 0)

  // 2. Operações fechadas antes do mês selecionado
  const resultadoAteMesAnterior = (operacoes.value || []).reduce((sum, op) => {
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

  // 3. Retiradas concluídas antes do mês selecionado
  const retiradasAteMesAnterior = (retiradasDb.value || []).reduce((sum, r) => {
    if (r.statusTransferencia !== 'CONCLUIDO' || !r.created_at) return sum
    const dataRet = new Date(r.created_at).toISOString().split('T')[0]
    return dataRet < inicioMesStr ? sum + Number(r.valorRetirada || 0) : sum
  }, 0)

  return aportesAteInicio + (resultadoAteMesAnterior - retiradasAteMesAnterior)
})

// Meta Mensal Geral (15% sobre o Capital do Início do Mês)
const metaMensalGeral = computed(() => capitalInicioDoMes.value * 0.15)

// Montagem Dinâmica da Tabela Infos Gerais
const infosGerais = computed<InfoGeralItem[]>(() => {
  return [
    { descricao: 'Capital Total Atual', valor: formatCurrency(capitalTotalAtual.value), destaque: true },
    { descricao: 'Aportes Acumulados', valor: formatCurrency(aportesAcumulados.value) },
    { descricao: 'Meta Mensal Geral (15%)', valor: formatCurrency(metaMensalGeral.value) },
    { descricao: 'Total Retirado (Chris)', valor: formatCurrency(totalRetiradoChris.value) },
    { descricao: 'Total Retirado (Vânia)', valor: formatCurrency(totalRetiradoVania.value) },
    { descricao: 'Total Retiradas Gerais', valor: formatCurrency(totalRetiradasGerais.value) },
    { descricao: 'Em haver (Chris)', valor: formatCurrency(totalEmHaverChris.value) },
    { descricao: 'Em haver (Vânia)', valor: formatCurrency(totalEmHaverVania.value) }
  ]
})

// Handlers de Ação das Retiradas
const handleCriarRetirada = async (payload: {
  sacadoNome: string
  semanas: ItemSaldoSemanal[]
  valorTotalRetirada: number
  dataRetirada: string
}) => {
  try {
    await $fetch('/api/retiradas', {
      method: 'POST',
      body: {
        ...payload,
        statusTransferencia: 'EM_PROCESSAMENTO'
      }
    })
    await refreshRetiradas()
  } catch (err) {
    console.error('Erro ao registrar solicitação de retirada:', err)
  }
}

const handleAprovarRetirada = async ({ id, senha }: { id: string; senha: string }) => {
  try {
    await $fetch(`/api/retiradas/${id}/confirmar`, {
      method: 'PATCH',
      body: { senha }
    })
    await refreshRetiradas()
  } catch (err: any) {
    alert(err.data?.message || 'Erro ao validar senha e aprovar transferência.')
  }
}

// Forecast List para a tabela Forecast
const forecastList = computed(() => {
  let acumuladoMeta = 0
  const metaSemanalDinamic = metaMensalGeral.value / 4

  return forecastRawData.value.map(row => {
    acumuladoMeta += metaSemanalDinamic
    const metaPct = metaSemanalDinamic > 0 ? (row.resultadoRealizado / metaSemanalDinamic) * 100 : 0

    return {
      semana: row.semana,
      semanaNum: row.semanaNum,
      metaRendimento: formatCurrency(metaSemanalDinamic),
      metaAcumulada: formatCurrency(acumuladoMeta),
      resultadoRealizado: formatCurrency(row.resultadoRealizado),
      devidoChris: row.devidoPartes > 0 ? formatCurrency(row.devidoPartes) : 'R$ 0,00',
      devidoVania: row.devidoPartes > 0 ? formatCurrency(row.devidoPartes) : 'R$ 0,00',
      metaAtingidaPct: `${metaPct.toFixed(2).replace('.', ',')}%`,
      isNegative: row.isNegative
    }
  })
})

const principalList = computed<PrincipalItem[]>(() => {
  if (!aportesDb.value || aportesDb.value.length === 0) return []

  return aportesDb.value.map(item => {
    const dataObj = new Date(item.data_aporte)
    const dataFormatada = !isNaN(dataObj.getTime())
      ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(dataObj)
      : String(item.data_aporte)

    return {
      data: dataFormatada,
      valor: formatCurrency(item.valor),
      observacoes: item.observacoes || item.origem || 'Aporte'
    }
  })
})
</script>

<template>
  <div class="space-y-8 pb-12">
    <!-- Header -->
    <div class="flex justify-between items-center border-b border-slate-200 pb-3">
      <h2 class="text-xl md:text-2xl font-light text-[#556b2f]">Informações de Controle</h2>
      <NuxtLink to="/" class="text-xs md:text-sm font-semibold text-sky-700 hover:underline">
        ← Voltar ao Dashboard
      </NuxtLink>
    </div>

    <!-- 1. Infos Gerais -->
    <InfoGeraisTable :items="infosGerais" />

    <!-- 2. Principal -->
    <PrincipalTable :items="principalList" />

    <!-- 3. Retiradas -->
    <RetiradasTable 
      :items="retiradasDb" 
      :loading="loadingRetiradas" 
      :error="errorRetiradas" 
      @open-modal="isModalOpen = true"
      @aprovar="handleAprovarRetirada"
    />

    <!-- 4. Forecast -->
    <ForecastTable 
      :items="forecastList" 
      :loading="loadingOperacoes"
      :disponiveis-meses="disponiveisMeses"
      v-model:selected-month-key="selectedMonthKey"
      :get-month-label="getMonthLabel"
    />

    <!-- Modal Nova Retirada -->
    <ModalNovaRetirada 
      :is-open="isModalOpen"
      :saldos-chris="saldosChris"
      :saldos-vania="saldosVania"
      @close="isModalOpen = false"
      @submit="handleCriarRetirada"
    />
  </div>
</template>