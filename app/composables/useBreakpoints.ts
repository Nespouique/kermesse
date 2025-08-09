import { useBreakpoints } from '@vueuse/core'

export function useMobile() {
  // Breakpoint mobile = moins de 640px
  const breakpoints = useBreakpoints({ sm: 640 })
  const isMobile = breakpoints.smaller('sm')
  return { isMobile }
}
