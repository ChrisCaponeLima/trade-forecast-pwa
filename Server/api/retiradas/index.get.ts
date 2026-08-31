// server/api/retiradas/index.get.ts
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const rawUrl = config.prismaDatabaseUrl || process.env.PRISMA_DATABASE_URL || config.databaseUrl || process.env.DATABASE_URL || ''

  // Oculta a senha mas mostra qual HOST e BANCO estão sendo chamados pela Vercel
  const maskedUrl = rawUrl.replace(/:([^@]+)@/, ':****@')
  console.log('[VERCEL DB DIAGNOSTIC] URL em uso:', maskedUrl)

  try {
    const retiradas = await prisma.retiradas.findMany({
      orderBy: {
        criado_em: 'desc'
      }
    })

    console.log('[VERCEL DB DIAGNOSTIC] Total de registros encontrados:', retiradas.length)

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
    console.error('[VERCEL DB DIAGNOSTIC] ERRO AO BUSCAR:', error)
    return {
      error: true,
      message: error?.message || String(error),
      code: error?.code
    }
  }
})