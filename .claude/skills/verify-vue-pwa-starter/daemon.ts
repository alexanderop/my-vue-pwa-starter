// Long-lived process started by `control.ts start`. It owns the production
// server and the browser so state survives between CLI calls.
import { spawn, type ChildProcess } from 'node:child_process'
import { appendFileSync, rmSync, writeFileSync } from 'node:fs'
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http'
import { chromium } from '@playwright/test'
import { commands } from './commands.ts'
import type { Runtime } from './state.ts'
import {
  ControlError,
  paths,
  repoRoot,
  type Request,
  type Session,
} from './session.ts'

const appPort = Number(process.env.VERIFY_APP_PORT)
const awayPort = Number(process.env.VERIFY_AWAY_PORT)
const headless = process.env.VERIFY_HEADED !== '1'
const channel = process.env.VERIFY_CHANNEL ?? 'chromium'
const appUrl = `http://127.0.0.1:${appPort}`

function startServer(): Promise<ChildProcess> {
  const server = spawn('node', ['scripts/serve-e2e.mjs'], {
    cwd: repoRoot,
    env: {
      ...process.env,
      SERVE_PORT: String(appPort),
      SERVE_AWAY_PORT: String(awayPort),
      SERVE_BUILD_ROOT: paths.builds,
    },
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  return new Promise((done, fail) => {
    server.stdout.on('data', (chunk: Buffer) => {
      process.stdout.write(chunk)
      if (chunk.toString().includes('server ready')) done(server)
    })
    server.on('exit', (code) =>
      fail(new Error(`Production server exited with ${code}.`)),
    )
  })
}

function record(entry: Record<string, unknown>) {
  appendFileSync(
    paths.console,
    JSON.stringify({ at: new Date().toISOString(), ...entry }) + '\n',
  )
}

async function readBody(request: IncomingMessage): Promise<Request> {
  let body = ''
  for await (const chunk of request) body += String(chunk)
  const parsed: unknown = JSON.parse(body)
  if (!isRequest(parsed))
    throw new ControlError('Malformed request.', 'Use control.ts, not curl.')
  return {
    command: parsed.command,
    positionals: parsed.positionals.map(String),
    options: Object.fromEntries(
      Object.entries(parsed.options).filter(
        (entry): entry is [string, string | boolean] =>
          typeof entry[1] === 'string' || typeof entry[1] === 'boolean',
      ),
    ),
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

function isRequest(value: unknown): value is {
  command: string
  positionals: unknown[]
  options: Record<string, unknown>
} {
  return (
    isRecord(value) &&
    typeof value['command'] === 'string' &&
    Array.isArray(value['positionals']) &&
    isRecord(value['options'])
  )
}

async function run(runtime: Runtime, request: Request) {
  const command = commands[request.command]
  if (!command)
    throw new ControlError(
      `Unknown command "${request.command}".`,
      'Run `control.ts help` for the command list.',
    )
  return command(runtime, request)
}

function failure(error: unknown) {
  if (error instanceof ControlError)
    return { ok: false, error: error.message, hint: error.hint }
  const message = error instanceof Error ? error.message : String(error)
  const strict = /strict mode violation: .* resolved to (\d+) elements/.exec(
    message,
  )
  if (/Timeout \d+ms exceeded/.test(message))
    return {
      ok: false,
      error: message.split('\n').slice(0, 3).join(' '),
      hint: 'The target never appeared. Run `snapshot` to see the screen; an active search or the Trash view may hide it.',
    }
  if (strict)
    return {
      ok: false,
      error: `Target matched ${strict[1]} elements.`,
      hint: `Add --nth 0..${Number(strict[1]) - 1}, or use a more specific --name. Run \`snapshot\` to see the candidates.`,
    }
  return {
    ok: false,
    error: message.split('\n').slice(0, 6).join('\n'),
    hint: 'Run `snapshot` to see what is on screen, then retry with a more specific target.',
  }
}

const server = await startServer()
const context = await chromium
  .launchPersistentContext(paths.profile, {
    headless,
    ...(channel === 'chromium' ? {} : { channel }),
    viewport: { width: 1280, height: 800 },
  })
  .catch((error: unknown) => abort(error))
context.setDefaultTimeout(Number(process.env.VERIFY_TIMEOUT_MS ?? 5000))
context.setDefaultNavigationTimeout(30_000)
context.on('console', (message) =>
  record({
    type: message.type(),
    text: message.text(),
    url: message.page()?.url(),
  }),
)
context.on('weberror', (error) =>
  record({ type: 'pageerror', text: error.error().message }),
)
context.on('page', (opened) =>
  opened.on('close', () => record({ type: 'page-closed', text: opened.url() })),
)
context.on('close', () => {
  record({ type: 'browser-closed', text: 'Browser context closed' })
  void shutdown()
})
const dialogs: Runtime['dialogs'] = { answer: 'dismiss', harness: false }
context.on('dialog', (dialog) => {
  // A requested navigation (reload, goto, seed) always proceeds: leaving the
  // page is the command. The policy only answers in-page confirm()/alert().
  const answer =
    dialogs.harness || dialog.type() === 'beforeunload'
      ? 'accept'
      : dialogs.answer
  record({ type: `dialog:${dialog.type()}`, text: dialog.message(), answer })
  void (answer === 'accept' ? dialog.accept() : dialog.dismiss())
})
const runtime: Runtime = {
  dialogs,
  context,
  appUrl,
  awayUrl: `http://127.0.0.1:${awayPort}`,
}
const page = context.pages()[0] ?? (await context.newPage())
page.on('close', () => record({ type: 'page-closed', text: page.url() }))
await page.goto(appUrl).catch((error: unknown) => abort(error))

/** Startup failed: release everything already started, then exit. */
function abort(error: unknown): never {
  console.error(error)
  server.kill('SIGTERM')
  rmSync(paths.profile, { recursive: true, force: true })
  rmSync(paths.builds, { recursive: true, force: true })
  process.exit(1)
}

async function shutdown() {
  await context.close().catch(() => undefined)
  server.kill('SIGTERM')
  rmSync(paths.session, { force: true })
  rmSync(paths.profile, { recursive: true, force: true })
  rmSync(paths.builds, { recursive: true, force: true })
  process.exit(0)
}

async function handle(request: IncomingMessage, response: ServerResponse) {
  let result: unknown
  try {
    const body = await readBody(request)
    if (body.command === 'shutdown') {
      response.end(JSON.stringify({ ok: true, stopped: true }))
      await shutdown()
      return
    }
    result = { ok: true, result: await run(runtime, body) }
  } catch (error) {
    result = failure(error)
  }
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(result))
}

const control = createServer((request, response) => {
  void handle(request, response)
})
control.listen(0, '127.0.0.1', () => {
  const address = control.address()
  if (address === null || typeof address === 'string') return
  const revision = spawn('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: repoRoot,
  })
  let sha = ''
  revision.stdout.on('data', (chunk: Buffer) => (sha += chunk.toString()))
  revision.on('exit', () => {
    const session: Session = {
      pid: process.pid,
      controlPort: address.port,
      appUrl,
      awayUrl: runtime.awayUrl,
      startedAt: process.env.VERIFY_STARTED_AT ?? new Date().toISOString(),
      revision: sha.trim(),
      headless,
      channel,
    }
    writeFileSync(paths.session, JSON.stringify(session, null, 2))
  })
})
for (const signal of ['SIGINT', 'SIGTERM'] as const)
  process.on(signal, () => void shutdown())
