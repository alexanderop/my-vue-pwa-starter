import type { Translate } from '../../../i18n'
import type { NoteError } from '../domain/note'

export const noteErrorText = (error: NoteError, t: Translate) =>
  t(`notes.errors.${error.reason}`)
