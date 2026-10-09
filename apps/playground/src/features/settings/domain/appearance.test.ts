import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import {
  accentSchema,
  accents,
  appearanceSummary,
  themeSchema,
  themes,
} from './appearance'

describe('given the appearance registries', () => {
  it.each(themes)('should accept the stored theme $id', ({ id }) => {
    expect(v.parse(themeSchema, id)).toBe(id)
  })

  it.each(accents)('should accept the stored accent $id', ({ id }) => {
    expect(v.parse(accentSchema, id)).toBe(id)
  })

  it('should reject values that are not in the tables', () => {
    expect(v.safeParse(themeSchema, 'sepia').success).toBe(false)
    expect(v.safeParse(accentSchema, 'orange').success).toBe(false)
  })

  it('should summarise the choice with both labels', () => {
    expect(appearanceSummary('system', 'blue')).toBe('System · Blue')
    expect(appearanceSummary('dark', 'pink')).toBe('Dark · Pink')
  })
})
