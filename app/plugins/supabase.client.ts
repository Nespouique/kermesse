import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // Primary from runtimeConfig (public)
  let supabaseUrl = (config.public.supabaseUrl || '').trim()
  let supabaseAnonKey = (config.public.supabaseAnonKey || '').trim()

  // Fallback to import.meta.env (en cas de build/dev où runtimeConfig n'est pas injecté comme attendu)
  // Nuxt expose aussi ces variables en import.meta.env si elles commencent par NUXT_PUBLIC_
  if (!supabaseUrl && typeof import.meta !== 'undefined') {
    interface EnvMeta {
      env?: Record<string, string>
    }
    const meta = import.meta as unknown as EnvMeta
    const raw = meta.env?.NUXT_PUBLIC_SUPABASE_URL || ''
    supabaseUrl = raw.trim()
  }
  if (!supabaseAnonKey && typeof import.meta !== 'undefined') {
    interface EnvMeta {
      env?: Record<string, string>
    }
    const meta = import.meta as unknown as EnvMeta
    const raw = meta.env?.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
    supabaseAnonKey = raw.trim()
  }

  // Fallback globalThis.__NUXT__ runtime (peut arriver si hydration spécifique)
  if ((!supabaseUrl || !supabaseAnonKey) && typeof globalThis !== 'undefined') {
    const nuxtGlobal = globalThis as unknown as {
      __NUXT__?: { config?: { public?: Record<string, string> } }
    }
    const rtPub = nuxtGlobal.__NUXT__?.config?.public
    if (rtPub) {
      supabaseUrl = supabaseUrl || rtPub.supabaseUrl || ''
      supabaseAnonKey = supabaseAnonKey || rtPub.supabaseAnonKey || ''
    }
  }

  // Dernier recours: variables globales éventuelles (non standard)
  if (!supabaseUrl && typeof window !== 'undefined') {
    supabaseUrl =
      (window as unknown as Record<string, string>).NUXT_PUBLIC_SUPABASE_URL || supabaseUrl
  }
  if (!supabaseAnonKey && typeof window !== 'undefined') {
    supabaseAnonKey =
      (window as unknown as Record<string, string>).NUXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey
  }

  // Debug détaillé (dev seulement) si manquant
  if ((!supabaseUrl || !supabaseAnonKey) && import.meta.dev) {
    console.warn(
      '[Supabase][Debug] Manque URL ou clé. runtimeConfig URL:',
      config.public.supabaseUrl
    )
  }

  if ((!supabaseUrl || !supabaseAnonKey) && import.meta.dev) {
    console.warn(
      "[Supabase] Variables manquantes. Assurez-vous de définir NUXT_PUBLIC_SUPABASE_URL et NUXT_PUBLIC_SUPABASE_ANON_KEY dans un fichier .env(.local) ou vos variables d'environnement avant de lancer `npm run dev`."
    )
  }

  const supabase: SupabaseClient | null =
    supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

  return { provide: { supabase } }
})
