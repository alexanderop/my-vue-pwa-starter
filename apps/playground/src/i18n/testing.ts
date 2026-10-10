import { createAppI18n, strictTranslator, type Locale } from './index'

// Tests look text up by key, so a copy change never breaks a selector.
export const translator = (locale: Locale) =>
  strictTranslator(createAppI18n(locale).global)

export const { t, list } = translator('en')
