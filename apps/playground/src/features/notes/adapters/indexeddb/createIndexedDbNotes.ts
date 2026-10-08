import { Result } from '@starter/result'
import * as v from 'valibot'
import { noteSchema, type Note, type NoteResult } from '../../domain/note'
import type { NoteRepository } from '../../ports/NoteRepository'

const failure = (
  kind: 'storage' | 'conflict' | 'corrupt',
  message: string,
): NoteResult<never> => Result.err({ kind, message })
const storageFailure = () =>
  failure(
    'storage',
    'Local storage is unavailable. Keep your draft and try again.',
  )
const conflict = () =>
  failure(
    'conflict',
    'This note changed in another tab. Reload your notes before trying again.',
  )
const corrupt = () =>
  failure(
    'corrupt',
    'Some saved notes could not be read. Your stored data has been left untouched.',
  )

export function createIndexedDbNotes({
  indexedDB,
  name = 'my-vue-pwa-starter-notes',
}: {
  indexedDB: IDBFactory
  name?: string
}): NoteRepository & { close(): void } {
  let database: IDBDatabase | undefined
  let opening: Promise<NoteResult<IDBDatabase>> | undefined
  let cancelOpen: (() => void) | undefined
  let closed = false

  function open(): Promise<NoteResult<IDBDatabase>> {
    if (closed)
      return Promise.resolve(
        failure(
          'storage',
          'The notes connection has closed. Keep your draft and reload the app to reconnect.',
        ),
      )
    if (database) return Promise.resolve(Result.ok(database))
    if (opening) return opening
    opening = new Promise<NoteResult<IDBDatabase>>((resolve) => {
      let settled = false
      function finish(result: NoteResult<IDBDatabase>) {
        if (settled) return
        settled = true
        cancelOpen = undefined
        resolve(result)
      }
      cancelOpen = () => finish(storageFailure())
      try {
        const request = indexedDB.open(name, 2)
        request.onupgradeneeded = () => {
          if (settled || closed) {
            request.transaction?.abort()
            return
          }
          if (!request.result.objectStoreNames.contains('notes'))
            request.result.createObjectStore('notes', { keyPath: 'id' })
        }
        request.onerror = () => finish(storageFailure())
        request.onblocked = () =>
          finish(
            failure(
              'storage',
              'Close other tabs using these notes, then try again.',
            ),
          )
        request.onsuccess = () => {
          const connection = request.result
          if (settled || closed) {
            connection.close()
            return
          }
          database = connection
          connection.onversionchange = () => {
            closed = true
            database = undefined
            connection.close()
          }
          connection.onclose = () => {
            database = undefined
          }
          finish(Result.ok(connection))
        }
      } catch {
        finish(storageFailure())
      }
    }).then((result) => {
      opening = undefined
      return result
    })
    return opening
  }

  async function transaction<T>(
    mode: IDBTransactionMode,
    execute: (
      store: IDBObjectStore,
      complete: (result: NoteResult<T>) => void,
    ) => void,
  ): Promise<NoteResult<T>> {
    const opened = await open()
    if (opened.isErr()) return Result.err(opened.error)
    return new Promise((resolve) => {
      let transaction: IDBTransaction | undefined
      let result: NoteResult<T> = storageFailure()
      try {
        transaction = opened.value.transaction('notes', mode)
        transaction.oncomplete = () => resolve(result)
        transaction.onabort = () =>
          resolve(result.isOk() ? storageFailure() : result)
        transaction.onerror = () => {
          result = storageFailure()
        }
        execute(transaction.objectStore('notes'), (next) => {
          result = next
        })
      } catch {
        transaction?.abort()
        resolve(storageFailure())
      }
    })
  }

  function checkRevision(
    raw: unknown,
    expectedRevision: number | null,
  ): NoteResult<void> {
    if (raw === undefined)
      return expectedRevision === null ? Result.ok(undefined) : conflict()
    const parsed = v.safeParse(noteSchema, raw)
    if (!parsed.success) return corrupt()
    return parsed.output.revision === expectedRevision
      ? Result.ok(undefined)
      : conflict()
  }

  return {
    addMany: (notes) =>
      transaction<void>('readwrite', (store, complete) => {
        for (const note of notes) store.add(note)
        complete(Result.ok(undefined))
      }),
    list: () =>
      transaction<readonly Note[]>('readonly', (store, complete) => {
        const request = store.getAll()
        request.onsuccess = () => {
          const parsed = v.safeParse(v.array(noteSchema), request.result)
          complete(parsed.success ? Result.ok(parsed.output) : corrupt())
        }
      }),
    save: (note, expectedRevision) =>
      transaction<Note>('readwrite', (store, complete) => {
        const request = store.get(note.id)
        request.onsuccess = () => {
          const checked = checkRevision(request.result, expectedRevision)
          if (checked.isErr()) {
            complete(Result.err(checked.error))
            return
          }
          try {
            const write = store.put(note)
            write.onsuccess = () => complete(Result.ok(note))
          } catch {
            complete(storageFailure())
          }
        }
      }),
    remove: (id, expectedRevision) =>
      transaction<void>('readwrite', (store, complete) => {
        const request = store.get(id)
        request.onsuccess = () => {
          const checked = checkRevision(request.result, expectedRevision)
          if (checked.isErr()) {
            complete(Result.err(checked.error))
            return
          }
          try {
            const deletion = store.delete(id)
            deletion.onsuccess = () => complete(Result.ok(undefined))
          } catch {
            complete(storageFailure())
          }
        }
      }),
    close() {
      closed = true
      cancelOpen?.()
      database?.close()
      database = undefined
    },
  }
}
