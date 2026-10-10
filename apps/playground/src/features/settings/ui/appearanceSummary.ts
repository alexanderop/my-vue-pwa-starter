import type { Translate } from '../../../i18n'
import type { Accent, Theme } from '../domain/appearance'

export const appearanceSummary = (theme: Theme, accent: Accent, t: Translate) =>
  t('settings.appearance.summary', {
    theme: t(`settings.appearance.themes.${theme}`),
    accent: t(`settings.appearance.accents.${accent}`),
  })
