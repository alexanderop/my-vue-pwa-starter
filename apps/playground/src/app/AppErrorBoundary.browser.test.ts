import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-vue'
import { createAppI18n } from '../i18n'
import { t } from '../i18n/testing'
import AppErrorBoundary from './AppErrorBoundary.vue'

describe('AppErrorBoundary', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('unexpected child errors offer focused recovery without leaking note contents', async () => {
    vi.stubGlobal('__APP_VERSION__', 'test-build')
    const Broken = defineComponent({
      setup() {
        throw new Error('Private note text must not be exposed')
      },
      render() {
        return null
      },
    })
    await render(AppErrorBoundary, {
      slots: { default: () => h(Broken) },
      global: { plugins: [createAppI18n('en')] },
    })
    await expect
      .element(page.getByRole('heading', { name: t('app.recovery.title') }))
      .toHaveFocus()
    await expect
      .element(page.getByRole('button', { name: t('app.recovery.reload') }))
      .toBeVisible()
    await page.getByText(t('app.recovery.diagnostics')).click()
    const content = page.getByRole('alert').element().textContent
    expect(content).toContain('test-build')
    expect(content).not.toContain('Private note text')
  })
})
