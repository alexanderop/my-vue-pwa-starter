import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue'

interface InstallPrompt extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePwa(busy: Ref<boolean>) {
  const online = ref(navigator.onLine)
  const offlineReady = ref(false)
  const updateState = ref<'current' | 'waiting' | 'reload'>('current')
  const deferred = ref(false)
  const updating = ref(false)
  const checking = ref(false)
  const status = ref('')
  const installed = ref(window.matchMedia('(display-mode: standalone)').matches)
  const prompt = ref<InstallPrompt | null>(null)
  let registration: ServiceWorkerRegistration | undefined
  let controller = navigator.serviceWorker?.controller
  let approved = false
  let disposed = false
  const cleanups: (() => void)[] = []

  function listen(target: EventTarget, event: string, listener: EventListener) {
    target.addEventListener(event, listener)
    cleanups.push(() => target.removeEventListener(event, listener))
  }
  function watchWorker(worker: ServiceWorker) {
    const sync = () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) {
        updateState.value = 'waiting'
        deferred.value = false
      }
      if (worker.state === 'activated') offlineReady.value = true
    }
    listen(worker, 'statechange', sync)
    sync()
  }
  async function checkForUpdates() {
    if (!registration) {
      status.value = import.meta.env.DEV
        ? 'Offline installation is available in the production build.'
        : 'The app is not ready to check for updates yet.'
      return
    }
    checking.value = true
    try {
      await registration.update()
      if (registration.waiting) updateState.value = 'waiting'
      if (updateState.value !== 'current') deferred.value = false
      status.value =
        updateState.value !== 'current'
          ? 'A new version is ready when you are.'
          : registration.installing
            ? 'Checking the latest version…'
            : 'You are up to date.'
    } catch {
      status.value =
        'Could not check for updates. Try again when you are online.'
    } finally {
      checking.value = false
    }
  }
  function update() {
    if (busy.value) return
    if (updateState.value === 'reload') {
      window.location.reload()
      return
    }
    if (!registration?.waiting) return
    approved = true
    updating.value = true
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
  async function install() {
    const available = prompt.value
    if (!available) return
    prompt.value = null
    try {
      await available.prompt()
      const choice = await available.userChoice
      if (choice.outcome === 'accepted') installed.value = true
    } catch {
      status.value = 'Use your browser menu to install this app.'
    }
  }
  onMounted(() => {
    listen(window, 'online', () => {
      online.value = true
    })
    listen(window, 'offline', () => {
      online.value = false
    })
    listen(window, 'beforeinstallprompt', (event) => {
      event.preventDefault()
      prompt.value = event as InstallPrompt
    })
    listen(window, 'appinstalled', () => {
      installed.value = true
      prompt.value = null
    })
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return
    listen(navigator.serviceWorker, 'controllerchange', () => {
      const previous = controller
      controller = navigator.serviceWorker.controller
      if (!previous || previous === controller) return
      updateState.value = 'reload'
      deferred.value = false
      updating.value = false
      if (approved && !busy.value) window.location.reload()
      else
        status.value =
          'An update is ready. Save your changes, then update this tab.'
    })
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, {
        scope: import.meta.env.BASE_URL,
      })
      .then((value) => {
        if (disposed) return
        registration = value
        offlineReady.value = value.active?.state === 'activated'
        if (value.waiting) updateState.value = 'waiting'
        listen(value, 'updatefound', () => {
          if (value.installing) watchWorker(value.installing)
        })
        if (value.installing) watchWorker(value.installing)
      })
      .catch(() => {
        if (!disposed)
          status.value =
            'Offline setup could not finish. Reopen the app online to try again.'
      })
  })
  onUnmounted(() => {
    disposed = true
    for (const cleanup of cleanups) cleanup()
  })
  return {
    online,
    offlineReady,
    updateAvailable: computed(() => updateState.value !== 'current'),
    deferred,
    updating,
    checking,
    status,
    installed,
    canInstall: computed(() => prompt.value !== null),
    checkForUpdates,
    update,
    install,
  }
}
