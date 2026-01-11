// Types globaux pour les routes serveur Nitro
// Ces fonctions sont injectées automatiquement par Nitro dans le contexte serveur

import type { H3Event } from 'h3'

declare global {
  function defineEventHandler<T = unknown>(
    handler: (event: H3Event) => T | Promise<T>
  ): (event: H3Event) => T | Promise<T>

  function readBody<T = unknown>(event: H3Event): Promise<T>

  function useRuntimeConfig(): {
    gmailUser: string
    gmailAppPassword: string
    notificationEmail: string
  }

  function createError(options: {
    statusCode?: number
    statusMessage?: string
    message?: string
    data?: unknown
  }): Error
}

export {}
