import { h } from 'vue'
import { vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { RouterView, createMemoryHistory, createRouter } from 'vue-router'
import { Result } from '@starter/result'
import { createIndexedDbNotes, createNotesService } from '../../notes'
import { settingsRoute } from './routes'
import { settingsPropsFor } from './screens'
import type { SettingsContext } from './settingsContext'

const repositories: ReturnType<typeof createIndexedDbNotes>[] = []

export function closeSettingsRepositories() {
  repositories.forEach((repository) => repository.close())
  repositories.length = 0
  vi.unstubAllGlobals()
}

// Renders the real settings routes at `path` against a throwaway IndexedDB.
export async function renderSettings(
  path: string,
  overrides: Partial<SettingsContext> = {},
) {
  vi.stubGlobal('__APP_VERSION__', 'test')
  const repository = createIndexedDbNotes({
    indexedDB,
    name: crypto.randomUUID(),
  })
  repositories.push(repository)
  const service = createNotesService({
    repository,
    now: Date.now,
    newId: () => crypto.randomUUID(),
  })
  const context: SettingsContext = {
    service,
    theme: 'system',
    setTheme: () => Result.ok(),
    accent: 'blue',
    setAccent: () => Result.ok(),
    pwa: {
      installed: { value: false },
      canInstall: { value: false },
      offlineReady: { value: true },
      updateAvailable: { value: false },
      checking: { value: false },
      status: { value: '' },
      install: async () => {},
      checkForUpdates: async () => {},
    },
    onBusyChange: () => {},
    ...overrides,
  }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      settingsRoute,
      { path: '/:pathMatch(.*)*', redirect: '/settings' },
    ],
  })
  await router.push(path)
  await router.isReady()
  // Mirrors App.vue: the outer view hands each settings page its props.
  await render(
    () =>
      h(RouterView, null, {
        default: ({
          Component,
          route,
        }: {
          Component: Parameters<typeof h>[0]
          route: { name?: unknown }
        }) => h(Component, settingsPropsFor(route.name, context)),
      }),
    { global: { plugins: [router] } },
  )
  return { service, router }
}
