<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import DrinkArt from '../components/DrinkArt.vue'
import { useDemoStore } from '../stores/demo'
import type { Ingredient, Recipe } from '../types'

const router = useRouter()
const store = useDemoStore()

const checked = ref<Set<string>>(new Set())
const hidden = ref<Set<string>>(new Set())
const toast = ref('')
const undoVisible = ref(false)
const clearedSlugs = ref<string[]>([])
let toastTimer: number | undefined

function missingRequired(recipe: Recipe, extra: Record<string, string> = {}) {
  return recipe.ingredients
    .filter((item) => !item.optional)
    .filter((item) => !extra[item.slug] && (!store.bar[item.slug] || store.bar[item.slug] === 'out'))
    .map((item) => item.slug)
}

const needs = computed(() => {
  const slugs = new Set<string>()
  for (const recipe of [...store.almostRecipes, ...store.unavailableRecipes]) {
    for (const slug of store.missingFor(recipe)) slugs.add(slug)
  }
  return [...slugs].filter((slug) => !hidden.value.has(slug))
})

const readyNow = computed(() => new Set(store.readyRecipes.map((recipe) => recipe.slug)))

const items = computed(() =>
  needs.value
    .map((slug) => store.ingredientBySlug(slug))
    .filter((item): item is Ingredient => Boolean(item))
    .map((ingredient) => ({
      ingredient,
      section:
        ingredient.category === 'fresh'
          ? 'Produce'
          : ingredient.category === 'spirit'
            ? 'Bottles'
            : 'Bottles & mixers',
      unlocks: store.recipes.filter(
        (recipe) =>
          !readyNow.value.has(recipe.slug) &&
          missingRequired(recipe, { [ingredient.slug]: 'full' }).length === 0,
      ).length,
      reason:
        store.recipes.find((recipe) => store.missingFor(recipe).includes(ingredient.slug))?.name ?? 'Running low',
    })),
)

const sections = computed(() => {
  const order = ['Produce', 'Bottles & mixers', 'Bottles']
  return order
    .map((name) => ({ name, items: items.value.filter((item) => item.section === name) }))
    .filter((section) => section.items.length)
})

const unlockedRecipes = computed(() => {
  const extra = Object.fromEntries(items.value.map((item) => [item.ingredient.slug, 'full']))
  return store.recipes.filter(
    (recipe) => !readyNow.value.has(recipe.slug) && missingRequired(recipe, extra).length === 0,
  )
})

function toggle(slug: string) {
  const next = new Set(checked.value)
  if (next.has(slug)) next.delete(slug)
  else next.add(slug)
  checked.value = next
}

function clearChecked() {
  if (!checked.value.size) return
  const nextHidden = new Set(hidden.value)
  for (const slug of checked.value) nextHidden.add(slug)
  clearedSlugs.value = [...checked.value]
  hidden.value = nextHidden
  checked.value = new Set()
  toast.value = 'Checked items cleared'
  undoVisible.value = true
  if (toastTimer) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
    undoVisible.value = false
    clearedSlugs.value = []
  }, 4000)
}

function undoClear() {
  const nextHidden = new Set(hidden.value)
  for (const slug of clearedSlugs.value) nextHidden.delete(slug)
  hidden.value = nextHidden
  clearedSlugs.value = []
  toast.value = 'Restored to your list'
  undoVisible.value = false
  if (toastTimer) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 1800)
}

function showToast(message: string) {
  if (toastTimer) window.clearTimeout(toastTimer)
  undoVisible.value = false
  clearedSlugs.value = []
  toast.value = message
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2200)
}

onBeforeUnmount(() => {
  if (toastTimer) window.clearTimeout(toastTimer)
})
</script>

<template>
  <div class="list-page">
    <header class="page-head">
      <div>
        <h1>Shopping list</h1>
        <p class="sub">{{ items.length }} items · unlocks {{ unlockedRecipes.length }} cocktails</p>
      </div>
      <div class="head-actions">
        <button class="ghost" type="button" @click="showToast('Share link is coming next.')">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="2.5" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path d="M8.2 10.8l7.6-4.3M8.2 13.2l7.6 4.3" />
          </svg>
          Share
        </button>
        <button class="primary" type="button" @click="showToast('Add an item from a recipe or your bar.')">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add item
        </button>
      </div>
    </header>

    <div v-if="items.length" class="layout">
      <section class="sections">
        <div v-for="section in sections" :key="section.name" class="section">
          <p class="section-title">{{ section.name }}</p>
          <div class="rows">
            <div v-for="item in section.items" :key="item.ingredient.slug" class="row">
              <button class="check" :class="{ on: checked.has(item.ingredient.slug) }" type="button" :aria-label="`Mark ${item.ingredient.name} bought`" @click="toggle(item.ingredient.slug)">
                <svg v-if="checked.has(item.ingredient.slug)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4 4L19 6.5" />
                </svg>
              </button>
              <span class="row-copy">
                <strong>{{ item.ingredient.name }}</strong>
                <span>For {{ item.reason }}</span>
              </span>
              <span class="unlock">{{ item.unlocks }} cocktail{{ item.unlocks === 1 ? '' : 's' }}</span>
              <button class="more" type="button" aria-label="More options">⋯</button>
            </div>
          </div>
        </div>
      </section>

      <aside class="aside">
        <p class="aside-label">This list unlocks</p>
        <p class="unlock-big">{{ unlockedRecipes.length }} cocktails</p>
        <div class="unlock-list">
          <button v-for="recipe in unlockedRecipes.slice(0, 3)" :key="recipe.slug" class="unlock-row" type="button" @click="router.push(`/recipe/${recipe.slug}`)">
            <span class="unlock-art" :style="{ background: `radial-gradient(circle at 50% 40%, ${recipe.hue} 0%, var(--fill-1) 78%)` }">
              <DrinkArt :recipe="recipe" mini />
            </span>
            <span>{{ recipe.name }}</span>
          </button>
          <p v-if="unlockedRecipes.length > 3" class="more-count">+{{ unlockedRecipes.length - 3 }} more</p>
        </div>
        <button class="clear" type="button" :disabled="!checked.size" @click="clearChecked">Clear checked items</button>
      </aside>
    </div>

    <div v-else class="empty">
      <div class="empty-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 5h2l2 10h9l2-7H7" />
          <circle cx="9.5" cy="19" r="1.2" />
          <circle cx="17" cy="19" r="1.2" />
        </svg>
      </div>
      <h2>Nothing to buy</h2>
      <p>When a recipe needs something you don’t have, tap “Add to list”. It shows up here, grouped by aisle.</p>
      <button type="button" @click="router.push('/bar')">See what one bottle unlocks</button>
    </div>

    <Transition name="toast">
      <div v-if="toast" class="toast" role="status" aria-live="polite">
        <span>{{ toast }}</span>
        <button v-if="undoVisible" type="button" @click="undoClear">Undo</button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.list-page {
  position: relative;
  height: 100%;
  overflow-y: auto;
  padding: 42px 40px 120px;
  background: var(--bg-base);
  color: var(--text-primary);
  scrollbar-width: none;
}

.list-page::-webkit-scrollbar {
  display: none;
}

.page-head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

h1 {
  margin: 0;
  font-size: calc(40px * var(--text-scale, 1));
  line-height: calc(46px * var(--text-scale, 1));
  letter-spacing: -1.2px;
}

.sub {
  margin: 5px 0 0;
  font-size: calc(14px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.head-actions {
  display: flex;
  gap: 10px;
}

.ghost,
.primary {
  height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.ghost {
  background: var(--fill-2);
  color: var(--text-primary);
}

.primary {
  background: var(--accent);
  color: var(--text-on-accent);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 24px;
  margin-top: 28px;
}

.section + .section {
  margin-top: 20px;
}

.section-title {
  margin: 0 0 8px;
  font-size: calc(12px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.rows {
  border-radius: 16px;
  overflow: hidden;
  background: var(--fill-2);
}

.row {
  min-height: 64px;
  padding: 10px 18px;
  display: flex;
  align-items: center;
  gap: 13px;
}

.row + .row {
  border-top: 1px solid var(--line-subtle);
}

.check {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  border: 1.5px solid var(--line-strong);
  border-radius: 50%;
  background: transparent;
  color: var(--bg-base);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.check.on {
  border-color: var(--status-ready);
  background: var(--status-ready);
}

.row-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.row-copy strong {
  font-size: calc(16px * var(--text-scale, 1));
  line-height: calc(21px * var(--text-scale, 1));
  font-weight: 500;
}

.row-copy span {
  font-size: calc(12px * var(--text-scale, 1));
  line-height: calc(17px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.unlock {
  font-size: calc(11px * var(--text-scale, 1));
  color: var(--text-tertiary);
}

.more {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-tertiary);
  font-size: calc(18px * var(--text-scale, 1));
  cursor: pointer;
}

.aside {
  padding: 24px;
  border: 1px solid var(--line-subtle);
  border-radius: 20px;
  background: var(--fill-2);
  height: fit-content;
}

.aside-label {
  margin: 0;
  font-size: calc(12px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.unlock-big {
  margin: 7px 0 18px;
  font-size: calc(34px * var(--text-scale, 1));
  line-height: calc(38px * var(--text-scale, 1));
  font-weight: 600;
  letter-spacing: -1px;
}

.unlock-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.unlock-row {
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.unlock-art {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.unlock-art :deep(.glass.mini) {
  width: 24px;
  height: 30px;
}

.more-count {
  margin: 2px 0 0;
  font-size: calc(12px * var(--text-scale, 1));
  color: var(--text-tertiary);
}

.clear {
  margin-top: 22px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font-size: calc(13px * var(--text-scale, 1));
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.empty {
  padding-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon {
  width: 116px;
  height: 116px;
  border-radius: 50%;
  background: var(--fill-2);
  color: var(--accent);
  display: grid;
  place-items: center;
}

.empty h2 {
  margin: 26px 0 10px;
  font-size: calc(38px * var(--text-scale, 1));
  line-height: calc(44px * var(--text-scale, 1));
  letter-spacing: -1px;
}

.empty p {
  margin: 0;
  max-width: 430px;
  font-size: calc(15px * var(--text-scale, 1));
  line-height: calc(22px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.empty button {
  margin-top: 22px;
  height: 52px;
  padding: 0 24px;
  border: 0;
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-primary);
  font-size: calc(15px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 112px;
  z-index: 30;
  transform: translateX(-50%);
  max-width: calc(100% - 80px);
  padding: 12px 20px;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--text-on-accent);
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 600;
}

.toast button {
  min-height: 44px;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

[data-text-large='true'] .page-head {
  flex-direction: column;
  gap: 16px;
}

[data-text-large='true'] .head-actions {
  flex-wrap: wrap;
}

[data-text-large='true'] .layout {
  grid-template-columns: minmax(0, 1fr);
}

[data-text-large='true'] .row {
  min-height: 0;
  padding-block: 16px;
  flex-wrap: wrap;
  row-gap: 8px;
}

[data-text-large='true'] .row-copy {
  flex: 1 1 220px;
}

[data-text-large='true'] .unlock {
  width: 100%;
  padding-left: 37px;
}

[data-text-large='true'] .more {
  display: none;
}
</style>
