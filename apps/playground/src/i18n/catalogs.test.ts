import { describe, expect, it } from 'vitest'
import { de } from './de'
import { en } from './en'
import { languages } from '../features/settings/domain/language'
import { matchLocale, supportedLocales } from './index'

// Flattens a catalog to [path, message] pairs, with list items as path.N.
function entries(node: unknown, path = ''): [string, string][] {
  if (typeof node === 'string') return [[path, node]]
  if (typeof node !== 'object' || node === null) return []
  return Object.entries(node).flatMap(([key, value]) =>
    entries(value, path ? `${path}.${key}` : key),
  )
}
const placeholders = (message: string) =>
  [...message.matchAll(/\{(\w+)\}/g)]
    .map(([, name]) => name)
    .toSorted((a = '', b = '') => a.localeCompare(b))
const branches = (message: string) => message.split(' | ').length

describe('given the German catalog', () => {
  const english = new Map(entries(en))
  const german = entries(de)
  // [path, German, English] for every path both catalogs share.
  const pairs = german.flatMap(([path, message]) => {
    const source = english.get(path)
    return source === undefined ? [] : [[path, message, source] as const]
  })

  it('should translate every English message, list items included', () => {
    expect(german.map(([path]) => path)).toEqual([...english.keys()])
  })

  it.each(pairs)(
    'should keep the placeholders of %s',
    (_path, message, source) => {
      expect(placeholders(message)).toEqual(placeholders(source))
    },
  )

  it.each(pairs)(
    'should keep the plural forms of %s',
    (_path, message, source) => {
      expect(branches(message)).toBe(branches(source))
    },
  )
})

describe('given the Language setting', () => {
  it('should offer System plus exactly the locales with a catalog', () => {
    expect(languages).toEqual(['system', ...supportedLocales])
  })
})

describe('given a browser language list', () => {
  it.each([
    [['de-AT', 'en'], 'de'],
    [['fr-FR', 'de'], 'de'],
    [['EN-gb'], 'en'],
    [['fr', 'es'], 'en'],
    [[], 'en'],
  ] as const)('should pick a supported locale from %j', (preferred, locale) => {
    expect(matchLocale(preferred)).toBe(locale)
  })
})
