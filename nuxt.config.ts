// nuxt.config.ts (na RAIZ do projeto)
export default defineNuxtConfig({
  compatibilityDate: '2026-08-29',
  pages: true,

  // Configuração global de Head/Meta para navegadores e PWA (iOS / Android)
  app: {
    head: {
      title: 'Meu Trade',
      link: [
        { rel: 'icon', type: 'image/png', href: '/icon-192x192.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/icon-192x192.png' }
      ],
      meta: [
        { name: 'theme-color', content: '#0f172a' },
        { name: 'apple-mobile-web-app-title', content: 'Meu Trade' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
      ]
    }
  },

  // Ativa a compatibilidade correta do Nuxt 4 com a pasta app/ e server/
  future: {
    compatibilityVersion: 4,
  },

  // Garante a geração das funções serverless na Vercel
  nitro: {
    preset: 'vercel'
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'
  ],

  routeRules: {
    '/api/**': { cache: false, cors: true }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Meu Trade',
      short_name: 'Meu Trade',
      description: 'Sistema de gestão de forecast, performance e retiradas.',
      theme_color: '#0f172a',
      background_color: '#0f172a',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512x512.png',
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