import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { BrowserContext, Page } from '@playwright/test'
import { backupLimits, buildBackup, scenarios } from './seeds.ts'
import { ControlError, option, paths, type Request } from './session.ts'

export type Runtime = Readonly<{
  context: BrowserContext
  appUrl: string
  awayUrl: string
  /**
   * How native confirm/alert dialogs are answered. `harness` is set while the
   * CLI itself navigates (seed, reset, goto), so app guards never block setup.
   */
  dialogs: { answer: 'accept' | 'dismiss'; harness: boolean }
}>
export type Command = (runtime: Runtime, request: Request) => Promise<unknown>

const databaseName = 'my-vue-pwa-starter-notes'

export function activePage({ context }: Runtime): Page {
  const page = context.pages().at(-1)
  if (!page)
    throw new ControlError(
      'No open page.',
      'Run `doctor`; it reopens the app. Seeded state survives in the profile.',
    )
  return page
}

/** Read-only view of stored notes. Never creates the database. */
export async function storedNotes(page: Page) {
  return page.evaluate(async (name) => {
    const known = await indexedDB.databases()
    if (!known.some((database) => database.name === name)) return []
    const database = await new Promise<IDBDatabase>((done, fail) => {
      const request = indexedDB.open(name)
      request.addEventListener('success', () => done(request.result))
      request.addEventListener('error', () =>
        fail(new Error(String(request.error))),
      )
    })
    try {
      return await new Promise<
        { title: string; pinned: boolean; deletedAt?: number }[]
      >((done, fail) => {
        const request = database
          .transaction('notes', 'readonly')
          .objectStore('notes')
          .getAll()
        request.addEventListener('success', () => done(request.result))
        request.addEventListener('error', () =>
          fail(new Error(String(request.error))),
        )
      })
    } finally {
      database.close()
    }
  }, databaseName)
}

export async function summary(page: Page) {
  const notes = await storedNotes(page)
  const active = notes.filter((note) => note.deletedAt === undefined)
  return {
    active: active.length,
    pinned: active.filter((note) => note.pinned).length,
    trashed: notes.length - active.length,
  }
}

/** Runs a harness navigation with every native dialog accepted. */
async function asHarness<T>(runtime: Runtime, work: () => Promise<T>) {
  runtime.dialogs.harness = true
  try {
    return await work()
  } finally {
    runtime.dialogs.harness = false
  }
}

export function requireAppPage(runtime: Runtime) {
  const page = activePage(runtime)
  if (!page.url().startsWith(`${runtime.appUrl}/`))
    throw new ControlError(
      `The page is on ${page.url()}, not the app.`,
      'Run `goto /` first.',
    )
  return page
}

const landmarks: Readonly<Record<string, string>> = {
  '/': 'New note',
  '/settings': 'Import backup',
}

export async function openApp(runtime: Runtime, route = '/') {
  const page =
    runtime.context.pages().at(-1) ?? (await runtime.context.newPage())
  // Leave the app first so the route always mounts fresh, without stale
  // status messages from an earlier visit.
  await asHarness(runtime, async () => {
    await page.goto('about:blank')
    await page.goto(`${runtime.appUrl}/#${route}`)
  })
  await page
    .getByRole('button', { name: landmarks[route] ?? 'Settings', exact: true })
    .first()
    .waitFor()
  return page
}

async function clearStorage(runtime: Runtime) {
  const page = activePage(runtime)
  await asHarness(runtime, () => page.goto('about:blank'))
  const cdp = await runtime.context.newCDPSession(page)
  await cdp.send('Storage.clearDataForOrigin', {
    origin: runtime.appUrl,
    storageTypes: 'indexeddb,local_storage,session_storage',
  })
  await cdp.detach()
}

function seedCount(options: Request['options']) {
  const raw = option(options, 'count') ?? '60'
  const count = Number(raw)
  if (!Number.isInteger(count) || count < 1 || count > backupLimits.notes)
    throw new ControlError(
      `Invalid --count "${raw}".`,
      `Use a whole number from 1 to ${backupLimits.notes}.`,
    )
  return count
}

async function importBackup(runtime: Runtime, file: string) {
  const page = await openApp(runtime, '/settings')
  const chooser = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Import backup', exact: true }).click()
  await (await chooser).setFiles(file)
  const card = page.getByRole('article', { name: 'Your notes, with you' })
  const done = card.getByRole('status').filter({ hasText: /^Imported / })
  const failed = card.getByRole('alert')
  await done.or(failed).first().waitFor()
  if (await failed.isVisible())
    throw new ControlError(
      `Import failed: ${await failed.innerText()}`,
      'Check the scenario in seeds.ts against noteSchema in note.ts.',
    )
}

export const seed: Command = async (runtime, { positionals, options }) => {
  const name = positionals[0]
  if (!name || options['list'] === true)
    return Object.entries(scenarios).map(([id, { description }]) => ({
      id,
      description,
    }))
  if (!scenarios[name])
    throw new ControlError(
      `Unknown scenario "${name}".`,
      `Valid scenarios: ${Object.keys(scenarios).join(', ')}. Run \`seed --list\`.`,
    )
  const backup = buildBackup(name, seedCount(options))
  if (options['dry-run'] === true) return { dryRun: true, backup }
  if (options['append'] !== true) await clearStorage(runtime)
  if (backup.notes.length) {
    const file = resolve(paths.seeds, `${name}.json`)
    mkdirSync(paths.seeds, { recursive: true })
    writeFileSync(file, JSON.stringify(backup))
    await importBackup(runtime, file)
  }
  const page = await openApp(runtime)
  return { scenario: name, stored: await summary(page), url: page.url() }
}

export const reset: Command = async (runtime, { options }) => {
  if (options['dry-run'] === true)
    return {
      dryRun: true,
      clears: ['indexeddb', 'local_storage', 'session_storage'],
      keeps: ['service worker', 'cache storage', 'evidence'],
    }
  await clearStorage(runtime)
  const page = await openApp(runtime)
  return { stored: await summary(page), url: page.url() }
}
