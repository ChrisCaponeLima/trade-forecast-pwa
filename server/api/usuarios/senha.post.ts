// server/api/usuarios/senha.post.ts
import { prisma } from '~/server/utils/prisma'
import { compare, hash, genSalt } from 'bcryptjs'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { usuario, senhaAtual, novaSenha, acao } = body

    if (!usuario || !senhaAtual) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Usuário e senha atual são obrigatórios.'
      })
    }

    const loginLimpo = String(usuario).trim()

    // Busca o usuário na tabela 'usuarios' pelo campo 'login'
    const user = await prisma.usuarios.findFirst({
      where: {
        login: {
          equals: loginLimpo,
          mode: 'insensitive'
        }
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuário não encontrado.'
      })
    }

    // Valida o hash da senha atual no campo 'senha_hash'
    const senhaValida = await compare(String(senhaAtual), user.senha_hash)
    if (!senhaValida) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Senha atual incorreta.'
      })
    }

    // Ação 1: Validação simples para liberar o formulário
    if (acao === 'validar') {
      return { success: true, message: 'Credenciais validadas com sucesso.' }
    }

    // Ação 2: Atualização do hash na tabela 'usuarios'
    if (acao === 'alterar') {
      if (!novaSenha || String(novaSenha).trim().length < 1) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Informe uma nova senha válida.'
        })
      }

      const salt = await genSalt(10)
      const novoHash = await hash(String(novaSenha), salt)

      await prisma.usuarios.update({
        where: { id: user.id },
        data: { 
          senha_hash: novoHash,
          atualizado_em: new Date()
        }
      })

      return { success: true, message: 'Senha alterada com sucesso!' }
    }

    throw createError({
      statusCode: 400,
      statusMessage: 'Ação não informada.'
    })
  } catch (error: any) {
    console.error('[API Senha Error]:', error)

    if (error.statusCode && error.statusCode < 500) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Erro do servidor: ${error?.message || String(error)}`
    })
  }
})