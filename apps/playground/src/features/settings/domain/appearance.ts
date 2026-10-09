import * as v from 'valibot'

// CSS for each accent lives in packages/ui/src/styles/index.css, keyed by id.
export const themes = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
] as const

export const accents = [
  { id: 'blue', label: 'Blue' },
  { id: 'teal', label: 'Teal' },
  { id: 'violet', label: 'Violet' },
  { id: 'pink', label: 'Pink' },
  { id: 'sand', label: 'Sand' },
] as const

export type Theme = (typeof themes)[number]['id']
export type Accent = (typeof accents)[number]['id']

export const themeSchema = v.picklist(themes.map((theme) => theme.id))
export const accentSchema = v.picklist(accents.map((accent) => accent.id))

function labelOf(
  options: readonly { id: string; label: string }[],
  id: string,
) {
  return options.find((option) => option.id === id)?.label ?? id
}

export const appearanceSummary = (theme: Theme, accent: Accent) =>
  `${labelOf(themes, theme)} · ${labelOf(accents, accent)}`
