// server/api/retiradas.get.ts (ou o caminho equivalente na pasta server/api/)
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const retiradas = await prisma.retiradas.findMany({
      orderBy: {
        criado_em: 'desc'
      }
    })

    return retiradas.map(r => ({
      id: r.id,
      semanaRef: r.semana_ref,
      sacadoNome: r.sacado_nome,
      valorDevido: Number(r.valor_devido),
      valorRetirada: Number(r.valor_retirada),
      dataRetirada: r.data_retirada ? r.data_retirada.toISOString() : null,
      statusTransferencia: r.status_transferencia
    }))
  } catch (error: any) {
    // Exibe o erro legível no log da Vercel e retorna o statusCode 500 estruturado
    console.error('[API Retiradas Error]:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: `Erro ao buscar retiradas no banco: ${error?.message || String(error)}`
    })
  }
})