import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const monthKey = query.monthKey as string // Ex: "2026-08"

  if (!monthKey) {
    throw createError({ statusCode: 400, statusMessage: 'monthKey é obrigatório.' })
  }

  const [yearStr, monthStr] = monthKey.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10)

  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  const nomeMes = mesesNomes[month - 1]

  // IDs fixos/conhecidos dos sacados
  const ID_VANIA = '529bc1c4-320a-4898-8376-53ec45dce33b'
  // Se você tiver o ID exato do Chris no banco, defina-o aqui (exemplo abaixo):
  // const ID_CHRIS = 'seu-id-do-chris-aqui'

  // 1. Busca todas as operações do mês selecionado
  const startDate = new Date(Date.UTC(year, month - 1, 1))
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59))

  const operacoes = await prisma.operacaoPerformance.findMany({
    where: {
      abertura: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  // 2. Busca retiradas (tanto processando quanto concluídas)
  const retiradas = await prisma.retiradas.findMany({
    where: {
      status_transferencia: {
        in: ['EM_PROCESSAMENTO', 'CONCLUIDO']
      }
    }
  })

  // Define as 4 semanas do mês
  const lastDay = endDate.getDate()
  const semanasDef = [
    { semanaNum: 1, inicio: `${monthKey}-01`, fim: `${monthKey}-07` },
    { semanaNum: 2, inicio: `${monthKey}-08`, fim: `${monthKey}-14` },
    { semanaNum: 3, inicio: `${monthKey}-15`, fim: `${monthKey}-21` },
    { semanaNum: 4, inicio: `${monthKey}-22`, fim: `${monthKey}-${String(lastDay).padStart(2, '0')}` }
  ]

  let prejuizoAcumulado = 0
  const saldosChris: Array<{ semanaRef: string; valorDevido: number }> = []
  const saldosVania: Array<{ semanaRef: string; valorDevido: number }> = []

  // 3. Processa o cálculo por semana
  for (const sem of semanasDef) {
    const opsSemana = operacoes.filter((op) => {
      if (!op.abertura) return false
      const dataOp = new Date(op.abertura).toISOString().split('T')[0]
      return dataOp >= sem.inicio && dataOp <= sem.fim
    })

    const totalLiquidoSemana = opsSemana.reduce((sum, op) => {
      const val = op.resIntervaloLiquido ?? op.resIntervaloBruto ?? 0
      return sum + Number(val)
    }, 0)

    let saldoDistribuidivel = 0

    if (totalLiquidoSemana < 0) {
      prejuizoAcumulado += Math.abs(totalLiquidoSemana)
    } else {
      if (prejuizoAcumulado > 0) {
        if (totalLiquidoSemana > prejuizoAcumulado) {
          saldoDistribuidivel = totalLiquidoSemana - prejuizoAcumulado
          prejuizoAcumulado = 0
        } else {
          prejuizoAcumulado -= totalLiquidoSemana
        }
      } else {
        saldoDistribuidivel = totalLiquidoSemana
      }
    }

    const devidoPorParte = saldoDistribuidivel > 0 ? saldoDistribuidivel * 0.5 : 0
    const semanaLabel = `${nomeMes} - Semana ${sem.semanaNum}`

    // Abate exato estritamente por sacado_id
    const retiradoVania = retiradas
      .filter((r) => r.sacado_id === ID_VANIA && r.semana_ref === semanaLabel)
      .reduce((sum, r) => sum + Number(r.valor_retirada), 0)

    const retiradoChris = retiradas
      .filter((r) => r.sacado_id !== ID_VANIA && r.semana_ref === semanaLabel)
      // Obs: Se preferir validar por ID direto do Chris: r.sacado_id === ID_CHRIS
      .reduce((sum, r) => sum + Number(r.valor_retirada), 0)

    const haverChris = devidoPorParte - retiradoChris
    const haverVania = devidoPorParte - retiradoVania

    if (haverChris > 0.01) {
      saldosChris.push({ semanaRef: semanaLabel, valorDevido: Number(haverChris.toFixed(2)) })
    }
    if (haverVania > 0.01) {
      saldosVania.push({ semanaRef: semanaLabel, valorDevido: Number(haverVania.toFixed(2)) })
    }
  }

  return {
    saldosChris,
    saldosVania
  }
})