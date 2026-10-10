import { Result } from '@starter/result'
import * as v from 'valibot'

export type Note = Readonly<{
  id: string
  title: string
  body: string
  pinned: boolean
  createdAt: number
  updatedAt: number
  revision: number
  deletedAt?: number
}>

export type NoteDraft = Readonly<{ title: string; body: string }>
// The reason is the whole error: the UI translates it, and a validation
// error also names the field to focus.
const validationErrors = {
  titleRequired: { reason: 'titleRequired', field: 'title' },
  titleTooLong: { reason: 'titleTooLong', field: 'title' },
  bodyTooLong: { reason: 'bodyTooLong', field: 'body' },
} as const
type ValidationReason = keyof typeof validationErrors
export type NoteError =
  | (typeof validationErrors)[ValidationReason]
  | Readonly<{
      reason:
        | 'storageUnavailable'
        | 'storageFailed'
        | 'connectionClosed'
        | 'blocked'
        | 'conflict'
        | 'corrupt'
    }>
export type NoteResult<T> = Result<T, NoteError>

const timestampSchema = v.pipe(
  v.number(),
  v.finite(),
  v.minValue(0),
  v.maxValue(8_640_000_000_000_000),
)

export const noteSchema = v.object({
  id: v.pipe(v.string(), v.minLength(1)),
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(120)),
  body: v.pipe(v.string(), v.maxLength(20_000)),
  pinned: v.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  deletedAt: v.exactOptional(timestampSchema),
  revision: v.pipe(v.number(), v.integer(), v.minValue(1)),
})

const draftSchema = v.object(
  {
    title: v.pipe(
      v.string('titleRequired'),
      v.trim(),
      v.minLength(1, 'titleRequired'),
      v.maxLength(120, 'titleTooLong'),
    ),
    body: v.pipe(v.string('bodyTooLong'), v.maxLength(20_000, 'bodyTooLong')),
  },
  'titleRequired',
)

export function parseDraft(draft: NoteDraft): NoteResult<NoteDraft> {
  const parsed = v.safeParse(draftSchema, draft)
  if (parsed.success) return Result.ok(parsed.output)
  // Every action in draftSchema carries a ValidationReason as its message.
  const reason = parsed.issues[0].message
  return Result.err(
    validationErrors[isValidationReason(reason) ? reason : 'titleRequired'],
  )
}

const isValidationReason = (message: string): message is ValidationReason =>
  Object.hasOwn(validationErrors, message)
