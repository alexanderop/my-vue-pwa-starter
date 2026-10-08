import type { Note, NoteResult } from '../domain/note'

export interface NoteRepository {
  addMany(notes: readonly Note[]): Promise<NoteResult<void>>
  list(): Promise<NoteResult<readonly Note[]>>
  save(note: Note, expectedRevision: number | null): Promise<NoteResult<Note>>
  remove(id: string, expectedRevision: number): Promise<NoteResult<void>>
}
