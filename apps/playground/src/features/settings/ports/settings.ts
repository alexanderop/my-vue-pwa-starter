export type Theme = 'system' | 'light' | 'dark'
export type Accent = 'blue' | 'teal' | 'violet' | 'pink' | 'sand'
export type AppCapabilities = {
  readonly installed: { readonly value: boolean }
  readonly canInstall: { readonly value: boolean }
  readonly offlineReady: { readonly value: boolean }
  readonly checking: { readonly value: boolean }
  readonly status: { readonly value: string }
  install(): Promise<void>
  checkForUpdates(): Promise<void>
}
