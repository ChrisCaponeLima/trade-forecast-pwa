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

// Detecta se está executando em ambiente Vercel Serverless
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'

// 3. Configura a Pool de conexões tratada para Serverless x Local
const pool = new pg.Pool({
  connectionString,
  max: isVercel ? 1 : 10,
  idleTimeoutMillis: isVercel ? 1000 : 30000,
  connectionTimeoutMillis: 10000, // Aumentado para tolerar handshake de Serverless
  allowExitOnIdle: true,
})

// Tratamento global de erro no pool para prevenir UnhandledPromiseRejection em funções Serverless congeladas
pool.on('error', (err) => {
  console.error('[pg.Pool Error]: Conexão inativa encerrada no serverless', err)
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