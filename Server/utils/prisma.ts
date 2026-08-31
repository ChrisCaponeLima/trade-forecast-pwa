// server/utils/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Obtém a URL do runtimeConfig do Nuxt ou do ambiente process.env
const config = useRuntimeConfig()
const rawUrl =
  (config.prismaDatabaseUrl as string) ||
  process.env.PRISMA_DATABASE_URL ||
  (config.databaseUrl as string) ||
  process.env.DATABASE_URL ||
  ''

// Sanitiza a URL para evitar o erro do channel_binding do Neon no driver Serverless
const connectionString = rawUrl
  .replace('channel_binding=require&', '')
  .replace('&channel_binding=require', '')

// Configura a pool de conexão do PostgreSQL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma