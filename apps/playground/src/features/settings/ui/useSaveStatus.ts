import { computed, ref } from 'vue'
import type { Result } from '@starter/result'
import type { StorageWriteError } from '@starter/composables'
import { useTranslation } from '../../../i18n'

// A preference that failed to persist still applies for this session. Say so.
// The failure is kept as a tag, so the message follows a language change.
export function useSaveStatus() {
  const { t } = useTranslation()
  const failure = ref<StorageWriteError['_tag'] | null>(null)
  const message = computed(() =>
    failure.value ? t(`settings.saveErrors.${failure.value}`) : '',
  )
  function report(saved: Result<void, StorageWriteError>) {
    failure.value = saved.isErr() ? saved.error._tag : null
  }
  return { message, report }
}
