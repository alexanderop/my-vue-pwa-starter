import type { Component } from 'vue'
import { Archive, Download, Palette, RefreshCw, Upload } from '@lucide/vue'
import { appearanceSummary } from '../domain/appearance'
import AppearancePage from './AppearancePage.vue'
import ExportPage from './ExportPage.vue'
import ImportPage from './ImportPage.vue'
import InstallPage from './InstallPage.vue'
import UpdatesPage from './UpdatesPage.vue'
import { appVersion } from './appVersion'
import { definePage, type Page } from './definePage'
import type { SettingsContext } from './settingsContext'
import type { Tone } from './SettingsRow.vue'

type HubSummary = Pick<SettingsContext, 'theme' | 'accent' | 'pwa'>

export type SettingsSection = {
  id: string
  title: string
  icon: Component
  tone: Tone
  // Trailing value on the hub row.
  value?: (summary: HubSummary) => string | undefined
} & Page

export const settingsGroups: readonly {
  id: string
  label?: string
  sections: readonly SettingsSection[]
}[] = [
  {
    id: 'preferences',
    sections: [
      {
        id: 'appearance',
        title: 'Appearance',
        icon: Palette,
        tone: 'primary',
        value: ({ theme, accent }) => appearanceSummary(theme, accent),
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
    ],
  },
  {
    id: 'device',
    label: 'This device',
    sections: [
      {
        id: 'install',
        title: 'Add to Home Screen',
        icon: Download,
        tone: 'success',
        value: ({ pwa }) => (pwa.installed.value ? 'Installed' : undefined),
        ...definePage(InstallPage, ({ pwa }) => ({ pwa })),
      },
      {
        id: 'updates',
        title: 'Updates & offline',
        icon: RefreshCw,
        tone: 'warning',
        value: appVersion,
        ...definePage(UpdatesPage, ({ pwa }) => ({ pwa })),
      },
    ],
  },
  {
    id: 'notes',
    label: 'Your notes',
    sections: [
      {
        id: 'export',
        title: 'Export backup',
        icon: Archive,
        tone: 'pin',
        ...definePage(ExportPage, ({ service, onBusyChange }) => ({
          service,
          onBusyChange,
        })),
      },
      {
        id: 'import',
        title: 'Import backup',
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
