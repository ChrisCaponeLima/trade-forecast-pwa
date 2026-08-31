// server/api/fix-senha.get.ts
import { defineEventHandler } from 'h3'
import { prisma } from '~/server/utils/prisma'
import { hash } from 'bcryptjs'

export default defineEventHandler(async () => {
  // Gera os hashes reais usando a própria lib do seu projeto
  const hashVania = await hash('1', 10)
  const hashChris = await hash('7', 10)

  // 1. Atualiza a Vânia (senha: 1)
  const vania = await prisma.usuarios.update({
    where: { id: '529bc1c4-320a-4898-8376-53ec45dce33b' },
    data: { senha_hash: hashVania }
  })

  // 2. Atualiza o Chris (senha: 7) - se o ID do Chris for o informado anteriormente
  const chris = await prisma.usuarios.updateMany({
    where: { login: 'chris' },
    data: { senha_hash: hashChris }
  })

  return {
    success: true,
    message: 'Hashes atualizados com sucesso via bcryptjs nativo!',
    novoHashVania: hashVania,
    novoHashChris: hashChris
  }
})

/*
{
    "success": true,
    "message": "Hashes atualizados com sucesso via bcryptjs nativo!",
    "novoHashVania": "$2b$10$RWEUCbq9dGy0I9b3FbzGAur5dGs5aUnciUAaL44eDMHEqqp23VjBm",
    "novoHashChris": "$2b$10$1nYbpGyTUrevlIZcvgkbKeOvFiLVqCS3taGbCws8YO0tE9UEZMUWS"
  }

*/