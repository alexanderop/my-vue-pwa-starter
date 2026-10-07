# Architecture

The app composes concrete capabilities. Features own their domain rules, application services, outbound ports, adapters, and Vue UI. The UI workspace has no application dependencies.

## Design decision

Three independent design sketches compared a focused feature service, a command/snapshot session, and a feature runtime. An independent same-model judge scored them 24, 18, and 18 out of 25 for simplicity, ownership, durability, UI reuse, and implementability. The focused service is the base. Vue already owns reactive UI state, so a second subscription system adds no useful capability here.

The design adopts explicit cleanup and update guards from the runtime candidate. Writes must commit before success is reported. Revision checks reject stale edits. In-flight reads are invalidated when a mutation begins. Refresh failure after a committed write is a separate UI concern.

The notes feature owns its database adapter because no second feature needs a shared transaction. A shared database layer can be extracted when that requirement exists. No generic repository, DI container, or event bus is included.

## Ownership

- `app` constructs adapters, injects dependencies, and owns routing and browser lifecycle.
- `features/notes/domain` owns validated note data and pure rules.
- `features/notes/application` owns user actions and receives storage, clock, and ID capabilities.
- `features/notes/ports` declares persistence contracts.
- `features/notes/adapters` implements those contracts with native IndexedDB and validates stored rows.
- `features/notes/ui` owns reactive view state and calls supplied application capabilities.
- `platform/pwa` owns service-worker registration, installation, and update readiness.
- `packages/ui` owns reusable presentation, semantic styles, accessible interactions, and Histoire stories.

`pnpm check:architecture` enforces import directions. Pure code does not use browser globals or Vue. UI components do not discover databases or feature adapters.

## Verification

Node tests cover domain rules and application outcomes with explicit deterministic dependencies. Browser tests exercise real IndexedDB and Vue interaction. Playwright drives the production application, offline reopening, and a real service-worker upgrade. Histoire provides interactive examples and visual review; it is not the automated test runner.
