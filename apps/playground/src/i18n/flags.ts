// vue-i18n reads these compile-time flags: Composition API only, no legacy
// API, no global <i18n-t> components, no devtools hooks in production.
export const vueI18nFlags = {
  __VUE_I18N_LEGACY_API__: false,
  __VUE_I18N_FULL_INSTALL__: false,
  __INTLIFY_PROD_DEVTOOLS__: false,
}

// The same flags as bundler `define` replacements.
export const vueI18nDefines = Object.fromEntries(
  Object.entries(vueI18nFlags).map(([flag, value]) => [flag, String(value)]),
)
