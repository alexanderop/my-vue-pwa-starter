import { computed, watchEffect } from 'vue'
import { useLocalStorage, useMediaQuery } from '@starter/composables'
import { accentSchema, themeSchema } from '../features/settings'

export function useTheme() {
  const { state: theme, set: setTheme } = useLocalStorage(
    'fieldnotes-theme',
    themeSchema,
    { fallback: 'system' },
  )
  const { state: accent, set: setAccent } = useLocalStorage(
    'fieldnotes-accent',
    accentSchema,
    { fallback: 'blue' },
  )
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const dark = computed(
    () =>
      theme.value === 'dark' || (theme.value === 'system' && systemDark.value),
  )
  watchEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', dark.value)
    root.dataset.theme = dark.value ? 'dark' : 'light'
    root.dataset.accent = accent.value
    root.style.colorScheme = dark.value ? 'dark' : 'light'
    document
      .querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        getComputedStyle(root).getPropertyValue('--color-background').trim(),
      )
  })
  return { theme, setTheme, accent, setAccent }
}
