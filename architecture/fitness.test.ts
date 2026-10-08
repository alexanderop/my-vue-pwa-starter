import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('../', import.meta.url))
const features = 'apps/playground/src/features'

// Known violations. Each one runs as `it.fails`, so fixing it turns the test red
// until the entry is removed here.
const featuresWithoutEntry = new Set(['settings'])
const oversizedComponents = new Set([
  'apps/playground/src/features/notes/ui/NotesPage.vue',
  'apps/playground/src/features/settings/ui/SettingsPage.vue',
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

  describe.each(names)('when checking %s', (name) => {
    const check = featuresWithoutEntry.has(name) ? it.fails : it
    check('should expose a public index.ts', () => {
      expect(existsSync(`${root}${features}/${name}/index.ts`)).toBe(true)
    })
  })
})

describe('given the app components', () => {
  const components = sourceFiles('apps/playground/src', ['.vue'])

  it('should find components to check', () => {
    expect(components.length).toBeGreaterThan(0)
  })

  describe.each(components)('when checking %s', (file) => {
    const check = oversizedComponents.has(file) ? it.fails : it
    check('should stay under 300 lines', () => {
      expect(read(file).split('\n').length).toBeLessThan(300)
    })
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
    const files = ['apps', 'packages', 'scripts', 'e2e'].flatMap((dir) =>
      sourceFiles(dir, ['.ts', '.vue', '.js', '.mjs']),
    )
    expect(files.length).toBeGreaterThan(0)
    const suppressed = files.filter((file) =>
      /eslint-disable|oxlint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck/.test(
        read(file),
      ),
    )
    expect(suppressed).toEqual([])
  })
})
