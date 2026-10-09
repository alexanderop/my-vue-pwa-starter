import type { Component } from 'vue'
import type { SettingsContext } from './settingsContext'

type PageComponent = Component & (new (...args: never[]) => { $props: object })
type PageProps<C extends PageComponent> = InstanceType<C>['$props']

// A page plus the props it declares, so TypeScript rejects a missing or
// misnamed prop and the page never receives anything it did not ask for.
export type Page = {
  page: Component
  propsFor: (context: SettingsContext) => object
}

export function definePage<C extends PageComponent>(
  page: C,
  props: (context: SettingsContext) => PageProps<C>,
): Page {
  return { page, propsFor: props }
}
