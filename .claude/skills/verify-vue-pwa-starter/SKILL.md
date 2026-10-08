---
name: verify-vue-pwa-starter
description: Drive the real production build of the vue-pwa-starter notes PWA in a headless browser and capture proof. Use after any UI, storage, service-worker, or routing change, to reproduce a reported bug, or when asked to "verify", "show proof", "screenshot", or "check it works in the app". Includes CLI seeders for notes state.
---

# Verify vue-pwa-starter

`control.ts` drives the production PWA the way a user does and prints JSON. It builds the app twice (version 1 and 2), serves both through `scripts/serve-e2e.mjs` on free ports, and keeps one Chromium open between calls. Tests prove units. This skill proves that the running app works.

```bash
node .claude/skills/verify-vue-pwa-starter/control.ts help
```

Every example below uses `$C` as shorthand for `node .claude/skills/verify-vue-pwa-starter/control.ts`.

## Launch

```bash
$C start            # ~10 s: two production builds, server, headless Chromium
$C start --headed   # visible browser, local only
```

Ready when `start` prints `"started": true` with an `appUrl`. One session per checkout: state lives in `.verify/` at the repo root. Separate worktrees run separate sessions on separate ports.

The build is fixed at start time. After editing anything in `apps/` or `packages/`, run `$C restart`. `doctor` lists the changed files when the build is stale.

Requires Node ≥ 22.18 (runs TypeScript directly) and Playwright Chromium (`pnpm exec playwright install chromium`).

## Doctor

```bash
$C doctor
```

Read-only. Run it before the first drive, after any failed command, and whenever output surprises you. `healthy: true` requires the daemon to be alive, the app to answer with 200, a page to be open, and no source edits since the build. If the page was closed, doctor reopens the app and reports `reopenedClosedPage: true`. Stored notes survive in the profile.

## Seed state

```bash
$C seed --list
$C seed basic                 # "Quarterly plan", "Grocery list"
$C seed trash-and-pinned      # + 2 pinned, 2 trashed
$C seed many --count 500      # scroll and performance (1–5000)
$C seed basic --dry-run       # print the backup, change nothing
$C reset                      # empty notebook, keeps the service worker
```

`seed` clears storage, then imports the scenario through **Settings → Import backup**, the real user path with Valibot validation. It reports counts read back from IndexedDB. Use `--append` to import on top of the current data. Import assigns new ids, so recipes address notes by title. Scenarios live in `seeds.ts` and are typed against the app's `Note`, so `pnpm typecheck` catches drift.

## Drive

```bash
$C goto /settings                      # routes: / and /settings; `away` = another origin
$C click --role button --name "New note"
$C fill  --role textbox --name Title --value "Release checklist"
$C press --key Control+Enter
$C wait  --role dialog --name "New note" --state hidden
$C offline on | off
$C dialogs accept                      # answer in-page confirm()/alert() (default dismiss)
$C serve-version 2                     # server now returns build 2 (service-worker update)
$C back | reload
```

Target elements by ARIA role and accessible name. Use `--label` or `--text` only if no role fits. Names match exactly unless you pass `--substring`. If a target matches several elements, the error gives the count. Add `--nth i`. Actions time out after 5 s, and the hint says what to check.

Native dialogs: `beforeunload` is always accepted, because the navigation is the command. Dialogs during `seed`, `reset` and `goto` are accepted too, so app guards never block setup. Only in-page `confirm()`/`alert()` follow `dialogs`. Every dialog is logged in `console`. `goto` always reloads the route.

Prefer user input over shortcuts: no `page.evaluate` writes, no test-only routes except `serve-version`.

## Evidence

```bash
$C snapshot                            # plain YAML ARIA tree
$C snapshot --save --label create-note # also writes .verify/evidence/<ts>-create-note.aria.yml
$C screenshot --label create-note [--full]
$C notes                               # read-only dump of stored notes (app page only)
$C console --tail 20                   # browser console, page errors and dialogs from this session
```

Proof standards:

- Capture the action and the resulting state, not only the final screen.
- A mutation needs a second, read-only view: `reload` and see it on screen, plus `notes` for storage.
- Use the real user path. Seeding is setup, never proof of the feature under test.
- Report a path you could not drive, with the command you tried. Never report it as verified through another path.
- Attach the evidence paths to your report or PR.

## Cleanup

```bash
$C stop
```

Closes the browser and server, then deletes `.verify/profile` and `.verify/builds`. `.verify/evidence/` survives. Stop only sessions you started. If `start` reports a running session you didn't start, run `doctor` and reuse it, or ask.

## Feature map

Read [features/README.md](features/README.md) before driving a feature. Each feature file lists its entry points, exact commands and gotchas. A proof that drives one entry point is incomplete when the map lists others.

When you change user-facing behavior, update the matching feature file in the same change. Run `/maintain-verify-vue-pwa-starter` for a full audit.

## Files

| File          | Role                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `control.ts`  | CLI entry. `start`, `stop`, `restart` and `doctor` run locally. Other commands go to the daemon         |
| `daemon.ts`   | Long-lived process that owns the server and browser, and logs console output to `.verify/console.jsonl` |
| `commands.ts` | Browser commands, seeding, reset                                                                        |
| `seeds.ts`    | Seed scenarios                                                                                          |
| `session.ts`  | Paths and the session file                                                                              |
