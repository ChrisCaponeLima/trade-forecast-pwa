// server/api/relatperformance/import.post.ts
import { prisma } from '~/server/utils/prisma'

// Função utilitária para converter data no formato "DD/MM/AAAA HH:mm:ss" para Date
function parseDateTimePtBR(dateTimeStr: string): Date | null {
  if (!dateTimeStr) return null
  const [datePart, timePart] = dateTimeStr.trim().split(' ')
  if (!datePart || !timePart) return null

  const [day, month, year] = datePart.split('/')
  const [hours, minutes, seconds] = timePart.split(':')

  if (!day || !month || !year || !hours || !minutes || !seconds) return null

  // ISO: YYYY-MM-DDTHH:mm:ss
  const isoStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`
  const d = new Date(isoStr)
  return isNaN(d.getTime()) ? null : d
}

// Função utilitária para converter números pt-BR (ex: "177.125,00" ou "10,00") para Number/Decimal
function parseNumberPtBR(valStr: string): number {
  if (!valStr) return 0
  // Remove pontos de milhar e troca vírgula decimal por ponto
  const cleanStr = valStr.trim().replace(/\./g, '').replace(',', '.')
  const num = parseFloat(cleanStr)
  return isNaN(num) ? 0 : num
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const csvText: string = body.csvContent

    if (!csvText) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Conteúdo CSV não fornecido.'
      })
    }

    const lines = csvText.split(/\r?\n/)
    const recordsToInsert: Array<{
      ativo: string
      abertura: Date
      fechamento: Date
      qtdCompra: number
      qtdVenda: number
      resIntervaloBruto: number
      lotes: number
    }> = []

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      const columns = trimmed.split(';')

      // Ignora cabeçalhos, metadados da conta e linhas sem dados de operações
      const firstCol = columns[0]?.trim() || ''
      if (
        firstCol.startsWith('Conta:') ||
        firstCol.startsWith('Titular:') ||
        firstCol.startsWith('Data') ||
        firstCol.toLowerCase() === 'ativo' ||
        columns.length < 14
      ) {
        continue
      }

      // Mapeamento das colunas com base no relatório da Profit/Nelogica
      const ativo = columns[0].trim()
      const abertura = parseDateTimePtBR(columns[1])
      const fechamento = parseDateTimePtBR(columns[2])
      const qtdCompra = parseInt(columns[4]?.trim() || '0', 10) || 0
      const qtdVenda = parseInt(columns[5]?.trim() || '0', 10) || 0
      const resIntervaloBruto = parseNumberPtBR(columns[13])
      
      // Cálculo de Lotes (número de contratos negociados)
      const lotes = Math.max(qtdCompra, qtdVenda)

      if (ativo && abertura && fechamento) {
        recordsToInsert.push({
          ativo,
          abertura,
          fechamento,
          qtdCompra,
          qtdVenda,
          resIntervaloBruto,
          lotes
        })
      }
    }

    // Executa em transação: Limpa a tabela atual e insere os novos registros
    const result = await prisma.$transaction(async (tx) => {
      // 1. Limpa registros legados
      await tx.relatPerformance.deleteMany({})

      // 2. Insere novos relatórios processados
      if (recordsToInsert.length > 0) {
        await tx.relatPerformance.createMany({
          data: recordsToInsert
        })
      }

      return recordsToInsert.length
    })

    return {
      success: true,
      importedCount: result
    }
  } catch (error: any) {
    console.error('[Import RelatPerformance Error]:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Erro ao importar relatório de performance: ${error?.message || String(error)}`
    })
  }
})