// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/main.css'],

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxtjs/color-mode',
  ],

  colorMode: {
    classSuffix: '', // pour avoir .dark/.light directement
    preference: 'system', // 'system' pour suivre le système, 'light' ou 'dark' pour forcer
    fallback: 'light', // si rien n'est trouvé
    storageKey: 'nuxt-color-mode',
  },

  runtimeConfig: {
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
