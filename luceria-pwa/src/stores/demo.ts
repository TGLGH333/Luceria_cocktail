import { defineStore } from 'pinia'
import { barOrder, initialAutoAdd, initialBar, ingredientBySlug, ingredients } from '../data/ingredients'
import { recipeBySlug, recipes } from '../data/recipes'
import type { Account, JournalEntry, Recipe, Settings, StockLevel } from '../types'

const BAR_KEY = 'luceria.bar.v1'
const JOURNAL_KEY = 'luceria.journal.v1'
const SETTINGS_KEY = 'luceria.settings.v2'
const ACCOUNT_KEY = 'luceria.account.v1'

const defaultSettings: Settings = {
  theme: 'dark',
  units: 'ml',
  defaultServings: 2,
  textScale: 1,
  zeroProof: false,
  showAlcohol: true,
  reduceMotion: false,
  largeTargets: false,
  keepAwake: true,
  autoTimers: true,
  extraTime: false,
  updateBar: true,
  readAloud: false,
  captions: false,
  flash: true,
  oneInstruction: true,
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T
    if (Array.isArray(fallback) || Array.isArray(parsed)) return parsed
    return { ...fallback, ...parsed }
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage can be unavailable in private mode; the demo still runs in memory */
  }
}

function readAccount(): Account | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Account
    return typeof parsed?.email === 'string' ? parsed : null
  } catch {
    return null
  }
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function seedJournal(): JournalEntry[] {
  const now = new Date()
  return [
    {
      id: 'seed-negroni',
      recipeSlug: 'negroni',
      date: toDateKey(now),
      servings: 1,
      rating: 4,
      taste: 'just-right',
      note: 'Just right. A touch less Campari next time.',
      createdAt: now.getTime(),
    },
    {
      id: 'seed-whiskey-sour',
      recipeSlug: 'whiskey-sour',
      date: toDateKey(addDays(now, -1)),
      servings: 2,
      rating: 5,
      taste: 'just-right',
      note: 'Dry shake first for a lovely foam.',
      createdAt: now.getTime() - 86_400_000,
    },
    {
      id: 'seed-margarita',
      recipeSlug: 'margarita',
      date: toDateKey(addDays(now, -3)),
      servings: 1,
      rating: 3,
      taste: 'too-bitter',
      note: 'Needed more lime.',
      createdAt: now.getTime() - 3 * 86_400_000,
    },
  ]
}

function missingRequired(recipe: Recipe, bar: Record<string, StockLevel>) {
  return recipe.ingredients
    .filter((item) => !item.optional)
    .filter((item) => !bar[item.slug] || bar[item.slug] === 'out')
    .map((item) => item.slug)
}

export const useDemoStore = defineStore('demo', {
  state: () => ({
    ingredients,
    recipes,
    bar: readJSON<Record<string, StockLevel>>(BAR_KEY, { ...initialBar }),
    autoAdd: readJSON<Record<string, boolean>>(`${BAR_KEY}.auto`, { ...initialAutoAdd }),
    journal: readJSON<JournalEntry[]>(JOURNAL_KEY, seedJournal()),
    settings: readJSON<Settings>(SETTINGS_KEY, { ...defaultSettings }),
    account: readAccount(),
  }),
  getters: {
    recipeBySlug: () => (slug: string) => recipeBySlug.get(slug),
    ingredientBySlug: () => (slug: string) => ingredientBySlug.get(slug),
    barCount: (state) => Object.keys(state.bar).length,
    barItems: (state) =>
      barOrder
        .filter((slug: string) => Boolean(state.bar[slug]))
        .map((slug: string) => ingredientBySlug.get(slug))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    readyRecipes(state): Recipe[] {
      return state.recipes.filter((recipe) => missingRequired(recipe, state.bar).length === 0)
    },
    almostRecipes(state): Recipe[] {
      return state.recipes.filter((recipe) => missingRequired(recipe, state.bar).length === 1)
    },
    unavailableRecipes(state): Recipe[] {
      return state.recipes.filter((recipe) => missingRequired(recipe, state.bar).length > 1)
    },
    counts(state) {
      return {
        ready: state.recipes.filter((recipe) => missingRequired(recipe, state.bar).length === 0).length,
        almost: state.recipes.filter((recipe) => missingRequired(recipe, state.bar).length === 1).length,
        total: state.recipes.length,
        bar: Object.keys(state.bar).length,
      }
    },
    nextBuy(state): { slug: string; name: string; count: number; recipeNames: string[] } | null {
      const byIngredient = new Map<string, { count: number; recipeNames: string[] }>()
      for (const recipe of this.almostRecipes) {
        const missing = missingRequired(recipe, state.bar)
        const slug = missing[0]
        if (!slug) continue
        const current = byIngredient.get(slug) ?? { count: 0, recipeNames: [] }
        current.count += 1
        current.recipeNames.push(recipe.name)
        byIngredient.set(slug, current)
      }
      const ranked = [...byIngredient.entries()].sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
      if (!ranked.length) return null
      const [slug, value] = ranked[0]
      return {
        slug,
        name: ingredientBySlug.get(slug)?.name ?? slug,
        count: value.count,
        recipeNames: value.recipeNames,
      }
    },
    missingFor: (state) => (recipe: Recipe) => missingRequired(recipe, state.bar),
    usedIn: (state) => (slug: string) => state.recipes.filter((recipe) => recipe.ingredients.some((item) => item.slug === slug)),
    readyWith: (state) => (slug: string) =>
      state.recipes.filter(
        (recipe) =>
          recipe.ingredients.some((item) => item.slug === slug) &&
          missingRequired(recipe, state.bar).length === 0,
      ),
    journalEntries(state): JournalEntry[] {
      return [...state.journal].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    },
    weekStats(state) {
      const now = new Date()
      const monday = new Date(now)
      monday.setHours(0, 0, 0, 0)
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
      const days = Array.from({ length: 7 }, (_, index) => addDays(monday, index))
      const byDay = days.map((date) => {
        const key = toDateKey(date)
        return state.journal
          .filter((entry) => entry.date === key)
          .reduce((total, entry) => total + entry.servings, 0)
      })
      const drinks = byDay.reduce((total, value) => total + value, 0)
      return {
        days: byDay,
        labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        drinks,
        nights: byDay.filter((value) => value > 0).length,
        max: Math.max(1, ...byDay),
      }
    },
  },
  actions: {
    persistBar() {
      writeJSON(BAR_KEY, this.bar)
      writeJSON(`${BAR_KEY}.auto`, this.autoAdd)
    },
    persistJournal() {
      writeJSON(JOURNAL_KEY, this.journal)
    },
    persistSettings() {
      writeJSON(SETTINGS_KEY, this.settings)
    },
    setLevel(slug: string, level: StockLevel) {
      this.bar = { ...this.bar, [slug]: level }
      this.persistBar()
    },
    addToBar(slug: string) {
      this.bar = { ...this.bar, [slug]: 'full' }
      this.autoAdd = { ...this.autoAdd, [slug]: true }
      this.persistBar()
    },
    removeFromBar(slug: string) {
      const next = { ...this.bar }
      delete next[slug]
      this.bar = next
      this.persistBar()
    },
    toggleAutoAdd(slug: string) {
      this.autoAdd = { ...this.autoAdd, [slug]: !this.autoAdd[slug] }
      this.persistBar()
    },
    addJournal(entry: Omit<JournalEntry, 'id' | 'createdAt'>) {
      const id = globalThis.crypto?.randomUUID?.() ?? `journal-${Date.now()}`
      this.journal = [{ ...entry, id, createdAt: Date.now() }, ...this.journal]
      this.persistJournal()
      return id
    },
    removeJournal(id: string) {
      this.journal = this.journal.filter((entry) => entry.id !== id)
      this.persistJournal()
    },
    updateSettings(patch: Partial<Settings>) {
      this.settings = { ...this.settings, ...patch }
      this.persistSettings()
    },
    signIn(email: string) {
      const clean = email.trim().toLowerCase()
      this.account = { email: clean, name: clean.split('@')[0] }
      writeJSON(ACCOUNT_KEY, this.account)
    },
    signOut() {
      this.account = null
      writeJSON(ACCOUNT_KEY, null)
    },
    resetDemo() {
      this.bar = { ...initialBar }
      this.autoAdd = { ...initialAutoAdd }
      this.journal = seedJournal()
      this.settings = { ...defaultSettings }
      this.persistBar()
      this.persistJournal()
      this.persistSettings()
    },
  },
})
