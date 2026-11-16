export type StockLevel = 'full' | 'half' | 'low' | 'out'
export type Unit = 'ml' | 'oz' | 'cl'
export type Theme = 'auto' | 'dark' | 'light' | 'hc'
export type Method = 'Stirred' | 'Shaken' | 'Built' | 'Blended'

export interface Ingredient {
  slug: string
  name: string
  category: 'spirit' | 'liqueur' | 'fresh' | 'mixer' | 'bitters'
  abv?: number
  note?: string
}

export interface RecipeIngredient {
  slug: string
  amount: number
  unit: 'ml' | 'dash' | 'leaf' | 'piece'
  optional?: boolean
  prep?: string
}

export interface RecipeStepPart {
  title: string
  instruction: string
  duration: number
  timer?: number
}

export interface RecipeStep {
  title: string
  instruction: string
  duration: number
  timer?: number
  parts?: RecipeStepPart[]
}

export interface Recipe {
  slug: string
  name: string
  description: string
  baseSpirit: string
  method: Method
  glassware: string
  ice: string
  garnish: string
  abv: number
  minutes: number
  rating: number
  reviews: number
  flavours: string[]
  hue: string
  hueLight: string
  liquid: string
  glow: string
  art?: string
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  equipment: string[]
}

export interface JournalEntry {
  id: string
  recipeSlug: string
  date: string
  servings: number
  rating: number
  taste?: 'too-bitter' | 'just-right' | 'too-sweet'
  note?: string
  createdAt: number
}

export interface Settings {
  theme: Theme
  units: Unit
  defaultServings: number
  textScale: number
  zeroProof: boolean
  showAlcohol: boolean
  reduceMotion: boolean
  largeTargets: boolean
  keepAwake: boolean
  autoTimers: boolean
  extraTime: boolean
  updateBar: boolean
  readAloud: boolean
  captions: boolean
  flash: boolean
  oneInstruction: boolean
}

export const STOCK_LABELS: Record<StockLevel, string> = {
  full: 'Full',
  half: 'Half',
  low: 'Low',
  out: 'Out',
}
