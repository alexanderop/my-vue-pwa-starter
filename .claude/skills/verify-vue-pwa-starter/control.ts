// Agent CLI for driving the production vue-pwa-starter app.
// Usage: node .claude/skills/verify-vue-pwa-starter/control.ts <command> [options]
import { spawn } from 'node:child_process'
import {
  writeFileSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { createServer } from 'node:net'
import { resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { parseArgs } from 'node:util'
import {
  ControlError,
  isAlive,
  paths,
  readSession,
  repoRoot,
  stateDir,
  type Options,
  type Session,
} from './session.ts'

const help = `control.ts — drive the production vue-pwa-starter app. Every command prints JSON.

Lifecycle
  start [--headed] [--channel chrome]   Build v1+v2, serve them, open a browser (~10 s)
  stop                                  Close browser and server. Keeps .verify/evidence
  restart [--headed]                    stop + start. Use after editing app source
  doctor                                Read-only health check. Run first, and after any failure

State
  seed --list                           List seed scenarios
  seed <scenario> [--count 1-5000] [--append] [--dry-run]
                                        Reset, then import the scenario through Settings → Import backup
  reset [--dry-run]                     Clear IndexedDB and local storage, reopen the notes page
  notes                                 Read-only dump of stored notes (IndexedDB)

Drive
  goto <route|away>                     Route is "/" or "/settings"; "away" opens a page on another origin
  back | reload
  click  <target>                       target = --role R --name N | --label L | --text T  [--nth i] [--substring]
  fill   <target> --value V
  press  --key K                        Playwright key name, e.g. Escape, Control+Enter
  wait   <target> [--state hidden]
  offline on|off
  dialogs accept|dismiss                How to answer in-page confirm/alert (default dismiss). beforeunload is always accepted
  serve-version 1|2                     Switch which build the server returns (service-worker update)

Observe
  info                                  URL, title, service-worker control, stored-note counts
  snapshot [--save] [--path P] [--label L]   ARIA snapshot, printed as plain YAML
  screenshot [--path P] [--label L] [--full]
  console [--tail N]                    Console, page errors and dialogs from this session
`

const { positionals, values } = parseArgs({
  allowPositionals: true,
  strict: true,
  options: {
    role: { type: 'string' },
    name: { type: 'string' },
    label: { type: 'string' },
    text: { type: 'string' },
    nth: { type: 'string' },
    value: { type: 'string' },
    key: { type: 'string' },
    path: { type: 'string' },
    count: { type: 'string' },
    tail: { type: 'string' },
    state: { type: 'string' },
    channel: { type: 'string' },
    substring: { type: 'boolean' },
    save: { type: 'boolean' },
    full: { type: 'boolean' },
    list: { type: 'boolean' },
    append: { type: 'boolean' },
    headed: { type: 'boolean' },
    'dry-run': { type: 'boolean' },
    help: { type: 'boolean' },
  },
})
const [command = 'help', ...rest] = positionals
const options: Options = values

function print(value: unknown) {
  process.stdout.write(JSON.stringify(value, null, 2) + '\n')
}

function freePort(): Promise<number> {
  return new Promise((done) => {
    const server = createServer()
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : 0
      server.close(() => done(port))
    })
  })
}

function runningSession(): Session {
  const session = readSession()
  if (!session || !isAlive(session.pid))
    throw new ControlError(
      'No running verification session.',
      'Run `start` first. Then run `doctor`.',
    )
  return session
}

async function send(session: Session, name: string): Promise<unknown> {
  const response = await fetch(`http://127.0.0.1:${session.controlPort}`, {
    method: 'POST',
    body: JSON.stringify({ command: name, positionals: rest, options }),
  })
  return response.json()
}

/** Polls `check` every `step` ms until it returns a value or `timeout` passes. */
async function poll<T>(
  check: () => T | undefined,
  { step, timeout }: Readonly<{ step: number; timeout: number }>,
): Promise<T | undefined> {
  const value = check()
  if (value !== undefined || timeout <= 0) return value
  await delay(step)
  return poll(check, { step, timeout: timeout - step })
}

async function daemonEnv() {
  return {
    ...process.env,
    // Taken before the build so edits made during it count as stale.
    VERIFY_STARTED_AT: new Date().toISOString(),
    VERIFY_APP_PORT: String(await freePort()),
    VERIFY_AWAY_PORT: String(await freePort()),
    VERIFY_HEADED: options['headed'] === true ? '1' : '0',
    VERIFY_CHANNEL:
      typeof options['channel'] === 'string' ? options['channel'] : 'chromium',
  }
}

async function start() {
  const existing = readSession()
  if (existing && isAlive(existing.pid))
    throw new ControlError(
      `A session is already running at ${existing.appUrl}.`,
      'Use it, or run `restart`. Never drive a session you did not start without running `doctor`.',
    )
  mkdirSync(stateDir, { recursive: true })
  const log = openSync(paths.log, 'w')
  writeFileSync(paths.console, '')
  const daemon = spawn(
    process.execPath,
    [resolve(import.meta.dirname, 'daemon.ts')],
    {
      cwd: repoRoot,
      detached: true,
      stdio: ['ignore', log, log],
      env: await daemonEnv(),
    },
  )
  daemon.unref()
  let exited = false
  const session = await poll(
    () => {
      const current = readSession()
      if (current?.pid === daemon.pid) return current
      exited = !isAlive(daemon.pid ?? -1)
      return exited ? null : undefined
    },
    { step: 250, timeout: 120_000 },
  )
  if (session) return { started: true, ...session }
  throw new ControlError(
    'The daemon did not start.',
    `Read ${paths.log}. Missing browser? Run \`pnpm exec playwright install chromium\`.`,
  )
}

async function stop() {
  const session = readSession()
  if (!session || !isAlive(session.pid))
    return { stopped: false, reason: 'not running' }
  await send(session, 'shutdown').catch(() =>
    process.kill(session.pid, 'SIGTERM'),
  )
  await poll(() => (isAlive(session.pid) ? undefined : true), {
    step: 200,
    timeout: 10_000,
  })
  return { stopped: true, evidence: paths.evidence }
}

const buildInputs = ['apps/playground', 'packages/ui', 'packages/result']
const generated = /(^|\/)(node_modules|dist|\.histoire|\.histoire-dist)(\/|$)/

/** Build inputs modified after `time`: sources, vite config, index.html, public/. */
function changedSince(time: number) {
  return buildInputs
    .flatMap((dir) =>
      readdirSync(resolve(repoRoot, dir), {
        recursive: true,
        encoding: 'utf8',
      })
        .filter((file) => !generated.test(file))
        .map((file) => `${dir}/${file}`),
    )
    .filter((file) => {
      const stats = statSync(resolve(repoRoot, file))
      return stats.isFile() && stats.mtimeMs > time
    })
}

async function doctor() {
  const session = runningSession()
  const app = await fetch(session.appUrl).then(
    (response) => response.status,
    () => 0,
  )
  const info = await send(session, 'info')
  const stale = changedSince(Date.parse(session.startedAt))
  const healthy =
    app === 200 &&
    typeof info === 'object' &&
    info !== null &&
    'ok' in info &&
    info.ok === true
  return {
    healthy: healthy && stale.length === 0,
    session,
    appStatus: app,
    browser: info,
    sourceChangedSinceBuild: stale.slice(0, 10),
    ...(stale.length
      ? { hint: 'The running build predates these edits. Run `restart`.' }
      : {}),
    log: readFileSync(paths.log, 'utf8').trim().split('\n').slice(-3),
  }
}

function snapshotYaml(reply: unknown) {
  if (typeof reply !== 'object' || reply === null || !('result' in reply))
    return undefined
  const { result } = reply
  return typeof result === 'object' && result !== null && 'yaml' in result
    ? String(result.yaml)
    : undefined
}

const local: Record<string, () => Promise<unknown>> = {
  start,
  stop,
  doctor,
  async restart() {
    await stop()
    return start()
  },
}

try {
  if (command === 'help' || options['help'] === true) process.stdout.write(help)
  else if (local[command]) print({ ok: true, result: await local[command]() })
  else {
    const reply = await send(runningSession(), command)
    const yaml = snapshotYaml(reply)
    if (yaml === undefined) print(reply)
    else process.stdout.write(yaml + '\n')
    if (
      typeof reply === 'object' &&
      reply !== null &&
      'ok' in reply &&
      reply.ok === false
    )
      process.exitCode = 1
  }
} catch (error) {
  print(
    error instanceof ControlError
      ? { ok: false, error: error.message, hint: error.hint }
      : {
          ok: false,
          error: String(error),
          hint: `Run \`doctor\`. Daemon log: ${paths.log}`,
        },
  )
  process.exitCode = 1
}
