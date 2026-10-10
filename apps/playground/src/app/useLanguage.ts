import { ref, watchEffect } from 'vue'
import { useEventListener, useLocalStorage } from '@starter/composables'
import { languageSchema } from '../features/settings'
import { matchLocale, useTranslation } from '../i18n'

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
  const { locale } = useTranslation()
  watchEffect(() => {
    locale.value =
      language.value === 'system'
        ? matchLocale(browserLanguages.value)
        : language.value
    document.documentElement.lang = locale.value
  })
  return { language, setLanguage }
}
