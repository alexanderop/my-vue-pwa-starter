import { describe, expect, it, vi } from 'vitest'
import { createNotesService } from './createNotesService'
import type { Note, Result } from '../domain/note'
import type { NoteRepository } from '../ports/NoteRepository'

function fixture() {
  const rows = new Map<string, Note>()
  const repository: NoteRepository = {
    async addMany(notes) {
      for (const note of notes) rows.set(note.id, note)
      return { ok: true, value: undefined }
    },
    async list() {
      return { ok: true, value: [...rows.values()] }
    },
    async save(note) {
      rows.set(note.id, note)
      return { ok: true, value: note }
    },
    async remove(id) {
      rows.delete(id)
      return { ok: true, value: undefined }
    },
  }
  let id = 0
  let time = 100
  const service = createNotesService({
    repository,
    now: () => time++,
    newId: () => `note-${++id}`,
  })
  return { service, repository }
}

function value<T>(result: Result<T>): T {
  if (!result.ok) throw new Error(result.error.message)
  return result.value
}

describe('notes service', () => {
  it('normalizes titles, preserves body whitespace, and uses supplied identity and time', async () => {
    const { service } = fixture()
    expect(
      value(
        await service.create({
          title: '  First idea  ',
          body: '  keep indentation\n',
        }),
      ),
    ).toEqual({
      id: 'note-1',
      title: 'First idea',
      body: '  keep indentation\n',
      pinned: false,
      createdAt: 100,
      updatedAt: 100,
      revision: 1,
    })
  })

  it('rejects blank or oversized drafts without storing them', async () => {
    const { service } = fixture()
    for (const draft of [
      { title: '  ', body: '' },
      { title: 'x'.repeat(121), body: '' },
      { title: 'Valid', body: 'x'.repeat(20_001) },
    ]) {
      expect(await service.create(draft)).toMatchObject({
        ok: false,
        error: { kind: 'validation' },
      })
    }
    expect(await service.list()).toEqual({ ok: true, value: [] })
  })

  it('increments revisions while preserving identity and creation time', async () => {
    const { service } = fixture()
    const created = value(
      await service.create({ title: 'First', body: 'Draft' }),
    )
    const edited = value(
      await service.edit(created, { title: 'Updated', body: 'Ready' }),
    )
    expect(edited).toEqual({
      ...created,
      title: 'Updated',
      body: 'Ready',
      revision: 2,
      updatedAt: 101,
    })
    expect(value(await service.setPinned(edited, true))).toEqual({
      ...edited,
      pinned: true,
      revision: 3,
      updatedAt: 102,
    })
  })

  it('lists pinned notes first and the rest by most recent change, and removes notes', async () => {
    const { service } = fixture()
    const first = value(await service.create({ title: 'First', body: '' }))
    const second = value(await service.create({ title: 'Second', body: '' }))
    const pinned = value(await service.setPinned(first, true))
    const third = value(await service.create({ title: 'Third', body: '' }))
    expect(value(await service.list())).toEqual([pinned, third, second])
    expect(await service.remove(third)).toEqual({ ok: true, value: undefined })
    expect(value(await service.list())).toEqual([pinned, second])
  })

  it('returns storage failures without rejecting and preserves typed conflicts', async () => {
    const { repository } = fixture()
    const broken = createNotesService({
      repository: {
        ...repository,
        list: () => Promise.reject(new Error('disk unavailable')),
      },
      now: () => 0,
      newId: () => 'id',
    })
    expect(await broken.list()).toMatchObject({
      ok: false,
      error: { kind: 'storage' },
    })
    const conflicted = createNotesService({
      repository: {
        ...repository,
        save: async () => ({
          ok: false,
          error: { kind: 'conflict', message: 'Changed elsewhere' },
        }),
      },
      now: () => 0,
      newId: () => 'id',
    })
    expect(await conflicted.create({ title: 'Title', body: '' })).toEqual({
      ok: false,
      error: { kind: 'conflict', message: 'Changed elsewhere' },
    })
  })

  it('keeps trashed notes recoverable and exports them', async () => {
    const { service } = fixture()
    const original = value(
      await service.create({ title: 'Keep me', body: 'Draft' }),
    )
    const deleted = value(await service.trash(original))
    expect(value(await service.list())).toEqual([])
    expect(value(await service.listTrash())).toEqual([deleted])
    expect(value(await service.exportData())).toEqual([deleted])
    const restored = value(await service.restore(deleted))
    expect(restored.deletedAt).toBeUndefined()
    expect(restored.revision).toBe(3)
    expect(value(await service.list())).toEqual([restored])
  })
  it('imports validated backups as copies while preserving originals and rejects unsupported versions', async () => {
    const { service } = fixture()
    const original = value(
      await service.create({ title: 'Original', body: 'Keep' }),
    )
    const backup = { format: 'fieldnotes', version: 1, notes: [original] }
    expect(value(await service.importData(backup))).toBe(1)
    const all = value(await service.exportData())
    expect(all).toHaveLength(2)
    expect(all[0]).toEqual(original)
    expect(all[1]?.id).not.toBe(original.id)
    expect(await service.importData({ ...backup, version: 2 })).toMatchObject({
      ok: false,
      error: { kind: 'validation' },
    })
    expect(
      await service.importData({
        ...backup,
        notes: [original, { ...original, title: 17 }],
      }),
    ).toMatchObject({ ok: false })
    expect(value(await service.exportData())).toHaveLength(2)
  })

  it.each(['createdAt', 'updatedAt', 'deletedAt'] as const)(
    'rejects an out-of-range %s in a backup before any write',
    async (field) => {
      const { service, repository } = fixture()
      const original = value(
        await service.create({ title: 'Keep', body: 'Existing note' }),
      )
      const write = vi.spyOn(repository, 'addMany')
      for (const timestamp of [8_640_000_000_000_001, 1e300]) {
        expect(
          await service.importData({
            format: 'fieldnotes',
            version: 1,
            notes: [original, { ...original, [field]: timestamp }],
          }),
        ).toMatchObject({ ok: false, error: { kind: 'validation' } })
      }
      expect(write).not.toHaveBeenCalled()
      expect(value(await service.exportData())).toEqual([original])
    },
  )

  it('accepts the inclusive JavaScript Date timestamp limit', async () => {
    const { service } = fixture()
    const original = value(
      await service.create({ title: 'Date limit', body: '' }),
    )
    const limit = 8_640_000_000_000_000
    expect(
      value(
        await service.importData({
          format: 'fieldnotes',
          version: 1,
          notes: [
            {
              ...original,
              createdAt: limit,
              updatedAt: limit,
              deletedAt: limit,
            },
          ],
        }),
      ),
    ).toBe(1)
    expect(() => new Date(limit).toISOString()).not.toThrow()
  })
})
