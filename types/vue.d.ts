// Vue Single File Component shim
// (isolated module to avoid augmentation errors)
import type { DefineComponent } from 'vue'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const _default: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
export default _default

declare module '*.vue' {
  export { _default as default }
}
