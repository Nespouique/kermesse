import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    gmailUser: config.gmailUser || 'Non configuré',
    notificationEmail: config.notificationEmail || 'Non configuré',
    hasPassword: Boolean(config.gmailAppPassword),
  }
})
