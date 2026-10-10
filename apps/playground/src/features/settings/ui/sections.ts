import type { Component } from 'vue'
import type { Translate } from '../../../i18n'
import {
  Archive,
  Download,
  Languages,
  Palette,
  RefreshCw,
  Upload,
} from '@lucide/vue'
import AppearancePage from './AppearancePage.vue'
import ExportPage from './ExportPage.vue'
import ImportPage from './ImportPage.vue'
import InstallPage from './InstallPage.vue'
import LanguagePage from './LanguagePage.vue'
import UpdatesPage from './UpdatesPage.vue'
import { appearanceSummary } from './appearanceSummary'
import { appVersion } from './appVersion'
import { definePage, type Page } from './definePage'
import { languageLabel } from './languageLabel'
import type { SettingsContext } from './settingsContext'
import type { Tone } from './SettingsRow.vue'

type HubSummary = Pick<SettingsContext, 'theme' | 'accent' | 'language' | 'pwa'>

export type SettingsSection = {
  id: 'appearance' | 'language' | 'install' | 'updates' | 'export' | 'import'
  icon: Component
  tone: Tone
  // Trailing value on the hub row.
  value?: (summary: HubSummary, t: Translate) => string | undefined
} & Page

// The hub row label is the page title: `settings.<id>.title`.
export const sectionTitle = ({ id }: Pick<SettingsSection, 'id'>) =>
  `settings.${id}.title` as const

export const settingsGroups: readonly {
  id: string
  label?: 'settings.groups.device' | 'settings.groups.notes'
  sections: readonly SettingsSection[]
}[] = [
  {
    id: 'preferences',
    sections: [
      {
        id: 'appearance',
        icon: Palette,
        tone: 'primary',
        value: ({ theme, accent }, t) => appearanceSummary(theme, accent, t),
        ...definePage(
          AppearancePage,
          ({ theme, setTheme, accent, setAccent }) => ({
            theme,
            setTheme,
            accent,
            setAccent,
          }),
        ),
      },
      {
        id: 'language',
        icon: Languages,
        tone: 'primary',
        value: ({ language }, t) => languageLabel(language, t),
        ...definePage(LanguagePage, ({ language, setLanguage }) => ({
          language,
          setLanguage,
        })),
      },
    ],
  },
  {
    id: 'device',
    label: 'settings.groups.device',
    sections: [
      {
        id: 'install',
        icon: Download,
        tone: 'success',
        value: ({ pwa }, t) =>
          pwa.installed.value ? t('settings.install.installed') : undefined,
        ...definePage(InstallPage, ({ pwa }) => ({ pwa })),
      },
      {
        id: 'updates',
        icon: RefreshCw,
        tone: 'warning',
        value: appVersion,
        ...definePage(UpdatesPage, ({ pwa }) => ({ pwa })),
      },
    ],
  },
  {
    id: 'notes',
    label: 'settings.groups.notes',
    sections: [
      {
        id: 'export',
        icon: Archive,
        tone: 'pin',
        ...definePage(ExportPage, ({ service, onBusyChange }) => ({
          service,
          onBusyChange,
        })),
      },
      {
        id: 'import',
        icon: Upload,
        tone: 'muted',
        ...definePage(ImportPage, ({ service, onBusyChange }) => ({
          service,
          onBusyChange,
        })),
      },
    ],
  },
]

export const settingsSections = settingsGroups.flatMap(
  (group) => group.sections,
)

export const routeNameFor = ({ id }: { id: string }) => `settings-${id}`
