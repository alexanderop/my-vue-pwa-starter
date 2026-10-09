import type { RouteRecordRaw } from 'vue-router'
import { settingsScreens } from './screens'

// The parent has no component: the hub and each page render straight into the
// app's RouterView, which hands them their props from the same table.
export const settingsRoute: RouteRecordRaw = {
  path: '/settings',
  children: settingsScreens.map((screen) => ({
    path: screen.path,
    name: screen.name,
    component: screen.page,
  })),
}
