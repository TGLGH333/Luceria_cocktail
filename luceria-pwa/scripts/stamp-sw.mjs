/*
 * Renders `src/sw-template.js` to `dist/sw.js` after `vite build`.
 *
 * The service worker is cache-first, so its cache name has to change on every
 * build; otherwise an app already installed on the iPad keeps replaying the
 * shell it cached on its first visit. The placeholder `__BUILD__` becomes
 * `<package version>-<UTC build stamp>`, which also makes the script byte-diff
 * so the browser re-installs the worker.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const placeholder = '__BUILD__'

async function main() {
  const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  const template = await readFile(join(root, 'src', 'sw-template.js'), 'utf8')

  if (!template.includes(placeholder)) {
    throw new Error(`src/sw-template.js is missing the ${placeholder} placeholder`)
  }

  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
  const build = `${pkg.version}-${stamp}`
  const output = join(root, 'dist', 'sw.js')

  await mkdir(join(root, 'dist'), { recursive: true })
  await writeFile(output, template.replaceAll(placeholder, build))
  console.log(`[stamp-sw] dist/sw.js written with cache name luceria-shell-${build}`)
}

main().catch((error) => {
  console.error(`[stamp-sw] failed: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
