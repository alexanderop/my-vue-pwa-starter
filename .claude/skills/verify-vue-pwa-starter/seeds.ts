import type { Note } from '../../../apps/playground/src/features/notes/domain/note.ts'

type AppLimits =
  typeof import('../../../apps/playground/src/features/notes/domain/backup.ts').backupLimits

/** Mirrors the app's limit; typecheck fails if the two drift apart. */
export const backupLimits = {
  notes: 5_000 satisfies AppLimits['notes'],
} as const

/** The backup envelope accepted by Settings → Import backup. */
export type Backup = Readonly<{
  format: 'fieldnotes'
  version: 1
  notes: readonly Note[]
}>

type Scenario = Readonly<{
  description: string
  build(count: number): readonly Note[]
}>

// Fixed clock so every run produces the same dates and order.
const base = Date.UTC(2026, 0, 5, 9, 0, 0)
const hour = 60 * 60 * 1000

function note(
  index: number,
  content: Readonly<{ title: string; body: string }>,
  flags: Readonly<{ pinned?: boolean; trashed?: boolean }> = {},
): Note {
  const createdAt = base - index * hour
  return {
    id: `seed-${String(index).padStart(4, '0')}`,
    title: content.title,
    body: content.body,
    pinned: flags.pinned ?? false,
    createdAt,
    updatedAt: createdAt + 5 * 60 * 1000,
    revision: 1,
    ...(flags.trashed ? { deletedAt: base + hour } : {}),
  }
}

const basic = [
  { title: 'Quarterly plan', body: 'Draft budget for the next quarter.' },
  { title: 'Grocery list', body: 'Oats, lemons, coffee.' },
] as const

export const scenarios: Readonly<Record<string, Scenario>> = {
  empty: {
    description: 'No notes. Same as reset.',
    build: () => [],
  },
  basic: {
    description: 'Two active notes: "Quarterly plan" and "Grocery list".',
    build: () => basic.map((content, index) => note(index, content)),
  },
  'trash-and-pinned': {
    description:
      'Basic notes plus pinned "Reading list" and "Packing list", and trashed "Old idea" and "Draft to discard".',
    build: () => [
      ...basic.map((content, index) => note(index, content)),
      note(
        2,
        { title: 'Reading list', body: 'A Philosophy of Software Design.' },
        { pinned: true },
      ),
      note(
        3,
        { title: 'Packing list', body: 'Charger, passport, rain jacket.' },
        { pinned: true },
      ),
      note(4, { title: 'Old idea', body: 'Not needed.' }, { trashed: true }),
      note(
        5,
        { title: 'Draft to discard', body: 'Half a thought.' },
        { trashed: true },
      ),
    ],
  },
  many: {
    description:
      'COUNT active notes titled "Note 0001"…, every 10th pinned (default 60, max 5000).',
    build: (count) =>
      Array.from({ length: count }, (_, index) =>
        note(
          index,
          {
            title: `Note ${String(index + 1).padStart(4, '0')}`,
            body: `Generated body ${index + 1}. Searchable token seed-${index + 1}.`,
          },
          { pinned: index % 10 === 0 },
        ),
      ),
  },
}

export function buildBackup(name: string, count: number): Backup {
  const scenario = scenarios[name]
  if (!scenario) throw new Error(`Unknown scenario "${name}".`)
  return { format: 'fieldnotes', version: 1, notes: scenario.build(count) }
}
