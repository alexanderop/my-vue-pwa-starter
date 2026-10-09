import { afterEach, assert, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { closeSettingsRepositories, renderSettings } from './testing'

describe('given the Export backup page', () => {
  afterEach(closeSettingsRepositories)

  it('should start the download and report the note count', async () => {
    const { service } = await renderSettings('/settings/export')
    await service.create({ title: 'Keep me', body: 'Original content' })
    await page.getByRole('button', { name: 'Export backup' }).click()
    await expect
      .poll(() => page.getByTestId('backup-status').element().textContent)
      .toContain('Backup download started: 1 note, including trash.')
  })
})

describe('given the Import backup page', () => {
  afterEach(closeSettingsRepositories)

  it('should report invalid JSON, then add copies and retain existing notes', async () => {
    const { service } = await renderSettings('/settings/import')
    const created = await service.create({
      title: 'Keep me',
      body: 'Original content',
    })
    expect(created.isOk()).toBe(true)
    const backup = await service.exportData()
    assert(backup.isOk(), 'Unable to prepare backup')
    const input = page.getByLabelText('Choose a Fieldnotes backup')
    await input.upload(
      new File(['broken json'], 'broken.json', { type: 'application/json' }),
    )
    await expect.element(page.getByRole('alert')).toBeVisible()
    expect(page.getByRole('alert').element().textContent).toContain(
      'not readable JSON',
    )
    await input.upload(
      new File(
        [
          JSON.stringify({
            format: 'fieldnotes',
            version: 1,
            notes: backup.value,
          }),
        ],
        'backup.json',
        { type: 'application/json' },
      ),
    )
    await expect
      .poll(() => page.getByTestId('backup-status').element().textContent)
      .toContain('Imported 1 note as new copies')
    await expect.element(page.getByRole('alert')).not.toBeInTheDocument()
    const result = await service.list()
    assert(result.isOk(), 'Unable to read imported notes')
    expect(result.value).toHaveLength(2)
    expect(new Set(result.value.map((note) => note.id)).size).toBe(2)
    expect(result.value.every((note) => note.title === 'Keep me')).toBe(true)
  })

  it('should reject a structurally invalid backup without changing notes', async () => {
    const { service } = await renderSettings('/settings/import')
    await service.create({ title: 'Keep me', body: '' })
    await page.getByLabelText('Choose a Fieldnotes backup').upload(
      new File(
        [
          JSON.stringify({
            format: 'fieldnotes',
            version: 1,
            notes: [{ title: 'Incomplete' }],
          }),
        ],
        'invalid.json',
        { type: 'application/json' },
      ),
    )
    await expect.element(page.getByRole('alert')).toBeVisible()
    const result = await service.list()
    assert(result.isOk(), 'Unable to read existing notes')
    expect(result.value).toHaveLength(1)
    expect(result.value[0]?.title).toBe('Keep me')
  })

  it('should report busy while importing and idle afterwards', async () => {
    const busy: boolean[] = []
    const { service } = await renderSettings('/settings/import', {
      onBusyChange: (value) => busy.push(value),
    })
    await service.create({ title: 'Keep me', body: '' })
    await page
      .getByLabelText('Choose a Fieldnotes backup')
      .upload(
        new File(['broken json'], 'broken.json', { type: 'application/json' }),
      )
    await expect.element(page.getByRole('alert')).toBeVisible()
    expect(busy).toEqual([true, false])
  })
})
