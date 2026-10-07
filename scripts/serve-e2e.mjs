import { spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, extname, sep } from 'node:path'

const versions = ['1', '2']
const builds = new Map()
for (const version of versions) {
  const directory = resolve('.test-builds', `e2e-${version}`)
  const build = spawnSync(
    'pnpm',
    [
      '--filter',
      '@starter/playground',
      'exec',
      'vite',
      'build',
      '--outDir',
      directory,
      '--emptyOutDir',
    ],
    {
      stdio: 'inherit',
      env: { ...process.env, VITE_APP_VERSION: version },
    },
  )
  if (build.status !== 0) process.exit(build.status ?? 1)
  builds.set(version, directory)
}
let active = '1'
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
}
const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1:42785')
  if (request.method === 'GET' && url.pathname === '/__test/away') {
    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.end(
      '<!doctype html><title>Another page</title><h1>Another page</h1>',
    )
    return
  }
  if (request.method === 'POST' && url.pathname === '/__test/version') {
    const version = url.searchParams.get('value')
    if (!builds.has(version)) {
      response.writeHead(400)
      response.end()
      return
    }
    active = version
    response.end(active)
    return
  }
  if (request.method !== 'GET') {
    response.writeHead(405)
    response.end()
    return
  }
  const directory = builds.get(active)
  let file
  try {
    file = resolve(directory, '.' + decodeURIComponent(url.pathname))
  } catch {
    response.writeHead(400)
    response.end()
    return
  }
  if (file !== directory && !file.startsWith(directory + sep)) {
    response.writeHead(403)
    response.end()
    return
  }
  if (file === directory || !extname(file))
    file = resolve(directory, 'index.html')
  if (!existsSync(file)) {
    response.writeHead(404)
    response.end()
    return
  }
  response.writeHead(200, {
    'Content-Type': types[extname(file)] ?? 'application/octet-stream',
  })
  response.end(readFileSync(file))
})
const awayServer = createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' })
  response.end(
    '<!doctype html><title>Another page</title><h1>Another page</h1>',
  )
})
awayServer.listen(42786, '127.0.0.1')
server.listen(42785, '127.0.0.1', () =>
  console.log('Two-version production PWA server ready'),
)
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () =>
    server.close(() => awayServer.close(() => process.exit(0))),
  )
