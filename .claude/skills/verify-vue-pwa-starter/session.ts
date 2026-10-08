import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = fileURLToPath(new URL('../../../', import.meta.url))
export const stateDir = resolve(repoRoot, '.verify')
export const paths = {
  session: resolve(stateDir, 'session.json'),
  profile: resolve(stateDir, 'profile'),
  builds: resolve(stateDir, 'builds'),
  seeds: resolve(stateDir, 'seeds'),
  evidence: resolve(stateDir, 'evidence'),
  console: resolve(stateDir, 'console.jsonl'),
  log: resolve(stateDir, 'daemon.log'),
} as const

export type Session = Readonly<{
  pid: number
  controlPort: number
  appUrl: string
  awayUrl: string
  startedAt: string
  revision: string
  headless: boolean
  channel: string
}>

export type Options = Readonly<Record<string, string | boolean | undefined>>
export type Request = Readonly<{
  command: string
  positionals: readonly string[]
  options: Options
}>

/** Thrown for expected failures. `hint` tells the agent what to do instead. */
export class ControlError extends Error {
  readonly hint: string
  constructor(message: string, hint: string) {
    super(message)
    this.hint = hint
  }
}

export function readSession(): Session | undefined {
  if (!existsSync(paths.session)) return undefined
  const value: unknown = JSON.parse(readFileSync(paths.session, 'utf8'))
  return isSession(value) ? value : undefined
}

function isSession(value: unknown): value is Session {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pid' in value &&
    'controlPort' in value &&
    'appUrl' in value
  )
}

export function isAlive(pid: number) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

export function option(options: Options, key: string) {
  const value = options[key]
  return typeof value === 'string' ? value : undefined
}

export function requireOption(options: Options, key: string, usage: string) {
  const value = option(options, key)
  if (value === undefined)
    throw new ControlError(`Missing --${key}.`, `Usage: ${usage}`)
  return value
}
