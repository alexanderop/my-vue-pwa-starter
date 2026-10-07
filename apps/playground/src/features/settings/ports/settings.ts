export type Theme = 'system' | 'light' | 'dark'
export interface AppCapabilities {
  readonly installed: { readonly value: boolean }
  readonly canInstall: { readonly value: boolean }
  readonly offlineReady: { readonly value: boolean }
  readonly checking: { readonly value: boolean }
  readonly status: { readonly value: string }
  install(): Promise<void>
  checkForUpdates(): Promise<void>
}
