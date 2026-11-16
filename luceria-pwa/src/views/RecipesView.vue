<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import DrinkArt from '../components/DrinkArt.vue'
import { useDemoStore } from '../stores/demo'

const router = useRouter()
const store = useDemoStore()

const search = ref('')
const filter = ref<'all' | 'ready' | 'almost'>('all')

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  return store.recipes.filter((recipe) => {
    if (filter.value === 'ready' && !store.readyRecipes.some((item) => item.slug === recipe.slug)) return false
    if (filter.value === 'almost' && !store.almostRecipes.some((item) => item.slug === recipe.slug)) return false
    if (!query) return true
    return (
      recipe.name.toLowerCase().includes(query) ||
      recipe.baseSpirit.toLowerCase().includes(query) ||
      recipe.ingredients.some((item) => item.slug.includes(query))
    )
  })
})

function statusFor(slug: string) {
  if (store.readyRecipes.some((recipe) => recipe.slug === slug)) {
    return { label: `Ready · ${store.recipeBySlug(slug)?.minutes ?? 2} min`, ready: true }
  }
  if (store.almostRecipes.some((recipe) => recipe.slug === slug)) {
    const missing = store.missingFor(store.recipeBySlug(slug)!) [0]
    return { label: `Need ${store.ingredientBySlug(missing)?.name ?? missing}`, ready: false }
  }
  const recipe = store.recipeBySlug(slug)!
  const missing = store.missingFor(recipe)[0]
  return { label: `Need ${store.ingredientBySlug(missing)?.name ?? missing}`, ready: false }
}
</script>

<template>
  <div class="recipes-page">
    <header class="page-head">
      <div>
        <h1>Recipes</h1>
        <p class="sub">{{ store.counts.total }} classics · {{ store.counts.ready }} you can make now</p>
      </div>
      <label class="search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4" />
        </svg>
        <input v-model="search" type="search" placeholder="Search recipes or ingredients" />
      </label>
    </header>

    <div class="filters">
      <button class="chip" :class="{ active: filter === 'ready' }" type="button" @click="filter = filter === 'ready' ? 'all' : 'ready'">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12.5l4 4L19 6.5" />
        </svg>
        I can make
      </button>
      <button class="chip" :class="{ active: filter === 'almost' }" type="button" @click="filter = filter === 'almost' ? 'all' : 'almost'">
        Almost · {{ store.counts.almost }}
      </button>
      <span class="chip quiet">Gin</span>
      <span class="chip quiet">Shaken</span>
      <span class="chip quiet">Under 3 min</span>
      <button class="filters-btn" type="button">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
          <path d="M4 7h16M7 12h10M10 17h4" />
        </svg>
        Filters
      </button>
    </div>

    <div v-if="filtered.length" class="grid">
      <button v-for="recipe in filtered" :key="recipe.slug" class="tile" type="button" @click="router.push(`/recipe/${recipe.slug}`)">
        <span class="art" :style="{ background: `radial-gradient(circle at 50% 42%, ${recipe.hue} 0%, var(--fill-1) 78%)` }">
          <DrinkArt :recipe="recipe" mini />
        </span>
        <span class="tile-copy">
          <span class="tile-name">{{ recipe.name }}</span>
          <span class="tile-status" :class="{ ready: statusFor(recipe.slug).ready }">
            <svg v-if="statusFor(recipe.slug).ready" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12.5l2.5 2.5L16 9.5" />
            </svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16.5v.2" />
            </svg>
            {{ statusFor(recipe.slug).label }}
          </span>
        </span>
      </button>
    </div>

    <div v-else class="empty">
      <div class="empty-icon">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4" />
        </svg>
      </div>
      <h2>No matches for “{{ search }}”</h2>
      <p>Check the spelling, or search by an ingredient you have.</p>
    </div>
  </div>
</template>

<style scoped>
.recipes-page {
  height: 100%;
  overflow-y: auto;
  padding: 42px 40px 120px;
  background: var(--bg-base);
  color: var(--text-primary);
  scrollbar-width: none;
}

.recipes-page::-webkit-scrollbar {
  display: none;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

h1 {
  margin: 0;
  font-size: calc(40px * var(--text-scale, 1));
  line-height: calc(46px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: -1.2px;
}

.sub {
  margin: 5px 0 0;
  font-size: calc(14px * var(--text-scale, 1));
  line-height: calc(20px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.search {
  width: 330px;
  height: 52px;
  padding: 0 18px;
  border: 1px solid var(--line-subtle);
  border-radius: 999px;
  background: var(--fill-2);
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-tertiary);
}

.search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: calc(15px * var(--text-scale, 1));
}

.search input::placeholder {
  color: var(--text-tertiary);
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 26px 0 22px;
}

.chip {
  height: 38px;
  padding: 0 17px;
  border: 1px solid var(--line-subtle);
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
}

.chip.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.chip.quiet {
  cursor: default;
  color: var(--text-secondary);
}

.filters-btn {
  margin-left: auto;
  height: 38px;
  padding: 0 16px;
  border: 1px solid var(--line-subtle);
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 500;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px 16px;
  align-items: start;
}

.tile {
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.art {
  display: block;
  width: 100%;
  aspect-ratio: 266 / 200;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.art :deep(.drink-art) {
  width: auto;
  height: 148px;
  margin: 26px auto 0;
}

.art :deep(.glass.mini) {
  width: 92px;
  height: 112px;
  margin: 44px auto 0;
}

.tile-copy {
  display: block;
  padding-top: 11px;
}

.tile-name {
  display: block;
  font-size: calc(17px * var(--text-scale, 1));
  line-height: calc(22px * var(--text-scale, 1));
  font-weight: 600;
  letter-spacing: -0.2px;
}

.tile-status {
  margin-top: 3px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: calc(13px * var(--text-scale, 1));
  line-height: calc(18px * var(--text-scale, 1));
  color: var(--status-missing);
}

.tile-status.ready {
  color: var(--text-secondary);
}

.empty {
  padding-top: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  background: var(--fill-1);
  color: var(--text-tertiary);
  display: grid;
  place-items: center;
}

.empty h2 {
  margin: 26px 0 8px;
  font-size: calc(30px * var(--text-scale, 1));
  line-height: calc(36px * var(--text-scale, 1));
  letter-spacing: -0.6px;
}

.empty p {
  margin: 0;
  color: var(--text-secondary);
  font-size: calc(16px * var(--text-scale, 1));
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

[data-text-large='true'] .page-head {
  flex-direction: column;
  gap: 16px;
}

[data-text-large='true'] .search {
  width: 100%;
  max-width: none;
  height: auto;
  min-height: 60px;
}

[data-text-large='true'] .filters {
  flex-wrap: wrap;
}

[data-text-large='true'] .grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

[data-text-large='true'] .art {
  aspect-ratio: 16 / 7;
}

[data-text-large='true'] .art :deep(.glass.mini) {
  margin-top: 24px;
}

[data-text-large='true'] .tile {
  height: auto;
}
</style>
