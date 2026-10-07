import * as v from 'valibot'
import {
  parseDraft,
  backupSchema,
  type Note,
  type NoteDraft,
  type Result,
} from '../domain/note'
import type { NoteRepository } from '../ports/NoteRepository'

export interface NotesService {
  exportData(): Promise<Result<readonly Note[]>>
  importData(input: unknown): Promise<Result<number>>
  listTrash(): Promise<Result<readonly Note[]>>
  trash(note: Note): Promise<Result<Note>>
  restore(note: Note): Promise<Result<Note>>
  list(): Promise<Result<readonly Note[]>>
  create(draft: NoteDraft): Promise<Result<Note>>
  edit(note: Note, draft: NoteDraft): Promise<Result<Note>>
  setPinned(note: Note, pinned: boolean): Promise<Result<Note>>
  remove(note: Note): Promise<Result<void>>
}

export function createNotesService({
  repository,
  now,
  newId,
}: {
  repository: NoteRepository
  now: () => number
  newId: () => string
}): NotesService {
  async function safely<T>(
    operation: () => Promise<Result<T>>,
  ): Promise<Result<T>> {
    try {
      return await operation()
    } catch {
      return {
        ok: false,
        error: {
          kind: 'storage',
          message: 'Your notes could not be saved or loaded. Please try again.',
        },
      }
    }
  }

  const changeTrash = (note: Note, deletedAt: number | undefined) =>
    safely(() => {
      const changed = {
        ...note,
        revision: note.revision + 1,
        updatedAt: Math.max(now(), note.updatedAt),
      }
      if (deletedAt === undefined) delete changed.deletedAt
      else changed.deletedAt = deletedAt
      return repository.save(changed, note.revision)
    })
  return {
    exportData: () => safely(() => repository.list()),
    listTrash: () =>
      safely(async () => {
        const result = await repository.list()
        return result.ok
          ? {
              ok: true,
              value: result.value.filter(
                (note) => note.deletedAt !== undefined,
              ),
            }
          : result
      }),
    trash: (note) => changeTrash(note, now()),
    restore: (note) => changeTrash(note, undefined),
    importData: (input) =>
      safely(async () => {
        const parsed = v.safeParse(backupSchema, input)
        if (!parsed.success)
          return {
            ok: false,
            error: {
              kind: 'validation',
              message:
                'Choose a valid Fieldnotes version 1 backup with no more than 5,000 notes.',
            },
          }
        const imported = parsed.output.notes.map((note) => ({
          ...note,
          id: newId(),
          revision: 1,
        }))
        const result = await repository.addMany(imported)
        return result.ok ? { ok: true, value: imported.length } : result
      }),
    list: () =>
      safely(async () => {
        const result = await repository.list()
        return result.ok
          ? {
              ok: true,
              value: result.value
                .filter((note) => note.deletedAt === undefined)
                .sort(
                  (a, b) =>
                    Number(b.pinned) - Number(a.pinned) ||
                    b.updatedAt - a.updatedAt ||
                    a.id.localeCompare(b.id),
                ),
            }
          : result
      }),
    create: (draft) =>
      safely(async () => {
        const parsed = parseDraft(draft)
        if (!parsed.ok) return parsed
        const timestamp = now()
        return repository.save(
          {
            ...parsed.value,
            id: newId(),
            pinned: false,
            createdAt: timestamp,
            updatedAt: timestamp,
            revision: 1,
          },
          null,
        )
      }),
    edit: (note, draft) =>
      safely(async () => {
        const parsed = parseDraft(draft)
        if (!parsed.ok) return parsed
        return repository.save(
          {
            ...note,
            ...parsed.value,
            updatedAt: Math.max(now(), note.updatedAt),
            revision: note.revision + 1,
          },
          note.revision,
        )
      }),
    setPinned: (note, pinned) =>
      safely(() =>
        repository.save(
          {
            ...note,
            pinned,
            updatedAt: Math.max(now(), note.updatedAt),
            revision: note.revision + 1,
          },
          note.revision,
        ),
      ),
    remove: (note) => safely(() => repository.remove(note.id, note.revision)),
  }
}
