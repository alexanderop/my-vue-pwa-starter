import type { Translate } from '../../../i18n'
import type { AppCapabilities } from '../ports/settings'

export function offlineStatus(
  {
    offlineReady,
    offlineSupported,
  }: Pick<AppCapabilities, 'offlineReady' | 'offlineSupported'>,
  t: Translate,
) {
  if (offlineReady.value) return t('app.offlineReady')
  return offlineSupported.value
    ? t('settings.preparing')
    : t('settings.unavailable')
}
