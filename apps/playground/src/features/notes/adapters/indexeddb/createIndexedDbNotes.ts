import { Result } from '@starter/result'
import * as v from 'valibot'
import {
  noteSchema,
  type Note,
  type NoteError,
  type NoteResult,
} from '../../domain/note'
import type { NoteRepository } from '../../ports/NoteRepository'

const failure = (
  reason: Exclude<NoteError, { field: string }>['reason'],
): NoteResult<never> => Result.err({ reason })
const storageFailure = () => failure('storageUnavailable')
const conflict = () => failure('conflict')
const corrupt = () => failure('corrupt')

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
    if (closed) return Promise.resolve(failure('connectionClosed'))
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
        request.addEventListener('upgradeneeded', () => {
          if (settled || closed) {
            request.transaction?.abort()
            return
          }
          if (!request.result.objectStoreNames.contains('notes'))
            request.result.createObjectStore('notes', { keyPath: 'id' })
        })
        request.addEventListener('error', () => finish(storageFailure()))
        request.addEventListener('blocked', () => finish(failure('blocked')))
        request.addEventListener('success', () => {
          const connection = request.result
          if (settled || closed) {
            connection.close()
            return
          }
          database = connection
          connection.addEventListener('versionchange', () => {
            closed = true
            database = undefined
            connection.close()
          })
          connection.addEventListener('close', () => {
            database = undefined
          })
          finish(Result.ok(connection))
        })
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
      let active: IDBTransaction | undefined
      let result: NoteResult<T> = storageFailure()
      try {
        active = opened.value.transaction('notes', mode)
        active.addEventListener('complete', () => resolve(result))
        active.addEventListener('abort', () =>
          resolve(result.isOk() ? storageFailure() : result),
        )
        active.addEventListener('error', () => {
          result = storageFailure()
        })
        execute(active.objectStore('notes'), (next) => {
          result = next
        })
      } catch {
        active?.abort()
        resolve(storageFailure())
      }
    })
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
        request.addEventListener('success', () => {
          const parsed = v.safeParse(v.array(noteSchema), request.result)
          complete(parsed.success ? Result.ok(parsed.output) : corrupt())
        })
      }),
    save: (note, expectedRevision) =>
      transaction<Note>('readwrite', (store, complete) => {
        const request = store.get(note.id)
        request.addEventListener('success', () => {
          const checked = checkRevision(request.result, expectedRevision)
          if (checked.isErr()) {
            complete(Result.err(checked.error))
            return
          }
          try {
            const write = store.put(note)
            write.addEventListener('success', () => complete(Result.ok(note)))
          } catch {
            complete(storageFailure())
          }
        })
      }),
    remove: (id, expectedRevision) =>
      transaction<void>('readwrite', (store, complete) => {
        const request = store.get(id)
        request.addEventListener('success', () => {
          const checked = checkRevision(request.result, expectedRevision)
          if (checked.isErr()) {
            complete(Result.err(checked.error))
            return
          }
          try {
            const deletion = store.delete(id)
            deletion.addEventListener('success', () =>
              complete(Result.ok(undefined)),
            )
          } catch {
            complete(storageFailure())
          }
        })
      }),
    close() {
      closed = true
      cancelOpen?.()
      database?.close()
      database = undefined
    },
  }
}
