import * as v from 'valibot'

// `system` follows the browser. The others name a catalog in src/i18n.
export const languages = ['system', 'en', 'de'] as const
export type Language = (typeof languages)[number]
export const languageSchema = v.picklist(languages)
