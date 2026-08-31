import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const ativo = query.ativo ? String(query.ativo).trim().toUpperCase() : undefined
    const dataInicio = query.dataInicio ? String(query.dataInicio) : undefined
    const dataFim = query.dataFim ? String(query.dataFim) : undefined

    // Constrói a cláusula WHERE dinamicamente
    const whereClause: any = {}

    if (ativo) {
      whereClause.ativo = {
        contains: ativo,
        mode: 'insensitive'
      }
    }

    if (dataInicio || dataFim) {
      whereClause.abertura = {}
      if (dataInicio) {
        whereClause.abertura.gte = new Date(`${dataInicio}T00:00:00.000Z`)
      }
      if (dataFim) {
        whereClause.abertura.lte = new Date(`${dataFim}T23:59:59.999Z`)
      }
    }

    const operacoes = await prisma.relatPerformance.findMany({
      where: whereClause,
      orderBy: {
        abertura: 'desc'
      }
    })

    return operacoes.map((op) => {
      const qtdTotalContratos = op.qtdCompra + op.qtdVenda
      const ativoUpper = op.ativo.toUpperCase()

      let taxaUnitária = 0
      if (ativoUpper.startsWith('WIN')) {
        taxaUnitária = 0.25
      } else if (ativoUpper.startsWith('WDO')) {
        taxaUnitária = 1.20
      }

      const taxaOperacao = qtdTotalContratos * taxaUnitária
      const resIntervaloBruto = Number(op.resIntervaloBruto)

      return {
        ...op,
        resIntervaloBruto,
        taxaOperacao,
        resIntervaloLiquido: resIntervaloBruto - taxaOperacao
      }
    })
  } catch (error) {
    console.error('Erro na conexão com o Neon:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Falha ao buscar relatório de performance no Neon.'
    })
  }
})