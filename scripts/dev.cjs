#!/usr/bin/env node
'use strict'

// Levanta backend y frontend a la vez (invocado por `make start`).
//
// No usamos un trap de shell + `kill 0` para esto: en pruebas reales sobre
// Ubuntu 24.04 esa combinación (trap sobre EXIT/INT/TERM que se auto-envía
// una señal a todo el grupo, con jobs en segundo plano activos) provoca un
// segfault reproducible tanto en dash como en bash. Node ya es una
// dependencia obligatoria del proyecto, así que delegamos el manejo de
// procesos a `child_process` con `detached: true`, que crea un grupo de
// procesos propio por cada hijo (backend/frontend con toda su descendencia)
// y permite matarlo con `process.kill(-pid)` sin tocar el proceso actual.

const { spawn } = require('node:child_process')
const path = require('node:path')

const root = path.resolve(__dirname, '..')

let shuttingDown = false

function run(name, dir) {
  const child = spawn('npm', ['run', 'dev'], {
    cwd: path.join(root, dir),
    stdio: 'inherit',
    detached: true,
  })
  child.on('exit', (code, signal) => {
    if (!shuttingDown) {
      const cause = signal ? `señal ${signal}` : `código ${code}`
      console.error(`\n⚠️  ${name} se detuvo inesperadamente (${cause}).`)
    }
  })
  return child
}

const backend = run('backend', 'backend')
const frontend = run('frontend', 'frontend')

function killGroup(child, signal) {
  try {
    process.kill(-child.pid, signal)
  } catch {
    // el grupo ya no existe
  }
}

function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  killGroup(backend, 'SIGTERM')
  killGroup(frontend, 'SIGTERM')
  // Algunos watchers de desarrollo (p. ej. `node ace serve --hmr`) no salen
  // solo porque muera su proceso de trabajo interno: forzamos con SIGKILL
  // tras un margen breve para no dejar nada colgado.
  setTimeout(() => {
    killGroup(backend, 'SIGKILL')
    killGroup(frontend, 'SIGKILL')
    process.exit(0)
  }, 1500)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

Promise.all([
  new Promise((resolve) => backend.on('exit', resolve)),
  new Promise((resolve) => frontend.on('exit', resolve)),
]).then(() => {
  if (!shuttingDown) process.exit(0)
})
