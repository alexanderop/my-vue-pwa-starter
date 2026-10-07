import { onUnmounted, ref, watch } from 'vue'
import type { Theme } from '../features/settings/ports/settings'
export function useTheme() {
  const preference = ref<Theme>('system')
  try {
    const stored = localStorage.getItem('fieldnotes-theme')
    if (stored === 'light' || stored === 'dark') preference.value = stored
  } catch {}
  const system = matchMedia('(prefers-color-scheme: dark)')
  function apply() {
    const dark =
      preference.value === 'dark' ||
      (preference.value === 'system' && system.matches)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }
  watch(preference, (value) => {
    apply()
    try {
      localStorage.setItem('fieldnotes-theme', value)
    } catch {}
  })
  system.addEventListener('change', apply)
  onUnmounted(() => system.removeEventListener('change', apply))
  apply()
  return preference
}
