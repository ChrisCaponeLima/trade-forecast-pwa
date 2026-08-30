// server/api/relatperformance.get.ts
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const operacoes = await prisma.relatPerformance.findMany({
      orderBy: {
        abertura: 'desc'
      }
    })

    return operacoes.map((op) => ({
      ...op,
      resIntervaloBruto: Number(op.resIntervaloBruto)
    }))
  } catch (error) {
    console.error('Erro na conexão com o Neon:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Falha ao buscar relatório de performance no Neon.'
    })
  }
})