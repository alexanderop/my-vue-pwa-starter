---
name: maintain-verify-vue-pwa-starter
description: Audit and repair the verify-vue-pwa-starter skill so its CLI, seeds, and feature map still match the app. Source readers per feature, one live session that drives every feature, at most one change of proven corrections. Use for /maintain-verify-vue-pwa-starter, "audit the verify skill", "update the feature map", or after a change to user-facing UI, routes, storage, or the service worker.
disable-model-invocation: true
---

# Maintain verify-vue-pwa-starter

The feature map goes stale the moment the app changes. This pass keeps `.claude/skills/verify-vue-pwa-starter/` honest. The unit of rigor is the feature: every feature file gets read against the source, and every feature gets driven live.

Anyone can run this: a scheduled agent, a contributor after a UI change, or you before trusting the map.

## Outcomes

Pick one and say which:

- **clean**: every feature got source and live coverage, and nothing needed changing.
- **changed**: one commit or PR of proven corrections to the skill.
- **blocked**: coverage could not finish, or a proven fix could not ship safely. Say exactly what blocked it.

## Edit scope

Edit only `.claude/skills/verify-vue-pwa-starter/`: `SKILL.md`, `features/`, `seeds.ts`, and the CLI files. Never edit product code during this pass. If the map describes behavior the app no longer has, decide which it is:

- **Doc drift**: the app changed on purpose. Fix the map.
- **Product regression**: the app is broken. Report it to the user and leave the map alone.

`scripts/serve-e2e.mjs` is shared with `pnpm test:e2e`. Change it only if a harness gap requires it, then run `pnpm test:e2e`.

## Pass

0. **Baseline.** Run `pnpm install --frozen-lockfile`. Read `SKILL.md` and `features/README.md`. Check recent churn with `git log --since="14 days ago" --name-only -- apps/playground/src packages/ui/src`.

1. **Index hygiene.** Glob `features/*.md`. Fix missing, extra, duplicate or dead entries in the README index. Confirm each file follows the four-H2 contract in the README. Move a "Not yet mapped" entry into a file once you have verified it.

2. **Source wave.** Launch one read-only subagent per feature file, concurrently. Each one reads the feature file and the Vue/TS source behind it (`apps/playground/src/features/**/ui/*.vue`, `app/App.vue`, `packages/ui/src`). It returns:
   - a feature summary from source,
   - entry points with file:line citations,
   - likely drift (an accessible name, role, text, route or count that no longer matches), or "none",
   - one live recipe as `control.ts` commands.

   Subagents never drive the app and never edit files.

3. **Reconcile.** Make sure every feature file has a returned summary. Merge overlapping recipes so you seed as few times as possible. Spot-check cited drift in source. Don't re-prove clean claims. Sweep recent churn for user-facing surfaces the map lacks, such as a new route, button or dialog. Require a concrete source path before calling something missing.

4. **Live pass.** Required even when source looks clean. Only you drive. Use one session:
   - `control.ts start`, then `doctor` before the first drive. Run `doctor` again after any failed command, and `restart` after any harness or source edit.
   - Exercise every feature file at least once, starting from the seed its preconditions name.
   - Save evidence with `snapshot --save --label <feature>` and `screenshot --label <feature>`. Confirm the files exist under `.verify/evidence/`.
   - A feature counts as `verified-unreachable` only with the concrete prerequisite and the command attempted. If the map omits that prerequisite, that is drift.
   - Re-drive any harness fix live before it ships.
   - `control.ts stop` after the last drive, then confirm the evidence still exists.

5. **Triage.**
   - Wrong or missing user-POV description → doc drift. Fix the feature file.
   - Behavior that works but the CLI can't drive → harness gap. Fix `commands.ts`/`control.ts`, add it to `help` and `SKILL.md`, and re-drive.
   - A seed that no longer imports → fix `seeds.ts`. `pnpm typecheck` must pass.
   - App behavior that is actually broken → product gap. Record it for the user and keep it out of this change.

6. **Gates.** Run `pnpm typecheck`, `pnpm lint` and `pnpm format:check`. The skill's TypeScript is inside both gates.

7. **Ship or stop.** For **changed**: re-read every changed file, then make one commit or PR titled `verify skill: <summary>`, listing features covered, drift fixed and evidence paths. For **clean** or **blocked**: no commit. Report the outcome and the coverage honestly.

Keep run notes (features covered, unreachable prerequisites, drift, product gaps) in the session scratchpad, not in the repo.
