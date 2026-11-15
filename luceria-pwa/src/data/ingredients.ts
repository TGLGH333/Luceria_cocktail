import type { Ingredient, StockLevel } from '../types'

export const ingredients: Ingredient[] = [
  { slug: 'gin', name: 'Gin', category: 'spirit', abv: 40, note: 'London dry gin' },
  { slug: 'bourbon', name: 'Bourbon', category: 'spirit', abv: 40, note: 'Kentucky straight bourbon' },
  { slug: 'vodka', name: 'Vodka', category: 'spirit', abv: 40, note: 'Neutral grain vodka' },
  { slug: 'tequila', name: 'Tequila', category: 'spirit', abv: 38, note: 'Reposado tequila' },
  { slug: 'light-rum', name: 'Light rum', category: 'spirit', abv: 40, note: 'Light gold rum' },
  { slug: 'campari', name: 'Campari', category: 'liqueur', abv: 25, note: 'Italian red bitter liqueur · 25% ABV' },
  { slug: 'sweet-vermouth', name: 'Sweet vermouth', category: 'liqueur', abv: 18, note: 'Rosso vermouth' },
  { slug: 'cointreau', name: 'Cointreau', category: 'liqueur', abv: 40, note: 'Orange liqueur' },
  { slug: 'coffee-liqueur', name: 'Coffee liqueur', category: 'liqueur', abv: 20, note: 'Coffee liqueur' },
  { slug: 'angostura', name: 'Angostura', category: 'bitters', abv: 44.7, note: 'Aromatic bitters' },
  { slug: 'lemons', name: 'Lemons', category: 'fresh', note: 'Fresh lemons' },
  { slug: 'limes', name: 'Limes', category: 'fresh', note: 'Fresh limes' },
  { slug: 'sugar-syrup', name: 'Sugar syrup', category: 'mixer', note: 'Rich syrup, 2:1' },
  { slug: 'soda-water', name: 'Soda water', category: 'mixer', note: 'Chilled soda water' },
  { slug: 'fresh-mint', name: 'Fresh mint', category: 'fresh', note: 'Fresh mint leaves' },
  { slug: 'orange-zest', name: 'Orange', category: 'fresh', note: 'For the zest' },
  { slug: 'agave', name: 'Agave', category: 'mixer', note: 'Agave syrup' },
  { slug: 'cranberry', name: 'Cranberry juice', category: 'mixer', note: 'Unsweetened cranberry juice' },
  { slug: 'egg-white', name: 'Egg white', category: 'fresh', note: 'Fresh egg white' },
]

export const ingredientBySlug = new Map(ingredients.map((ingredient) => [ingredient.slug, ingredient]))

export const barOrder: string[] = [
  'gin',
  'bourbon',
  'vodka',
  'tequila',
  'light-rum',
  'campari',
  'sweet-vermouth',
  'cointreau',
  'coffee-liqueur',
  'angostura',
  'lemons',
  'limes',
  'sugar-syrup',
  'soda-water',
  'fresh-mint',
]

export const initialBar: Record<string, StockLevel> = {
  ...Object.fromEntries(barOrder.map((slug) => [slug, 'full' as StockLevel])),
  'light-rum': 'low',
  campari: 'low',
  'fresh-mint': 'out',
}

export const initialAutoAdd: Record<string, boolean> = Object.fromEntries(
  barOrder.map((slug) => [slug, true]),
)
