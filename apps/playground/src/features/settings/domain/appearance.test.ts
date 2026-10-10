import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { accentSchema, accents, themeSchema, themes } from './appearance'
import { languageSchema, languages } from './language'

describe('given the preference registries', () => {
  it.each(themes)('should accept the stored theme %s', (id) => {
    expect(v.parse(themeSchema, id)).toBe(id)
  })

  it.each(accents)('should accept the stored accent %s', (id) => {
    expect(v.parse(accentSchema, id)).toBe(id)
  })

  it.each(languages)('should accept the stored language %s', (id) => {
    expect(v.parse(languageSchema, id)).toBe(id)
  })

  it('should reject values that are not in the tables', () => {
    expect(v.safeParse(themeSchema, 'sepia').success).toBe(false)
    expect(v.safeParse(accentSchema, 'orange').success).toBe(false)
    expect(v.safeParse(languageSchema, 'fr').success).toBe(false)
  })
})
