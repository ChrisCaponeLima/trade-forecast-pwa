// nuxt.config.ts (na RAIZ do projeto)
export default defineNuxtConfig({
  compatibilityDate: '2026-08-29',
  pages: true,
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'
  ],

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
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}']
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL
  }
})