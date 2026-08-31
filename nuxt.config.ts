// nuxt.config.ts (na RAIZ do projeto)
export default defineNuxtConfig({
  compatibilityDate: '2026-08-29',
  pages: true,
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'
  ],

  // Garante que o Nitro/Vercel execute as funções de API em runtime Serverless real
  routeRules: {
    '/api/**': { cache: false, cors: true }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Gestão de Retiradas & Forecast',
      short_name: 'ForecastApp',
      description: 'Sistema de gestão de forecast e retiradas semanais (Chris & Vânia)',
      theme_color: '#0f172a',
      background_color: '#0f172a',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: 'icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      navigateFallback: undefined,
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true
    }
  },

  runtimeConfig: {
    prismaDatabaseUrl: process.env.PRISMA_DATABASE_URL,
    databaseUrl: process.env.DATABASE_URL
  }
})