export default defineNuxtRouteMiddleware(async (to, _from) => {
  // Skip for admin routes
  if (to.path.startsWith('/admin')) return

  // Use a shared state to track if birth check is done
  const birthCheckDone = useState<boolean>('birthCheckDone', () => false)
  const isBornState = useState<boolean | null>('isBorn', () => null)

  // Client-side only check
  if (import.meta.client) {
    try {
      const config = await $fetch<{ is_born: boolean }>('/api/config')

      const isBorn = config?.is_born
      isBornState.value = isBorn
      birthCheckDone.value = true

      if (isBorn) {
        if (to.path === '/' || to.path === '/index') {
          return navigateTo('/welcome', { replace: true })
        }
      } else {
        if (to.path === '/welcome') {
          return navigateTo('/', { replace: true })
        }
      }
    } catch (e) {
      console.error('Middleware error:', e)
      birthCheckDone.value = true
    }
  }
})
