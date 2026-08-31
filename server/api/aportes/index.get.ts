// server/api/aportes/index.get.ts
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  try {
    const aportes = await prisma.aportes.findMany({
      orderBy: {
        data_aporte: 'asc'
      }
    })

    return aportes
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar aportes: ' + error.message
    })
  }
})