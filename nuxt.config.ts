// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-08-29',
  pages: true, // Força a ativação do roteador do Nuxt
  
  // Módulos essenciais do projeto
  modules: [
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'
  ],

  // Configuração do PWA (Progressive Web App)
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Gestão de Retiradas & Forecast',
      short_name: 'ForecastApp',
      description: 'Sistema de gestão de forecast e retiradas semanais (Chris & Vânia)',
      theme_color: '#0f172a', // Tom dark (slate-900)
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

  // Suporte a variáveis de ambiente (.env)
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL
  }
})