import { afterEach, assert, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { t } from '../../../i18n/testing'
import { closeSettingsRepositories, renderSettings } from './testing'

describe('given the Export backup page', () => {
  afterEach(closeSettingsRepositories)

  it('should start the download and report the note count', async () => {
    const { service } = await renderSettings('/settings/export')
    await service.create({ title: 'Keep me', body: 'Original content' })
    await page
      .getByRole('button', { name: t('settings.export.action') })
      .click()
    await expect
      .poll(() => page.getByTestId('backup-status').element().textContent)
      .toContain(t('settings.export.started', 1))
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
    const input = page.getByLabelText(t('settings.import.choose'))
    await input.upload(
      new File(['broken json'], 'broken.json', { type: 'application/json' }),
    )
    await expect.element(page.getByRole('alert')).toBeVisible()
    expect(page.getByRole('alert').element().textContent).toContain(
      t('settings.import.unreadable'),
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
      .toContain(t('settings.import.imported', 1))
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
    await page.getByLabelText(t('settings.import.choose')).upload(
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
      .getByLabelText(t('settings.import.choose'))
      .upload(
        new File(['broken json'], 'broken.json', { type: 'application/json' }),
      )
    await expect.element(page.getByRole('alert')).toBeVisible()
    expect(busy).toEqual([true, false])
  })
})
