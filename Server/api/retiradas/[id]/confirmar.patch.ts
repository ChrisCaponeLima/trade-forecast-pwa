// server/api/retiradas/[id]/confirmar.patch.ts
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { compare } from 'bcryptjs'

interface ConfirmarRetiradaBody {
  senha: string | number
}

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody<ConfirmarRetiradaBody>(event)

    console.log('\n=================== [INSPEÇÃO DE SEGURANÇA E SQL] ===================')
    console.log('➜ 1. ROTA PARAM (id da retirada):', id)
    console.log('➜ 2. PAYLOAD RECEBIDO (body):', JSON.stringify(body))
    console.log('➜ 3. SENHA BRUTA:', body?.senha)
    console.log('➜ 4. TIPO DA SENHA ENVIADA:', typeof body?.senha)

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID da retirada não informado.'
      })
    }

    if (body?.senha === undefined || body?.senha === null || String(body.senha).trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Por favor, informe a senha para aprovação.'
      })
    }

    // QUERY SQL 1: Buscar a Retirada pelo ID
    console.log('\n[SQL 1] Executando busca da retirada...')
    const retirada = await prisma.retiradas.findUnique({
      where: { id }
    })

    if (!retirada) {
      console.log('❌ Retirada não localizada.')
      throw createError({
        statusCode: 404,
        statusMessage: 'Registro de retirada não encontrado.'
      })
    }

    console.log('✔ Retirada encontrada:')
    console.log('  - Descrição:', retirada.semana_ref)
    console.log('  - Sacado ID (FK):', retirada.sacado_id)
    console.log('  - Sacado Nome:', retirada.sacado_nome)

    if (retirada.status_transferencia === 'CONCLUIDO') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Esta retirada já foi concluída anteriormente.'
      })
    }

    if (!retirada.sacado_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Esta retirada não possui sacado vinculado.'
      })
    }

    // QUERY SQL 2: Buscar o Usuário / Sacado no Banco
    console.log(`\n[SQL 2] Executando busca do sacado com ID = '${retirada.sacado_id}'...`)
    const sacado = await prisma.usuarios.findUnique({
      where: { id: retirada.sacado_id }
    })

    if (!sacado) {
      console.log('❌ Sacado não localizado na tabela usuarios.')
      throw createError({
        statusCode: 404,
        statusMessage: 'O sacado responsável por esta retirada não foi encontrado.'
      })
    }

    const senhaTratada = String(body.senha).trim()
    const hashTratado = String(sacado.senha_hash || '').trim()

    console.log('✔ Sacado retornado da tabela usuarios:')
    console.log('  - ID:', sacado.id)
    console.log('  - Nome:', sacado.nome)
    console.log('  - Login:', sacado.login)
    console.log(`  - Senha que chegou (convertida em string): "${senhaTratada}" (Tamanho: ${senhaTratada.length})`)
    console.log(`  - Hash retornado da coluna senha_hash: "${hashTratado}" (Tamanho: ${hashTratado.length})`)

    if (!hashTratado) {
      console.log('❌ A coluna senha_hash está NULL ou vazia no banco de dados.')
      throw createError({
        statusCode: 400,
        statusMessage: 'O sacado não possui senha cadastrada.'
      })
    }

    // TESTE DE COMPARAÇÃO BCRYPT
    console.log('\n[BCRYPT] Testando compare(senha, hash)...')
    const senhaValida = await compare(senhaTratada, hashTratado)
    console.log('  - Resultado do compare():', senhaValida ? '✅ VERDADEIRO (APROVADO)' : '❌ FALSO (REJEITADO)')
    console.log('=====================================================================\n')

    if (!senhaValida) {
      throw createError({
        statusCode: 401,
        statusMessage: `Senha incorreta para a aprovação de ${sacado.nome}.`
      })
    }

    // QUERY SQL 3: Atualizar status
    const retiradaAtualizada = await prisma.retiradas.update({
      where: { id },
      data: {
        status_transferencia: 'CONCLUIDO',
        atualizado_em: new Date()
      }
    })

    return {
      success: true,
      message: `Aprovação realizada com sucesso para ${sacado.nome}.`,
      data: retiradaAtualizada
    }
  } catch (error: any) {
    console.error('Erro na confirmação da retirada:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro ao processar a aprovação.'
    })
  }
})