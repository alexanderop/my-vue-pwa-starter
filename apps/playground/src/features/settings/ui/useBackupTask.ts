import { computed, onUnmounted, shallowRef } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useEventListener } from '@starter/composables'

// Outcomes are kept as functions that translate on render, so a message
// follows a language change.
type Text = () => string

// A backup in flight blocks leaving the page and reports itself as busy so an
// app update cannot reload the tab underneath it.
export function useBackupTask(onBusyChange: (busy: boolean) => void) {
  const busy = shallowRef(false)
  const outcome = shallowRef<Text | null>(null)
  const failure = shallowRef<Text | null>(null)
  onBeforeRouteLeave(() => !busy.value)
  useEventListener(window, 'beforeunload', (event) => {
    if (!busy.value) return
    event.preventDefault()
  })
  onUnmounted(() => {
    onBusyChange(false)
  })
  async function run(task: () => Promise<void>, unexpected: Text) {
    busy.value = true
    outcome.value = null
    failure.value = null
    onBusyChange(true)
    try {
      await task()
    } catch {
      failure.value = unexpected
    } finally {
      busy.value = false
      onBusyChange(false)
    }
  }
  return {
    busy,
    outcome,
    failure,
    message: computed(() => outcome.value?.() ?? ''),
    error: computed(() => failure.value?.() ?? ''),
    run,
  }
}
