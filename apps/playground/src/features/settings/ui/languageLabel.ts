import type { Translate } from '../../../i18n'
import type { Language } from '../domain/language'

// Languages are named in their own language, so a reader can always find theirs.
const endonyms = { en: 'English', de: 'Deutsch' } as const

export const languageLabel = (language: Language, t: Translate) =>
  language === 'system' ? t('settings.language.system') : endonyms[language]
