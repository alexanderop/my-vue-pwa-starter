import { expect, test } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from 'vitest-browser-vue'
import { UiInput, UiTextarea } from '../index'
import DialogHarness from './DialogHarness.vue'
import '../styles/index.css'

test('dialog traps focus, closes with Escape, and returns focus to its opener', async () => {
  render(DialogHarness)
  const opener = page.getByRole('button', { name: 'Create note' })
  await opener.click()
  const dialog = page.getByRole('dialog', { name: 'New note' })
  await expect.element(dialog).toBeVisible()
  await expect
    .element(dialog)
    .toHaveAccessibleDescription('Write something worth keeping.')
  await expect
    .element(page.getByRole('button', { name: 'Close dialog' }))
    .toHaveFocus()
  await userEvent.tab({ shift: true })
  await expect
    .element(page.getByRole('button', { name: 'Save note' }))
    .toHaveFocus()
  await userEvent.tab()
  await expect
    .element(page.getByRole('button', { name: 'Close dialog' }))
    .toHaveFocus()
  await userEvent.keyboard('{Escape}')
  await expect.element(dialog).not.toBeInTheDocument()
  await expect.element(opener).toHaveFocus()
})

test('input connects its label and validation message to the native field', async () => {
  render(UiInput, {
    props: {
      label: 'Note title',
      error: 'A title is required.',
      modelValue: '',
    },
  })
  const field = page.getByRole('textbox', { name: 'Note title' })
  await expect
    .element(field)
    .toHaveAccessibleDescription('A title is required.')
  await expect.element(field).toHaveAttribute('aria-invalid', 'true')
  await field.fill('An idea')
  await expect.element(field).toHaveValue('An idea')
})

test('textarea forwards native attributes and has an accessible label', async () => {
  render(UiTextarea, {
    props: { label: 'Your note', modelValue: 'Keep this thought' },
    attrs: { readonly: true },
  })
  const field = page.getByRole('textbox', { name: 'Your note' })
  await expect.element(field).toHaveValue('Keep this thought')
  await expect.element(field).toHaveAttribute('readonly')
})
