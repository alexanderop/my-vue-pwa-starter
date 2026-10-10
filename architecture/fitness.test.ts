import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import { accents } from '../apps/playground/src/features/settings/domain/appearance'

const root = fileURLToPath(new URL('../', import.meta.url))
const features = 'apps/playground/src/features'

// Known violations. Each one runs as `it.fails`, so fixing it turns the test red
// until the entry is removed here.
const oversizedComponents = new Set([
  'apps/playground/src/features/notes/ui/NotesPage.vue',
])

function sourceFiles(dir: string, extensions: readonly string[]) {
  return readdirSync(root + dir, { recursive: true, encoding: 'utf8' })
    .map((file) => `${dir}/${file}`)
    .filter(
      (file) =>
        !/(^|\/)(node_modules|dist|\.histoire|\.histoire-dist)\//.test(file) &&
        extensions.some((extension) => file.endsWith(extension)),
    )
}

function read(file: string) {
  return readFileSync(root + file, 'utf8')
}

describe('given the feature folders', () => {
  const names = readdirSync(root + features)

  it('should find features to check', () => {
    expect(names.length).toBeGreaterThan(0)
  })

  const hasEntry = (name: string) =>
    existsSync(`${root}${features}/${name}/index.ts`)

  it.each(names)('should expose a public index.ts in %s', (name) => {
    expect(hasEntry(name)).toBe(true)
  })
})

describe('given the app components', () => {
  const components = sourceFiles('apps/playground/src', ['.vue'])

  it('should find components to check', () => {
    expect(components.length).toBeGreaterThan(0)
  })

  const lineCount = (file: string) => read(file).split('\n').length

  it.each(components.filter((file) => !oversizedComponents.has(file)))(
    'should keep %s under 300 lines',
    (file) => {
      expect(lineCount(file)).toBeLessThan(300)
    },
  )

  it.fails.each([...oversizedComponents])(
    'should keep %s under 300 lines (known violation)',
    (file) => {
      expect(lineCount(file)).toBeLessThan(300)
    },
  )
})

describe('given the accent registry', () => {
  const css = read('packages/ui/src/styles/index.css')

  it.each(accents)('should style the %s accent in the UI package', (id) => {
    // blue is the :root default, so it also appears as a plain selector.
    expect(css).toContain(`[data-accent='${id}']`)
  })
})

describe('given the persistence adapters', () => {
  const adapters = sourceFiles(features, ['.ts']).filter(
    (file) => file.includes('/adapters/') && !file.endsWith('.test.ts'),
  )

  it('should find adapters to check', () => {
    expect(adapters.length).toBeGreaterThan(0)
  })

  it.each(adapters)(
    'should validate stored values with Valibot in %s',
    (file) => {
      expect(read(file)).toMatch(/from 'valibot'/)
    },
  )
})

describe('given the source tree', () => {
  it('should contain no lint or type suppression comments', () => {
    // packages/result is vendored verbatim from better-result; its type tests
    // assert compile errors with @ts-expect-error.
    const files = ['apps', 'packages', 'scripts', 'e2e']
      .flatMap((dir) => sourceFiles(dir, ['.ts', '.vue', '.js', '.mjs']))
      .filter((file) => !file.startsWith('packages/result/'))
    expect(files.length).toBeGreaterThan(0)
    const suppressed = files.filter((file) =>
      /eslint-disable|oxlint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck/.test(
        read(file),
      ),
    )
    expect(suppressed).toEqual([])
  })
})

describe('given an app template with literal text', () => {
  const lint = async (template: string) => {
    const eslint = new ESLint({ cwd: root })
    const [result] = await eslint.lintText(
      `<script setup lang="ts"></script>\n<template>${template}</template>\n`,
      { filePath: `${root}apps/playground/src/app/Fixture.vue` },
    )
    return (result?.messages ?? []).map((message) => message.ruleId)
  }

  it.each([
    '<p>Hello</p>',
    '<SettingsRow label="Format" />',
    '<UiInput placeholder="Find a thought" />',
    '<UiDialog close-label="Close" />',
  ])('should reject %s', async (template) => {
    expect(await lint(template)).toContain('vue/no-bare-strings-in-template')
  })

  it('should accept text from the catalogs', async () => {
    expect(await lint(`<SettingsRow :label="t('x')" />`)).not.toContain(
      'vue/no-bare-strings-in-template',
    )
  })
})
