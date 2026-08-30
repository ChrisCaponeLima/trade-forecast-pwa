import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async () => {
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
    throw createError({
      statusCode: 500,
      statusMessage: 'Falha ao buscar relatório de performance no Neon.'
    })
  }
})