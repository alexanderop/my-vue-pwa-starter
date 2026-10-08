# vue-pwa-starter verification map

This directory is the maintained source for verifying the user-facing behavior of the vue-pwa-starter app. Read this index first, then use the matching feature file as the recipe.

`$C` means `node .claude/skills/verify-vue-pwa-starter/control.ts`.

## Baseline preconditions

- Start a session with `$C start` and require `$C doctor` to report `healthy: true`.
- Start each recipe with the seed scenario named in its preconditions. `seed` resets storage first.
- Never drive a session that this run did not start or health-check.

## Driving conventions

- Target elements by ARIA role and accessible name. Keep quoted names exactly as written.
- The app has two top-level views, reached with the `Notes` and `Settings` buttons in `navigation "Main navigation"`.
- Notes are addressed by title. Seeded ids change on import.
- Run `$C snapshot` whenever a command fails or the screen is uncertain.

## Proof and skip reporting

- Capture the user action and the resulting state: `snapshot --save` plus `screenshot` with the same `--label`.
- Mutation proof includes a read-only second view: `reload`, then see it on screen, plus `notes` for IndexedDB.
- Record the feature ID and entry point with every artifact.
- Report an unreachable path with the attempted command and the unmet precondition.
- Do not report a skipped entry point as verified through a different path.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order:

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with control.ts` starts with `Preconditions:`. Its labeled bullets pair each user action with an exact command and an observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

Keep implementation details out of the map. Name only user paths, stable handles, required state, commands and observable proof.

## Features

- [Notes](./notes.md) covers creating, editing, validating, pinning and persisting notes.
- [Search](./search.md) covers matching, the empty state and clearing.
- [Trash](./trash.md) covers delete, Undo, Trash view, restore and permanent delete.

## Not yet mapped

Write these as feature files when you first verify them:

- Settings: theme (`Appearance`), backup export and import (`Your notes, with you`).
- Offline reopen (`offline on`, then `reload`).
- Service-worker update banner (`serve-version 2`, `App update` region with `Later` and `Update now`).
- Edit conflicts between two tabs.
