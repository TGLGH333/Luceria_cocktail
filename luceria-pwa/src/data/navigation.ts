export interface Tab {
  id: string
  label: string
  icon: string
  path: string
}

export const tabs: Tab[] = [
  {
    id: 'tonight',
    label: 'Tonight',
    path: '/tonight',
    icon: '<path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7z"></path>',
  },
  {
    id: 'recipes',
    label: 'Recipes',
    path: '/recipes',
    icon: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5v-13z"></path><path d="M8 7h8M8 11h6"></path>',
  },
  {
    id: 'bar',
    label: 'My Bar',
    path: '/bar',
    icon: '<path d="M9 3h6v3l-1 2v11H10V8L9 6V3z"></path><path d="M10 12h4"></path>',
  },
  {
    id: 'list',
    label: 'List',
    path: '/list',
    icon: '<path d="M4 5h2l2 10h9l2-7H7"></path><circle cx="9.5" cy="19" r="1.2"></circle><circle cx="17" cy="19" r="1.2"></circle>',
  },
  {
    id: 'journal',
    label: 'Journal',
    path: '/journal',
    icon: '<rect x="4" y="5" width="16" height="16" rx="2.5"></rect><path d="M8 3v4M16 3v4M4 10h16"></path><path d="M8 14h4"></path>',
  },
]
