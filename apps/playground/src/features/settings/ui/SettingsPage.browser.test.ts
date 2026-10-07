import { afterEach, expect, test, vi } from 'vitest'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-vue'
import { createIndexedDbNotes, createNotesService } from '../../notes'
import SettingsPage from './SettingsPage.vue'

const repositories: ReturnType<typeof createIndexedDbNotes>[] = []
afterEach(() => {
  repositories.forEach((repository) => repository.close())
  repositories.length = 0
  vi.unstubAllGlobals()
})
function setup() {
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
  render(SettingsPage, {
    props: {
      theme: 'system',
      service,
      pwa: {
        installed: { value: false },
        canInstall: { value: false },
        offlineReady: { value: true },
        checking: { value: false },
        status: { value: '' },
        install: async () => {},
        checkForUpdates: async () => {},
      },
    },
  })
  return service
}

test('backup import reports invalid JSON, then safely adds copies and retains existing notes', async () => {
  const service = setup()
  const created = await service.create({
    title: 'Keep me',
    body: 'Original content',
  })
  expect(created.ok).toBe(true)
  const backup = await service.exportData()
  if (!backup.ok) throw new Error('Unable to prepare backup')
  const input = page.getByLabelText('Choose a Fieldnotes backup')
  await input.upload(
    new File(['broken json'], 'broken.json', { type: 'application/json' }),
  )
  await expect.element(page.getByRole('alert')).toBeVisible()
  expect(page.getByRole('alert').element().textContent).toContain(
    'not readable JSON',
  )
  await input.upload(
    new File(
      [
        JSON.stringify({
          format: 'fieldnotes',
          version: 1,
          notes: backup.value,
        }),
      ],
      'backup.json',
      { type: 'application/json' },
    ),
  )
  await expect.element(page.getByRole('status')).toBeVisible()
  await expect
    .poll(() => page.getByRole('status').element().textContent)
    .toContain('Imported 1 note as new copies')
  await expect.element(page.getByRole('alert')).not.toBeInTheDocument()
  const result = await service.list()
  if (!result.ok) throw new Error('Unable to read imported notes')
  expect(result.value).toHaveLength(2)
  expect(new Set(result.value.map((note) => note.id)).size).toBe(2)
  expect(result.value.every((note) => note.title === 'Keep me')).toBe(true)
})

test('a structurally invalid backup is rejected without changing notes', async () => {
  const service = setup()
  await service.create({ title: 'Keep me', body: '' })
  await page.getByLabelText('Choose a Fieldnotes backup').upload(
    new File(
      [
        JSON.stringify({
          format: 'fieldnotes',
          version: 1,
          notes: [{ title: 'Incomplete' }],
        }),
      ],
      'invalid.json',
      { type: 'application/json' },
    ),
  )
  await expect.element(page.getByRole('alert')).toBeVisible()
  const result = await service.list()
  if (!result.ok) throw new Error('Unable to read existing notes')
  expect(result.value).toHaveLength(1)
  expect(result.value[0]?.title).toBe('Keep me')
})
