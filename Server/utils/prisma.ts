// server/utils/prisma.ts
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// 1. Obtém a string de conexão tratando a runtimeConfig do Nuxt e variáveis
const config = useRuntimeConfig()
const rawUrl =
  (config.prismaDatabaseUrl as string) ||
  process.env.PRISMA_DATABASE_URL ||
  (config.databaseUrl as string) ||
  process.env.DATABASE_URL ||
  ''

// 2. Remove parâmetros que causam falhas no Neon Serverless
const connectionString = rawUrl
  .replace('channel_binding=require&', '')
  .replace('&channel_binding=require', '')

// 3. Em Serverless (Vercel), maxConnections deve ser baixo (ex: 1) para evitar conexões fantasmas
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

const pool = new pg.Pool({
  connectionString,
  max: isVercel ? 1 : 10, // Evita estouro e congelamento de pool na Vercel
  idleTimeoutMillis: isVercel ? 1000 : 30000,
  connectionTimeoutMillis: 5000,
})

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