import { ref } from 'vue'
import { useTranslation } from '../../../i18n'
import { matchError, type Result } from '@starter/result'
import type { StorageWriteError } from '@starter/composables'

// A preference that failed to persist still applies for this session. Say so.
export function useSaveStatus() {
  const { t } = useTranslation()
  const message = ref('')
  function report(saved: Result<void, StorageWriteError>) {
    message.value = saved.match({
      ok: () => '',
      err: (error) =>
        matchError(error, {
          StorageQuotaExceeded: () =>
            t('settings.saveErrors.StorageQuotaExceeded'),
          StorageUnavailable: () => t('settings.saveErrors.StorageUnavailable'),
        }),
    })
  }
  return { message, report }
}
