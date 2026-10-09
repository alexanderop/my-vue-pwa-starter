import { onUnmounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useEventListener } from '@starter/composables'

// A backup in flight blocks leaving the page and reports itself as busy so an
// app update cannot reload the tab underneath it.
export function useBackupTask(onBusyChange: (busy: boolean) => void) {
  const busy = ref(false)
  const message = ref('')
  const error = ref('')
  onBeforeRouteLeave(() => !busy.value)
  useEventListener(window, 'beforeunload', (event) => {
    if (!busy.value) return
    event.preventDefault()
  })
  onUnmounted(() => {
    onBusyChange(false)
  })
  async function run(task: () => Promise<void>, failure: string) {
    busy.value = true
    message.value = ''
    error.value = ''
    onBusyChange(true)
    try {
      await task()
    } catch {
      error.value = failure
    } finally {
      busy.value = false
      onBusyChange(false)
    }
  }
  return { busy, message, error, run }
}
