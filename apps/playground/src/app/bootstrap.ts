import { createRouter, createWebHistory } from 'vue-router'
import NotesPage from '../features/notes/ui/NotesPage.vue'
import SettingsPage from '../features/settings/ui/SettingsPage.vue'
import { createIndexedDbNotes, createNotesService } from '../features/notes'

export function createApplication() {
  const repository = createIndexedDbNotes({ indexedDB: window.indexedDB })
  const notes = createNotesService({
    repository,
    now: Date.now,
    newId: () => crypto.randomUUID(),
  })
  const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
      {
        path: '/',
        name: 'notes',
        component: NotesPage,
      },
      {
        path: '/settings',
        name: 'settings',
        component: SettingsPage,
      },
      { path: '/:pathMatch(.*)*', redirect: '/' },
    ],
  })
  return { notes, router, close: () => repository.close() }
}
