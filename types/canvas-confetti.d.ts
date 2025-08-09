declare module 'canvas-confetti' {
  interface ConfettiOrigin {
    x?: number
    y?: number
  }
  interface ConfettiOptions {
    particleCount?: number
    spread?: number
    origin?: ConfettiOrigin
    startVelocity?: number
    ticks?: number
    gravity?: number
    scalar?: number
    drift?: number
    colors?: string[]
    shapes?: string[]
    zIndex?: number
    disableForReducedMotion?: boolean
  }
  function confetti(options?: ConfettiOptions): void
  export default confetti
}
