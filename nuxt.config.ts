// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/main.css'],

  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxt/scripts', '@nuxt/test-utils', '@nuxt/ui'],

  runtimeConfig: {
    // Variables serveur (privées, non exposées au client)
    adminPassword: process.env.NUXT_ADMIN_PASSWORD || 'admin',
    gmailUser: process.env.NUXT_GMAIL_USER || '',
    gmailAppPassword: process.env.NUXT_GMAIL_APP_PASSWORD || '',
    notificationEmail: process.env.NUXT_NOTIFICATION_EMAIL || '',
    // Variables publiques (exposées au client)
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
    },
  },

  typescript: {
    tsConfig: {
      include: ['types/**/*.d.ts'],
    },
  },
})
