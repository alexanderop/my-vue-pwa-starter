import { computed } from 'vue'
import { createI18n, useI18n } from 'vue-i18n'
import { de } from './de'
import { en } from './en'

const locales = ['en', 'de'] as const
export type Locale = (typeof locales)[number]
export { locales as supportedLocales }

// German and any later catalog must match en.ts key for key.
type Widen<T> = T extends string
  ? string
  : T extends readonly string[]
    ? readonly string[]
    : { readonly [K in keyof T]: Widen<T[K]> }
export type Catalog = Widen<typeof en>

// Dotted paths to every string in the catalog, and to every string list.
type Paths<T, Leaf, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Leaf
    ? `${Prefix}${K}`
    : T[K] extends string | readonly string[]
      ? never
      : Paths<T[K], Leaf, `${Prefix}${K}.`>
}[keyof T & string]
type MessageKey = Paths<typeof en, string>
type ListKey = Paths<typeof en, readonly string[]>

// The arguments a message needs, read from its English text: `{name}`
// placeholders become named values, and `a | b` plural forms need a count.
type At<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? At<T[Head], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never
type Placeholders<S> = S extends `${string}{${infer Name}}${infer Rest}`
  ? Name | Placeholders<Rest>
  : never
type Named<Names extends string> = Record<Names, string | number>
type ArgsFor<S> = S extends `${string} | ${string}`
  ? [Exclude<Placeholders<S>, 'n'>] extends [never]
    ? [count: number]
    : [values: Named<Exclude<Placeholders<S>, 'n'>>, count: number]
  : [Placeholders<S>] extends [never]
    ? []
    : [values: Named<Placeholders<S>>]
type Args<K> = K extends MessageKey ? ArgsFor<At<typeof en, K>> : never
export type Translate = <K extends MessageKey>(
  key: K,
  ...args: Args<K>
) => string

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
  return createI18n<[Catalog], Locale, false>({
    locale,
    fallbackLocale: 'en',
    messages: { en, de },
    // No `$t` in templates: it accepts any string and skips Translate.
    globalInjection: false,
  })
}

// vue-i18n's own `t` accepts any string. This one accepts only catalog keys
// with the placeholders and count each message needs.
export function strictTranslator({ t, te }: Lookup) {
  const translate: Translate = (
    key: string,
    ...args: readonly (Values | number)[]
  ) => {
    const [first, second] = args
    if (typeof first === 'number') return t(key, first)
    if (first && typeof second === 'number') return t(key, first, second)
    return first ? t(key, first) : t(key)
  }
  function list(key: ListKey): string[] {
    const items: string[] = []
    for (let index = 0; te(`${key}.${index}`); index++)
      items.push(t(`${key}.${index}`))
    return items
  }
  return { t: translate, list }
}

// Read-only locale: only useLocaleSetter may change the app language.
export function useTranslation() {
  const composer = useI18n()
  return {
    ...strictTranslator(composer),
    locale: computed(() => composer.locale.value),
  }
}

export function useLocaleSetter() {
  const { locale } = useI18n()
  return (next: Locale) => {
    locale.value = next
  }
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
