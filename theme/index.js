import { ref } from 'vue'

const THEME_KEY = 'hands-on-theme'
const LEGACY_THEME_KEYS = ['node-theme']

/** @type {import('vue').Ref<'light' | 'dark'>} */
export const theme = ref('light')

function applyTheme(themeValue) {
  const root = document.documentElement
  if (themeValue === 'dark') {
    root.setAttribute('data-theme', 'dark')
  } else {
    root.setAttribute('data-theme', 'light')
  }
}

function readStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved

    for (const legacyKey of LEGACY_THEME_KEYS) {
      const legacy = localStorage.getItem(legacyKey)
      if (legacy === 'dark' || legacy === 'light') {
        localStorage.setItem(THEME_KEY, legacy)
        return legacy
      }
    }
  } catch (_) {}

  return null
}

/**
 * Get the current theme.
 * @returns {'light' | 'dark'}
 */
export function getTheme() {
  return theme.value
}

/**
 * Set theme and persist to localStorage.
 * @param {'light' | 'dark'} newTheme
 */
export function setTheme(newTheme) {
  if (newTheme !== 'light' && newTheme !== 'dark') return
  theme.value = newTheme
  applyTheme(newTheme)
  try {
    localStorage.setItem(THEME_KEY, newTheme)
  } catch (_) {}
}

/**
 * Toggle between light and dark.
 * @returns {'light' | 'dark'}
 */
export function toggleTheme() {
  const next = theme.value === 'dark' ? 'light' : 'dark'
  setTheme(next)
  return next
}

/**
 * Initialize theme from localStorage and apply to document.
 * Call once before mounting the app to avoid flash.
 */
export function initTheme() {
  const saved = readStoredTheme()
  if (saved) theme.value = saved
  applyTheme(theme.value)
}
