# my-vue-pwa-starter

A Vue PWA starter with your own UI library, Histoire, and feature-based ports and adapters. The included Fieldnotes app saves notes on your device with native IndexedDB and works offline after its first successful load.

## Run locally

Use Node.js 22.12 or newer and pnpm 10.28.2.

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:4173. Create a note to try the example feature.

To explore the production UI components in Histoire:

```sh
pnpm dev:ui
```

Open http://localhost:6006. Stories use the same components as the application.

<img src="docs/screenshots/mobile-notes.png" alt="Fieldnotes mobile app with a pinned note and floating navigation" width="280">

## Workspace

| Package           | Responsibility                                                               |
| ----------------- | ---------------------------------------------------------------------------- |
| `apps/playground` | Fieldnotes PWA, feature composition, native IndexedDB, installation, updates |
| `packages/ui`     | `@starter/ui`, design tokens, reusable Vue components, Histoire stories      |

The UI package exports Vue source for Vite consumers within this workspace. It is private and does not require an npm release. Applications import components from `@starter/ui` and styles from `@starter/ui/styles.css`.

```vue
<script setup lang="ts">
import { UiButton } from '@starter/ui'
</script>

<template>
  <UiButton>Save note</UiButton>
</template>
```

## Stack

Vue 3, strict TypeScript, Vite, Vue Router, Tailwind CSS, Reka UI, Lucide, Histoire, native IndexedDB, Valibot, and vite-plugin-pwa. Tests use Vitest, Vitest Browser Mode with vitest-browser-vue, and Playwright. Oxlint and Vue ESLint rules check code; Prettier formats it.

Histoire currently requires Vite 7.3. TypeScript 6 stays within the Vue and ESLint tooling compatibility range. The lockfile records the verified versions. No backend, account, Dexie, state container, or DI container is required.

## Verify changes

```sh
pnpm verify
pnpm test:unit
pnpm exec playwright install chrome
pnpm test:browser
pnpm build
pnpm test:e2e
```

`pnpm verify` checks types, lint, import boundaries, and formatting. Unit tests cover pure rules and application outcomes. Browser tests exercise real IndexedDB and component interaction. Playwright runs executable Gherkin scenarios against production builds, including offline navigation and a real upgrade between two service-worker versions. See [verification evidence](docs/verification.md) for the executed journeys and review limits. The test server's version-control endpoint exists only in `scripts/serve-e2e.mjs`.

Histoire is an interactive component workshop. Its stories do not replace automated browser tests.

## Use the starter

Create a repository from this GitHub template, then rename the application, workspace scope, database name, and manifest metadata. Replace the example notes feature with your product features. Keep application wiring in `app` and import reusable UI through the package entry point.

Read [the architecture](docs/architecture.md) for dependency rules. [The implementation plan](docs/implementation-plan.md) and [decision trail](docs/decisions.tsv) record the initial build and verification.

## PWA behavior

The service worker caches application assets. IndexedDB stores notes separately. Updates wait for an explicit action, and an open dirty editor or a pending write prevents an update from reloading the app. Installation is optional and depends on browser support.

Use a production preview to test the service worker:

```sh
pnpm build:app
pnpm --filter @starter/playground preview
```

Host the build over HTTPS, or localhost for development. Configure your host to serve `index.html` for application routes. Browser storage can be cleared or evicted; this starter does not provide cloud backup or synchronization.

## Design reference

[Tilly](https://github.com/carlassmann/tilly) inspired the restrained colors, rounded controls, responsive navigation, and PWA interaction patterns. The Vue components and starter implementation are original. Geist and Lucide retain their respective package licenses.

## License

MIT.
