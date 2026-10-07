import type { Note, Result } from '../domain/note'

export interface NoteRepository {
  list(): Promise<Result<readonly Note[]>>
  save(note: Note, expectedRevision: number | null): Promise<Result<Note>>
  remove(id: string, expectedRevision: number): Promise<Result<void>>
}
