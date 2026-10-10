import { ref, watchEffect } from 'vue'
import { useEventListener, useLocalStorage } from '@starter/composables'
import { languageSchema } from '../features/settings'
import { matchLocale, useLocaleSetter, type Locale } from '../i18n'

export function useLanguage() {
  const { state: language, set: setLanguage } = useLocalStorage(
    'fieldnotes-language',
    languageSchema,
    { fallback: 'system' },
  )
  const browserLanguages = ref(navigator.languages)
  useEventListener(window, 'languagechange', () => {
    browserLanguages.value = navigator.languages
  })
  const setLocale = useLocaleSetter()
  watchEffect(() => {
    // A language id that is not a Locale fails to compile here.
    const locale: Locale =
      language.value === 'system'
        ? matchLocale(browserLanguages.value)
        : language.value
    setLocale(locale)
    document.documentElement.lang = locale
  })
  return { language, setLanguage }
}
