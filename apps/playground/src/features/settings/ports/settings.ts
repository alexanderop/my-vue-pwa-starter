// The Updates page translates each status. `null` shows nothing.
export type UpdateStatus =
  | 'updateReady'
  | 'checking'
  | 'upToDate'
  | 'devBuild'
  | 'notReady'
  | 'checkFailed'
  | 'installManually'
  | 'reloadToUpdate'
  | 'offlineSetupFailed'

export type AppCapabilities = {
  readonly installed: { readonly value: boolean }
  readonly canInstall: { readonly value: boolean }
  readonly offlineSupported: { readonly value: boolean }
  readonly offlineReady: { readonly value: boolean }
  readonly updateAvailable: { readonly value: boolean }
  readonly checking: { readonly value: boolean }
  readonly status: { readonly value: UpdateStatus | null }
  install(): Promise<void>
  checkForUpdates(): Promise<void>
}
