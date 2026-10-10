import type { Result } from '@starter/result'
import type { StorageWriteError } from '@starter/composables'
import type { NotesService } from '../../notes'
import type { Accent, Theme } from '../domain/appearance'
import type { Language } from '../domain/language'
import type { AppCapabilities } from '../ports/settings'

export type SaveChoice<T> = (choice: T) => Result<void, StorageWriteError>

export type SettingsContext = {
  service: NotesService
  theme: Theme
  setTheme: SaveChoice<Theme>
  accent: Accent
  setAccent: SaveChoice<Accent>
  language: Language
  setLanguage: SaveChoice<Language>
  pwa: AppCapabilities
  onBusyChange: (busy: boolean) => void
}
