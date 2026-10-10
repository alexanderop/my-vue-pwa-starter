import { createI18n, useI18n } from 'vue-i18n'
import { de } from './de'
import { en } from './en'

export type Messages = typeof en
const locales = ['en', 'de'] as const
export type Locale = (typeof locales)[number]

// Dotted paths to every string in the catalog, and to every string list.
type Paths<T, Leaf, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Leaf
    ? `${Prefix}${K}`
    : T[K] extends string | readonly string[]
      ? never
      : Paths<T[K], Leaf, `${Prefix}${K}.`>
}[keyof T & string]
export type MessageKey = Paths<Messages, string>
export type ListKey = Paths<Messages, readonly string[]>
type Values = Record<string, string | number>

// The slice of a vue-i18n composer the strict translator needs.
type Lookup = {
  t: {
    (key: string): string
    (key: string, count: number): string
    (key: string, values: Values): string
    (key: string, values: Values, count: number): string
  }
  te: (key: string) => boolean
}

export function createAppI18n(locale: Locale = 'en') {
  return createI18n<[Messages], Locale, false>({
    locale,
    fallbackLocale: 'en',
    messages: { en, de },
  })
}

// vue-i18n's own `t` accepts any string. This one accepts only catalog keys,
// so a typo or a key removed from en.ts fails the typecheck.
export function strictTranslator({ t, te }: Lookup) {
  function translate(key: MessageKey, count?: number): string
  function translate(key: MessageKey, values: Values, count?: number): string
  function translate(
    key: MessageKey,
    values?: Values | number,
    count?: number,
  ): string {
    if (typeof values === 'number') return t(key, values)
    if (values && count !== undefined) return t(key, values, count)
    return values ? t(key, values) : t(key)
  }
  function list(key: ListKey): string[] {
    const items: string[] = []
    for (let index = 0; te(`${key}.${index}`); index++)
      items.push(t(`${key}.${index}`))
    return items
  }
  return { t: translate, list }
}

export function useTranslation() {
  const composer = useI18n()
  return { ...strictTranslator(composer), locale: composer.locale }
}

// The first supported language in the browser's preference list, else English.
export function matchLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0]
    const match = locales.find((locale) => locale === base)
    if (match) return match
  }
  return 'en'
}

export type Translate = ReturnType<typeof strictTranslator>['t']
