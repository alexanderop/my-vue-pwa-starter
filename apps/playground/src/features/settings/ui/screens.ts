import { routeNameFor, settingsSections } from './sections'
import { definePage, type Page } from './definePage'
import type { SettingsContext } from './settingsContext'
import SettingsHub from './SettingsHub.vue'

export type SettingsScreen = { name: string; path: string } & Page

// The hub plus one screen per section. Routes and page props both come from here.
export const settingsScreens: readonly SettingsScreen[] = [
  {
    name: 'settings',
    path: '',
    ...definePage(SettingsHub, ({ theme, accent, language, pwa }) => ({
      theme,
      accent,
      language,
      pwa,
    })),
  },
  ...settingsSections.map((section) => ({
    name: routeNameFor(section),
    path: section.id,
    page: section.page,
    propsFor: section.propsFor,
  })),
]

// Props for the settings page behind a route name, or undefined for any other route.
export function settingsPropsFor(name: unknown, context: SettingsContext) {
  return settingsScreens
    .find((screen) => screen.name === name)
    ?.propsFor(context)
}
