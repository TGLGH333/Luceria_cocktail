/**
 * `?demo=reset` — wipe the demo state before the app boots.
 *
 * The prototype keeps everything in localStorage: the bar (and its auto-add
 * flags), the journal, settings, and per-recipe mixing progress. Opening the
 * installed web app with `?demo=reset` clears those keys before Pinia reads
 * them, so the app comes back with the seeded demo data: the original bar,
 * three sample journal entries and default settings.
 *
 * Reaching it from an installed home-screen app is impossible — standalone mode
 * has no address bar — so open the URL in Safari once, or add `?demo=reset` to
 * the address after the host name and reload the tab.
 */
const STORAGE_PREFIXES = ['luceria.bar.', 'luceria.journal.', 'luceria.settings.', 'luceria.mix.']
const TOAST_ID = 'luceria-demo-reset'

function clearDemoStorage(): number {
  const doomed: string[] = []
  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (key !== null && STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) doomed.push(key)
    }
    for (const key of doomed) window.localStorage.removeItem(key)
  } catch {
    return 0
  }
  return doomed.length
}

function showToast(message: string, ok: boolean): void {
  if (!document.body) return
  document.getElementById(TOAST_ID)?.remove()

  const toast = document.createElement('div')
  toast.id = TOAST_ID
  toast.textContent = message
  toast.setAttribute(
    'style',
    [
      'position:fixed',
      'left:50%',
      'bottom:28px',
      'transform:translateX(-50%)',
      'z-index:2147483647',
      'padding:10px 18px',
      'border-radius:999px',
      'font:500 13px/1.2 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif',
      `color:${ok ? '#121110' : '#F4F0E9'}`,
      `background:${ok ? '#C9A227' : 'rgba(244,240,233,.16)'}`,
      'box-shadow:0 10px 30px rgba(0,0,0,.45)',
      'pointer-events:none',
      'opacity:0',
      'transition:opacity .18s ease',
    ].join(';'),
  )
  document.body.appendChild(toast)
  requestAnimationFrame(() => {
    toast.style.opacity = '1'
  })
  window.setTimeout(() => {
    toast.style.opacity = '0'
    window.setTimeout(() => toast.remove(), 220)
  }, 2200)
}

export function applyDemoReset(): void {
  const url = new URL(window.location.href)
  if (url.searchParams.get('demo') !== 'reset') return

  const cleared = clearDemoStorage()
  url.searchParams.delete('demo')
  url.hash = url.hash || '#/tonight'
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)

  showToast(
    cleared === 0 ? 'Demo state is already fresh' : `Demo state restored · ${cleared} keys cleared`,
    cleared > 0,
  )
}
