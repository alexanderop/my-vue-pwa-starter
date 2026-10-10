---
name: verify
description: Build, launch, and drive the fieldnotes playground to verify a change at its real surface (the browser).
---

# Verify the playground

## Launch

- Start the dev server with the `playground` entry in `.claude/launch.json` (`pnpm dev --port 5191 --strictPort`), then open http://localhost:5191.
- Routes are hash-based: `#/` (notes), `#/settings`, `#/settings/{appearance,install,updates,export,import}`.
- Run `pnpm install --frozen-lockfile` first if `node_modules` is stale (symptom: missing `fast-check`, `valibot`, `knip`).

## Flows worth driving

- Notes: New note → type title → Tab → body → Cmd+Enter. Focus must land on Title when the dialog opens.
- Delete → "Delete note" → toast with Undo inside it → Trash view → Undo / Restore.
- Pin, search (the query persists across route changes by design).
- Export: stub `URL.createObjectURL` to capture the blob. Import: set `input[type=file].files` through a `DataTransfer`, then dispatch `change`.
- Appearance: switch Dark and accents, then recheck dialogs and toasts.
- Recheck toasts and dialogs at 375px (mobile preset). The toast is fixed and centered, so watch for shrink-to-fit wrapping.

## Gotchas

- Screenshots taken right after a hash navigation can show the previous route mid-transition. Wait about 1s.
- The `Preparing` badge never turns to `Offline ready` in dev, because the service worker only runs in the production build (`pnpm build` + `pnpm test:e2e`).
- State lives in IndexedDB and persists between runs. Notes from earlier sessions stay there.
