import * as v from 'valibot'

// CSS for each accent lives in packages/ui/src/styles/index.css, keyed by id.
// Labels live in the message catalogs under settings.appearance.
export const themes = ['system', 'light', 'dark'] as const
export const accents = ['blue', 'teal', 'violet', 'pink', 'sand'] as const

export type Theme = (typeof themes)[number]
export type Accent = (typeof accents)[number]

export const themeSchema = v.picklist(themes)
export const accentSchema = v.picklist(accents)
