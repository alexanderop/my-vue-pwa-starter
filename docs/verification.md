# Verification

The initial implementation passed these commands on macOS with Node 24 and Google Chrome.

| Command                          | Result                                                    |
| -------------------------------- | --------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | Passed                                                    |
| `pnpm verify`                    | Types, lint, formatting, and architecture passed          |
| `pnpm test:unit`                 | 5 tests passed                                            |
| `pnpm test:browser`              | 8 tests passed in Chrome                                  |
| `pnpm build`                     | PWA and Histoire passed                                   |
| `pnpm test:e2e`                  | 7 production journeys passed in desktop and mobile Chrome |

The architecture check also rejects six intentionally forbidden imports and browser-global usages in isolated temporary fixtures.

## What the journeys prove

- Create, edit, search, and reload notes through the running application.
- Reopen the app offline and create another note without a network connection.
- Defer an actual service-worker update and activate it without losing saved notes.
- Keep an unsaved draft when an update is waiting.
- Activate an update in another tab, preserve the original tab's draft, navigate, and update that tab explicitly.
- Restore an actual browser Back/Forward cached page, assert `pageshow.persisted`, and save a note after restoration.
- Pin and delete notes, remember the dark theme, and fit a mobile viewport with touch enabled.

The production test server builds two versions in separate output directories. It provides a separate origin for the browser Back journey. Its controls are test-only and do not enter the application build.

## Visual inspection

The application was inspected in native Chrome. Histoire was inspected at desktop and mobile sizes, including its dark theme, dialog, and locally served font. The mobile production screenshots below come from the executed Playwright journey.

- [Mobile notes](screenshots/mobile-notes.png)
- [Mobile editor](screenshots/mobile-editor.png)
- [Histoire foundations](screenshots/histoire.png)

These observations prove the inspected layouts. They are not a complete accessibility audit or verification on Safari and Firefox.

## Independent review

Three design proposals and an independent comparison are recorded in [the design review](design/review.md). A separate correctness reviewer reproduced both the cross-tab update and cached-page storage defects in Chrome. The implementation fixed both and added production regressions. A fresh reviewer found no remaining blocker in those changes. Comment review removed two redundant comments. Direct diff review substituted for the unavailable external deslop plugin.

All agents inherited the available parent model. These are independent same-model reviews, not multi-model diversity. No workspace transcript file was supplied; the audit uses current tool observations and repository artifacts.

Histoire's beta build emits warnings about optional upstream setup exports. It builds and its Vue stories run. No cloud synchronization, real operating-system installation prompt, or cross-browser certification is claimed.

## GitHub Pages verification

[The live PWA](https://alexanderop.github.io/my-vue-pwa-starter/) is deployed from application commit `04aaeac0c581a07871e1408e12b202c0cca427c4`. [CI and Pages deployment](https://github.com/alexanderop/my-vue-pwa-starter/actions/runs/37576957143) succeeded.

The first live smoke found that a full commit ID overflowed the mobile Settings row. The fix displays a short commit ID and lets the row wrap. A fresh live Chrome session at 360 × 800 with dark mode then passed saved-note persistence, Settings reload, service-worker scope, manifest start URL, offline reload and writes, and viewport overflow checks. No page errors were observed. The deployment smoke now uses this viewport and checks Settings before returning to Notes.

- [Deployed Settings](screenshots/deployed-settings.png)
- [Deployed offline notes](screenshots/deployed-offline.png)

Reproduce with `node scripts/verify-deployment.mjs https://alexanderop.github.io/my-vue-pwa-starter/`. The smoke uses a disposable browser context. The final evidence commit changes documentation and the verification script only; the tested application build stays deployed. Physical phone installation and Safari remain manual checks.
