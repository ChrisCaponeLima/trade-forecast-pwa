// prisma.config.ts (na RAIZ do projeto)
import { defineConfig } from '@prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL
  }
})