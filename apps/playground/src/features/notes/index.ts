export {
  createNotesService,
  type NotesService,
} from './application/createNotesService'
export { createIndexedDbNotes } from './adapters/indexeddb/createIndexedDbNotes'
export type { Note, NoteDraft, NoteError, Result } from './domain/note'
export type { NoteRepository } from './ports/NoteRepository'
