import { describe, expect, it } from 'vitest'
import { createNotesService } from './createNotesService'
import type { Note, Result } from '../domain/note'
import type { NoteRepository } from '../ports/NoteRepository'

function fixture() {
  const rows = new Map<string, Note>()
  const repository: NoteRepository = {
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
})
