import {
  parseDraft,
  type Note,
  type NoteDraft,
  type Result,
} from '../domain/note'
import type { NoteRepository } from '../ports/NoteRepository'

export interface NotesService {
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

  return {
    list: () =>
      safely(async () => {
        const result = await repository.list()
        return result.ok
          ? {
              ok: true,
              value: [...result.value].sort(
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
