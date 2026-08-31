// server/api/retiradas/index.post.ts
import { prisma } from '~/server/utils/prisma'

interface ItemSemanaPayload {
  semanaRef: string
  valorDevido: number
}

/**
 * Normaliza o formato da semana para garantir a estrutura "Mês - Semana X"
 */
function formatarSemanaRef(semanaStr: string, dataRef: Date): string {
  if (!semanaStr) {
    const mesExtenso = dataRef.toLocaleDateString('pt-BR', { month: 'long' })
    const mesCap = mesExtenso.charAt(0).toUpperCase() + mesExtenso.slice(1)
    const diaDoMes = dataRef.getDate()
    const numeroSemana = Math.ceil(diaDoMes / 7)
    return `${mesCap} - Semana ${numeroSemana}`
  }

  // Se já contém hífen (ex: "Agosto - Semana 2"), mantém o valor
  if (semanaStr.includes('-')) {
    return semanaStr.trim()
  }

  // Se veio apenas "Semana 2", adiciona o mês da data da retirada
  const mesExtenso = dataRef.toLocaleDateString('pt-BR', { month: 'long' })
  const mesCap = mesExtenso.charAt(0).toUpperCase() + mesExtenso.slice(1)

  return `${mesCap} - ${semanaStr.trim()}`
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    const {
      sacadoNome,
      semanas,
      semanaRef,
      valorDevido,
      valorRetirada,
      valorTotalRetirada,
      dataRetirada,
      statusTransferencia,
      observacoes
    } = body

    const valorEfetivoRetirada = valorTotalRetirada !== undefined ? Number(valorTotalRetirada) : Number(valorRetirada)

    if (!sacadoNome || valorEfetivoRetirada === undefined || isNaN(valorEfetivoRetirada)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Parâmetros obrigatórios ausentes (sacadoNome, valorRetirada).'
      })
    }

    let sacadoId: string | null = null
    if (sacadoNome) {
      const usuario = await prisma.usuarios.findFirst({
        where: {
          nome: {
            contains: sacadoNome,
            mode: 'insensitive'
          }
        },
        select: { id: true }
      })
      if (usuario) {
        sacadoId = usuario.id
      }
    }

    const dataRetiradaFormatada = dataRetirada ? new Date(dataRetirada) : new Date()

    let listaSemanas: ItemSemanaPayload[] = []

    if (Array.isArray(semanas) && semanas.length > 0) {
      listaSemanas = semanas
    } else if (semanaRef) {
      listaSemanas = [{
        semanaRef,
        valorDevido: valorDevido ? Number(valorDevido) : valorEfetivoRetirada
      }]
    }

    if (listaSemanas.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'É necessário informar ao menos uma semana de origem para abater a retirada.'
      })
    }

    let valorRestante = valorEfetivoRetirada
    const registrosParaCriar = []

    for (const sem of listaSemanas) {
      if (valorRestante <= 0) break

      const devidoNaSemana = Number(sem.valorDevido) || valorRestante
      const valorAlocado = Math.min(valorRestante, devidoNaSemana)

      // Garante o formato "Agosto - Semana X"
      const semanaRefFormatada = formatarSemanaRef(sem.semanaRef, dataRetiradaFormatada)

      registrosParaCriar.push({
        semana_ref: semanaRefFormatada,
        sacado_nome: sacadoNome,
        sacado_id: sacadoId,
        valor_devido: devidoNaSemana,
        valor_retirada: Number(valorAlocado.toFixed(2)),
        data_retirada: dataRetiradaFormatada,
        status_transferencia: statusTransferencia || 'EM_PROCESSAMENTO',
        observacoes: observacoes || null
      })

      valorRestante -= valorAlocado
    }

    if (valorRestante > 0 && registrosParaCriar.length > 0) {
      const ultimoRegistro = registrosParaCriar[registrosParaCriar.length - 1]
      ultimoRegistro.valor_retirada = Number((ultimoRegistro.valor_retirada + valorRestante).toFixed(2))
    }

    const criados = await prisma.$transaction(
      registrosParaCriar.map(data => prisma.retiradas.create({ data }))
    )

    return {
      success: true,
      data: criados
    }
  } catch (error: any) {
    console.error('Erro ao salvar retirada no banco de dados:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro interno ao registrar a retirada.'
    })
  }
})