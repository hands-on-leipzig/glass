#!/usr/bin/env node
/**
 * Copy design fonts to public/font/ in the consuming app.
 * Run from app root: node node_modules/@hands-on/design/scripts/copy-fonts.mjs
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const fontsSource = join(scriptDir, '..', 'fonts')
const targetDir = resolve(process.cwd(), 'public', 'font')

if (!existsSync(fontsSource)) {
  console.error('Font source not found:', fontsSource)
  process.exit(1)
}

mkdirSync(targetDir, { recursive: true })

for (const name of ['Uniform-Regular.otf', 'Uniform-Bold.otf', 'Poppins-Regular.ttf']) {
  cpSync(join(fontsSource, name), join(targetDir, name))
}

console.log('Copied design fonts to', targetDir)
