import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { Locator, Page } from '@playwright/test'
import {
  activePage,
  openApp,
  requireAppPage,
  reset,
  seed,
  storedNotes,
  summary,
  type Command,
} from './state.ts'
import {
  ControlError,
  option,
  paths,
  repoRoot,
  requireOption,
  type Options,
} from './session.ts'

const target =
  '--role <role> --name <accessible name> | --label <label> | --text <text> [--nth <n>] [--substring]'

type Role = Parameters<Page['getByRole']>[0]
const roles: readonly Role[] = [
  'alert',
  'article',
  'button',
  'checkbox',
  'combobox',
  'dialog',
  'group',
  'heading',
  'img',
  'link',
  'list',
  'listitem',
  'main',
  'navigation',
  'option',
  'radio',
  'region',
  'searchbox',
  'status',
  'switch',
  'tab',
  'textbox',
]
const isRole = (value: string): value is Role =>
  roles.some((role) => role === value)

function byRole(page: Page, role: string, options: Options): Locator {
  if (!isRole(role))
    throw new ControlError(
      `Unsupported role "${role}".`,
      `Use one of: ${roles.join(', ')}.`,
    )
  const name = option(options, 'name')
  const exact = options['substring'] !== true
  return page.getByRole(role, name === undefined ? {} : { name, exact })
}

function base(page: Page, options: Options): Locator {
  const exact = options['substring'] !== true
  const role = option(options, 'role')
  const label = option(options, 'label')
  const text = option(options, 'text')
  if (role) return byRole(page, role, options)
  if (label) return page.getByLabel(label, { exact })
  if (text) return page.getByText(text, { exact })
  throw new ControlError('No element target given.', `Use ${target}.`)
}

function locate(page: Page, options: Options): Locator {
  const locator = base(page, options)
  const nth = option(options, 'nth')
  return nth === undefined ? locator : locator.nth(Number(nth))
}

function evidencePath(options: Options, extension: string) {
  const given = option(options, 'path')
  const file = given
    ? resolve(repoRoot, given)
    : resolve(
        paths.evidence,
        `${new Date().toISOString().replaceAll(':', '-')}-${option(options, 'label') ?? 'capture'}.${extension}`,
      )
  mkdirSync(dirname(file), { recursive: true })
  return file
}

async function settle(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  return { url: page.url(), title: await page.title() }
}

export const commands: Readonly<Record<string, Command>> = {
  seed,
  reset,
  async info(runtime) {
    const reopened = runtime.context.pages().length === 0
    if (reopened) await openApp(runtime)
    const page = activePage(runtime)
    const onApp = page.url().startsWith(runtime.appUrl)
    return {
      url: page.url(),
      title: await page.title(),
      pages: runtime.context.pages().length,
      reopenedClosedPage: reopened,
      serviceWorkerControlled: onApp
        ? await page.evaluate(() => Boolean(navigator.serviceWorker.controller))
        : false,
      stored: onApp ? await summary(page) : null,
    }
  },
  async goto(runtime, { positionals }) {
    const route = positionals[0] ?? '/'
    if (route === 'away') {
      const page = activePage(runtime)
      await page.goto(runtime.awayUrl)
      return settle(page)
    }
    return settle(await openApp(runtime, route))
  },
  async back(runtime) {
    const page = activePage(runtime)
    await page.goBack()
    return settle(page)
  },
  async reload(runtime) {
    const page = activePage(runtime)
    await page.reload()
    return settle(page)
  },
  async notes(runtime) {
    return storedNotes(requireAppPage(runtime))
  },
  async snapshot(runtime, { options }) {
    const page = activePage(runtime)
    const aria = await page.locator('body').ariaSnapshot()
    const header = [`# url: ${page.url()}`]
    if (option(options, 'path') !== undefined || options['save'] === true) {
      const file = evidencePath(options, 'aria.yml')
      writeFileSync(file, aria)
      header.push(`# saved: ${file}`)
    }
    return { yaml: [...header, aria].join('\n') }
  },
  async screenshot(runtime, { options }) {
    const file = evidencePath(options, 'png')
    await activePage(runtime).screenshot({
      path: file,
      fullPage: options['full'] === true,
    })
    return { path: file }
  },
  async click(runtime, { options }) {
    await locate(activePage(runtime), options).click()
    return settle(activePage(runtime))
  },
  async fill(runtime, { options }) {
    const value = requireOption(
      options,
      'value',
      `fill ${target} --value <text>`,
    )
    await locate(activePage(runtime), options).fill(value)
    return { filled: value }
  },
  async press(runtime, { options }) {
    const key = requireOption(options, 'key', 'press --key <key>')
    await activePage(runtime).keyboard.press(key)
    return { pressed: key }
  },
  async wait(runtime, { options }) {
    const state = option(options, 'state') === 'hidden' ? 'hidden' : 'visible'
    await locate(activePage(runtime), options).first().waitFor({ state })
    return { state }
  },
  dialogs(runtime, { positionals }) {
    const answer = positionals[0]
    if (answer !== 'accept' && answer !== 'dismiss')
      throw new ControlError(
        `Expected "accept" or "dismiss", got "${answer ?? ''}".`,
        'Usage: dialogs accept|dismiss. Seen dialogs appear in `console`.',
      )
    runtime.dialogs.answer = answer
    return Promise.resolve({ answer })
  },
  async offline(runtime, { positionals }) {
    const offline = positionals[0] !== 'off'
    await runtime.context.setOffline(offline)
    return { offline }
  },
  console(_runtime, { options }) {
    if (!existsSync(paths.console)) return Promise.resolve([])
    const tail = Number(option(options, 'tail') ?? 50)
    const lines = readFileSync(paths.console, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .slice(-tail)
    return Promise.resolve(lines.map((line): unknown => JSON.parse(line)))
  },
  async 'serve-version'(runtime, { positionals }) {
    const version = positionals[0] ?? '2'
    const response = await fetch(
      `${runtime.appUrl}/__test/version?value=${version}`,
      { method: 'POST' },
    )
    if (!response.ok)
      throw new ControlError(
        `Version "${version}" is not built.`,
        'Use `serve-version 1` or `serve-version 2`.',
      )
    return { serving: await response.text() }
  },
}
