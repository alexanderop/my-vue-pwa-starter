import { afterEach, expect, it } from 'vitest'
import { createIndexedDbNotes } from './createIndexedDbNotes'
import type { Note } from '../../domain/note'

const databases: string[] = []
const connections: ReturnType<typeof createIndexedDbNotes>[] = []
const note: Note = {
  id: 'one',
  title: 'Keep this',
  body: 'Available offline',
  pinned: false,
  createdAt: 1,
  updatedAt: 1,
  revision: 1,
}

function repository(name = `notes-test-${crypto.randomUUID()}`) {
  if (!databases.includes(name)) databases.push(name)
  const adapter = createIndexedDbNotes({ indexedDB, name })
  connections.push(adapter)
  return { adapter, name }
}

afterEach(async () => {
  connections.splice(0).forEach((connection) => connection.close())
  await Promise.all(
    databases.splice(0).map(
      (name) =>
        new Promise<void>((resolve, reject) => {
          const request = indexedDB.deleteDatabase(name)
          request.onsuccess = () => resolve()
          request.onerror = () => reject(request.error)
        }),
    ),
  )
})

it('commits notes before reporting success and persists through a new connection', async () => {
  const { adapter, name } = repository()
  expect(await adapter.save(note, null)).toEqual({ ok: true, value: note })
  adapter.close()
  const reopened = repository(name).adapter
  expect(await reopened.list()).toEqual({ ok: true, value: [note] })
  expect(await reopened.remove(note.id, 1)).toEqual({
    ok: true,
    value: undefined,
  })
  expect(await reopened.list()).toEqual({ ok: true, value: [] })
})

it('atomically rejects one of two concurrent writes and prevents stale deletion', async () => {
  const { adapter, name } = repository()
  await adapter.save(note, null)
  const other = repository(name).adapter
  const attempts = await Promise.all([
    adapter.save({ ...note, title: 'Tab one', revision: 2 }, 1),
    other.save({ ...note, title: 'Tab two', revision: 2 }, 1),
  ])
  expect(attempts.filter((result) => result.ok)).toHaveLength(1)
  expect(attempts.filter((result) => !result.ok)).toEqual([
    expect.objectContaining({
      error: expect.objectContaining({ kind: 'conflict' }),
    }),
  ])
  expect(await other.remove(note.id, 1)).toMatchObject({
    ok: false,
    error: { kind: 'conflict' },
  })
  const persisted = await other.list()
  expect(persisted).toMatchObject({ ok: true, value: [{ revision: 2 }] })
})

it('reports invalid stored data without overwriting or deleting it', async () => {
  const { adapter, name } = repository()
  await adapter.list()
  const raw = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, 1)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  await new Promise<void>((resolve, reject) => {
    const transaction = raw.transaction('notes', 'readwrite')
    transaction.objectStore('notes').put({ id: 'one', title: 17 })
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error)
  })
  raw.close()
  expect(await adapter.list()).toMatchObject({
    ok: false,
    error: { kind: 'corrupt' },
  })
  expect(await adapter.save(note, 1)).toMatchObject({
    ok: false,
    error: { kind: 'corrupt' },
  })
  expect(await adapter.remove(note.id, 1)).toMatchObject({
    ok: false,
    error: { kind: 'corrupt' },
  })
})

it('does not reopen a closed adapter, including close during lazy opening', async () => {
  const { adapter } = repository()
  const pending = adapter.list()
  adapter.close()
  expect(await pending).toMatchObject({ ok: false, error: { kind: 'storage' } })
  expect(await adapter.list()).toMatchObject({
    ok: false,
    error: { kind: 'storage' },
  })
})

it('releases its connection for upgrades and requires a reload afterwards', async () => {
  const { adapter, name } = repository()
  await adapter.save(note, null)
  const upgraded = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, 2)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  upgraded.close()
  expect(await adapter.list()).toMatchObject({
    ok: false,
    error: { kind: 'storage' },
  })
  expect(await repository(name).adapter.list()).toMatchObject({
    ok: false,
    error: { kind: 'storage' },
  })
})
