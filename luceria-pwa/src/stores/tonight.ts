import { defineStore } from 'pinia'

export interface Hero {
  name: string
  lede: string
  meta: string[]
  hue: string
  liquid: string
  glow: string
}

export interface AlsoDrink {
  name: string
  status: string
  hue: string
  liquid: string
}

export interface Tab {
  id: string
  label: string
  icon: string
}

export const useTonightStore = defineStore('tonight', {
  state: () => ({
    hero: {
      name: 'Negroni',
      lede: 'Bittersweet and balanced — gin, Campari and sweet vermouth in equal parts. Everything is already in your bar.',
      meta: ['Gin', 'Stirred', '21.6% ABV', '2 min'],
      hue: '#2E1C1D',
      liquid: '#F0A64B',
      glow: 'rgba(208,83,63,.32)',
    } as Hero,
    also: [
      { name: 'Whiskey Sour', status: 'Ready · 4 min', hue: '#2C2419', liquid: '#D9A05B' },
      { name: 'Margarita', status: 'Ready · 3 min', hue: '#2C221F', liquid: '#D9734F' },
      { name: 'Black Russian', status: 'Ready · 1 min', hue: '#1C2128', liquid: '#6F8FB3' },
    ] as AlsoDrink[],
    tabs: [
      {
        id: 'tonight',
        label: 'Tonight',
        icon: '<path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7z"></path>',
      },
      {
        id: 'recipes',
        label: 'Recipes',
        icon: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5v-13z"></path><path d="M8 7h8M8 11h6"></path>',
      },
      {
        id: 'bar',
        label: 'My Bar',
        icon: '<path d="M9 3h6v3l-1 2v11H10V8L9 6V3z"></path><path d="M10 12h4"></path>',
      },
      {
        id: 'list',
        label: 'List',
        icon: '<path d="M4 5h2l2 10h9l2-7H7"></path><circle cx="9.5" cy="19" r="1.2"></circle><circle cx="17" cy="19" r="1.2"></circle>',
      },
      {
        id: 'journal',
        label: 'Journal',
        icon: '<rect x="4" y="5" width="16" height="16" rx="2.5"></rect><path d="M8 3v4M16 3v4M4 10h16"></path><path d="M8 14h4"></path>',
      },
    ] as Tab[],
  }),
})
