<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import DrinkArt from '../components/DrinkArt.vue'
import { useDemoStore } from '../stores/demo'
import { STOCK_LABELS, type StockLevel } from '../types'

const router = useRouter()
const store = useDemoStore()

const selectedSlug = ref('')
const addOpen = ref(false)
const addSearch = ref('')
const toast = ref('')
let toastTimer: number | undefined

const filters = ['all', 'spirits', 'liqueurs', 'fresh', 'low'] as const
const filter = ref<(typeof filters)[number]>('all')

const selected = computed(() => (selectedSlug.value ? store.ingredientBySlug(selectedSlug.value) : undefined))
const selectedLevel = computed<StockLevel>(() => (selectedSlug.value ? store.bar[selectedSlug.value] ?? 'out' : 'out'))
const usedInSelected = computed(() => (selectedSlug.value ? store.usedIn(selectedSlug.value) : []))
const readyWithSelected = computed(() => (selectedSlug.value ? store.readyWith(selectedSlug.value) : []))
const addable = computed(() => {
  const query = addSearch.value.trim().toLowerCase()
  return store.ingredients.filter((ingredient) => {
    if (store.bar[ingredient.slug]) return false
    return !query || ingredient.name.toLowerCase().includes(query)
  })
})

const visible = computed(() =>
  store.barItems.filter((ingredient) => {
    if (!ingredient) return false
    if (filter.value === 'spirits') return ingredient.category === 'spirit'
    if (filter.value === 'liqueurs') return ingredient.category === 'liqueur' || ingredient.category === 'bitters'
    if (filter.value === 'fresh') return ingredient.category === 'fresh' || ingredient.category === 'mixer'
    if (filter.value === 'low') return store.bar[ingredient.slug] === 'low' || store.bar[ingredient.slug] === 'out'
    return true
  }),
)

function showToast(message: string) {
  if (toastTimer) window.clearTimeout(toastTimer)
  toast.value = message
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2400)
}

function openIngredient(slug: string) {
  selectedSlug.value = slug
}

function setLevel(level: StockLevel) {
  if (!selectedSlug.value) return
  store.setLevel(selectedSlug.value, level)
  showToast(`${selected.value?.name ?? 'Ingredient'} set to ${STOCK_LABELS[level].toLowerCase()}.`)
}

function removeSelected() {
  if (!selectedSlug.value) return
  const name = selected.value?.name ?? 'Ingredient'
  store.removeFromBar(selectedSlug.value)
  selectedSlug.value = ''
  showToast(`${name} removed from your bar.`)
}

function addIngredient(slug: string) {
  store.addToBar(slug)
  showToast(`${store.ingredientBySlug(slug)?.name ?? 'Ingredient'} added to your bar.`)
}

function addNextBuy() {
  if (!store.nextBuy) return
  showToast(`${store.nextBuy.name} added to your list.`)
}

onBeforeUnmount(() => {
  if (toastTimer) window.clearTimeout(toastTimer)
})
</script>

<template>
  <div class="bar-page">
    <header class="page-head">
      <div>
        <h1>My Bar</h1>
        <p class="sub">{{ store.barCount }} ingredients · {{ store.counts.ready }} cocktails ready</p>
      </div>
      <div class="head-actions">
        <button class="btn ghost" type="button" @click="showToast('Label scanning is not in this demo yet.')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
            <circle cx="12" cy="12" r="3.2" />
          </svg>
          Scan label
        </button>
        <button class="btn primary" type="button" @click="addOpen = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add
        </button>
      </div>
    </header>

    <div v-if="store.nextBuy" class="next-buy">
      <span class="spark">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3l1.6 5.4L19 10l-5.4 1.6L12 17l-1.6-5.4L5 10l5.4-1.6L12 3z" />
          <path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16z" />
        </svg>
      </span>
      <div class="next-copy">
        <strong>Best next buy: {{ store.nextBuy.name.toLowerCase() }}</strong>
        <span>Unlocks {{ store.nextBuy.recipeNames.join(', ') }}</span>
      </div>
      <button class="btn soft" type="button" @click="addNextBuy">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add to list
      </button>
    </div>

    <div class="filters">
      <button
        v-for="item in filters"
        :key="item"
        class="chip"
        :class="{ active: filter === item }"
        type="button"
        @click="filter = item"
      >
        <template v-if="item === 'all'">All {{ store.barCount }}</template>
        <template v-else-if="item === 'spirits'">Spirits</template>
        <template v-else-if="item === 'liqueurs'">Liqueurs</template>
        <template v-else-if="item === 'fresh'">Fresh &amp; mixers</template>
        <template v-else>
          <span class="warn">⚠</span> Running low · {{ store.barItems.filter((i) => i && store.bar[i.slug] === 'low').length }}
        </template>
      </button>
    </div>

    <div class="grid">
      <button
        v-for="ingredient in visible"
        :key="ingredient!.slug"
        class="ingredient"
        :class="{ out: store.bar[ingredient!.slug] === 'out', low: store.bar[ingredient!.slug] === 'low' }"
        type="button"
        @click="openIngredient(ingredient!.slug)"
      >
        <span class="stock">
          <svg v-if="store.bar[ingredient!.slug] !== 'out'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12.5l4 4L19 6.5" />
          </svg>
        </span>
        <span class="low-tag" v-if="store.bar[ingredient!.slug] === 'low'">Low</span>
        <span class="out-tag" v-else-if="store.bar[ingredient!.slug] === 'out'">Out</span>
        <span class="ingredient-name">{{ ingredient!.name }}</span>
      </button>
    </div>

    <Transition name="fade">
      <div v-if="selected" class="scrim" @click.self="selectedSlug = ''">
        <aside class="sheet" role="dialog" aria-modal="true" :aria-label="selected.name">
          <div class="sheet-head">
            <div>
              <h2>{{ selected.name }}</h2>
              <p>{{ selected.note ?? `${selected.category[0].toUpperCase() + selected.category.slice(1)} · ${selected.abv ? `${selected.abv}% ABV` : 'Zero-proof'}` }}</p>
            </div>
            <button class="close" type="button" aria-label="Close" @click="selectedSlug = ''">×</button>
          </div>

          <p class="question">How much is left?</p>
          <div class="segmented">
            <button
              v-for="level in (['full', 'half', 'low', 'out'] as StockLevel[])"
              :key="level"
              type="button"
              :class="{ active: selectedLevel === level }"
              @click="setLevel(level)"
            >
              {{ STOCK_LABELS[level] }}
            </button>
          </div>

          <button class="auto-row" type="button" @click="store.toggleAutoAdd(selected.slug)">
            <span class="cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M4 5h2l2 10h9l2-7H7" />
                <circle cx="9.5" cy="19" r="1.2" />
                <circle cx="17" cy="19" r="1.2" />
              </svg>
            </span>
            <span class="auto-copy">
              <strong>Add to my list when it runs out</strong>
            </span>
            <span class="toggle" :class="{ on: store.autoAdd[selected.slug] }"><i /></span>
          </button>

          <p class="used">Used in {{ usedInSelected.length }} recipes · {{ readyWithSelected.length }} you can make</p>
          <div class="used-list">
            <button v-for="recipe in usedInSelected.slice(0, 3)" :key="recipe.slug" class="used-row" type="button" @click="router.push(`/recipe/${recipe.slug}`)">
              <span class="used-art" :style="{ background: `radial-gradient(circle at 50% 40%, ${recipe.hue} 0%, var(--fill-1) 78%)` }">
                <DrinkArt :recipe="recipe" mini />
              </span>
              <span class="used-copy">
                <strong>{{ recipe.name }}</strong>
                <span>{{ store.readyRecipes.some((item) => item.slug === recipe.slug) ? `Ready · ${recipe.minutes} min` : 'Missing ingredients' }}</span>
              </span>
            </button>
          </div>

          <button class="remove" type="button" @click="removeSelected">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 7h16M9 7V5h6v2M7 7l1 13h8l1-13" />
            </svg>
            Remove from my bar
          </button>
        </aside>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="addOpen" class="scrim" @click.self="addOpen = false">
        <aside class="sheet add-sheet" role="dialog" aria-modal="true" aria-label="Add ingredients">
          <div class="sheet-head">
            <div>
              <h2>Add ingredients</h2>
              <p>{{ addable.length }} not in your bar yet</p>
            </div>
            <button class="close" type="button" aria-label="Close" @click="addOpen = false">×</button>
          </div>
          <label class="sheet-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="M16 16l4 4" />
            </svg>
            <input v-model="addSearch" type="search" placeholder="Search ingredients" />
          </label>
          <div class="add-list">
            <button v-for="ingredient in addable" :key="ingredient.slug" class="add-row" type="button" @click="addIngredient(ingredient.slug)">
              <span class="add-icon">+</span>
              <span class="add-copy">
                <strong>{{ ingredient.name }}</strong>
                <span>{{ ingredient.category[0].toUpperCase() + ingredient.category.slice(1) }}</span>
              </span>
              <span class="add-btn">Add</span>
            </button>
          </div>
        </aside>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.bar-page {
  height: 100%;
  overflow-y: auto;
  padding: 42px 40px 120px;
  background: var(--bg-base);
  color: var(--text-primary);
  scrollbar-width: none;
}

.bar-page::-webkit-scrollbar {
  display: none;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
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

.head-actions {
  display: flex;
  gap: 12px;
}

.btn {
  height: 52px;
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-size: calc(15px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.btn.ghost {
  background: var(--fill-2);
  color: var(--text-primary);
}

.btn.primary {
  background: var(--accent);
  color: var(--text-on-accent);
}

.btn.soft {
  height: 40px;
  margin-left: auto;
  background: color-mix(in srgb, var(--accent) 94%, white);
  color: var(--text-on-accent);
  white-space: nowrap;
}

.next-buy {
  margin-top: 24px;
  padding: 14px 16px 14px 20px;
  border: 1px solid color-mix(in srgb, var(--accent) 32%, transparent);
  border-radius: 20px;
  background: color-mix(in srgb, var(--accent) 8%, var(--fill-2));
  display: flex;
  align-items: center;
  gap: 14px;
}

.spark {
  color: var(--accent);
  display: flex;
}

.next-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.next-copy strong {
  font-size: calc(16px * var(--text-scale, 1));
  line-height: calc(21px * var(--text-scale, 1));
  font-weight: 600;
}

.next-copy span {
  font-size: calc(13px * var(--text-scale, 1));
  line-height: calc(18px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.filters {
  display: flex;
  gap: 10px;
  margin: 26px 0 22px;
}

.chip {
  height: 38px;
  padding: 0 18px;
  border: 1px solid var(--line-subtle);
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-primary);
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 500;
  cursor: pointer;
}

.chip.active {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.warn {
  color: var(--status-missing);
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.ingredient {
  position: relative;
  height: 104px;
  padding: 14px 16px;
  border: 1px solid var(--line-subtle);
  border-radius: 16px;
  background: var(--fill-2);
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}

.ingredient.low {
  border-color: color-mix(in srgb, var(--status-missing) 12%, var(--line-subtle));
}

.ingredient.out {
  border-style: dashed;
  background: transparent;
  color: var(--text-secondary);
}

.stock {
  width: 22px;
  height: 22px;
  border: 1.5px solid var(--status-ready);
  border-radius: 50%;
  background: color-mix(in srgb, var(--status-ready) 24%, transparent);
  color: var(--status-ready);
  display: grid;
  place-items: center;
}

.ingredient.out .stock {
  border-color: var(--line-strong);
  background: transparent;
}

.low-tag,
.out-tag {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: calc(11px * var(--text-scale, 1));
  line-height: calc(14px * var(--text-scale, 1));
  font-weight: 600;
  color: var(--status-missing);
}

.out-tag {
  color: var(--text-tertiary);
}

.ingredient-name {
  display: block;
  position: absolute;
  left: 16px;
  bottom: 16px;
  font-size: calc(16px * var(--text-scale, 1));
  line-height: calc(21px * var(--text-scale, 1));
  font-weight: 600;
  letter-spacing: -0.2px;
}

.scrim {
  position: absolute;
  inset: 0;
  z-index: 20;
  background: var(--scrim);
  display: flex;
  justify-content: flex-end;
}

.sheet {
  width: 464px;
  height: 100%;
  padding: 38px 32px 28px;
  background: var(--bg-elevated);
  border-left: 1px solid var(--line-subtle);
  box-shadow: -24px 0 60px rgba(0, 0, 0, 0.24);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: none;
}

.sheet::-webkit-scrollbar {
  display: none;
}

.sheet-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.sheet h2 {
  margin: 0;
  font-size: calc(34px * var(--text-scale, 1));
  line-height: calc(40px * var(--text-scale, 1));
  letter-spacing: -0.8px;
}

.sheet-head p {
  margin: 7px 0 0;
  font-size: calc(14px * var(--text-scale, 1));
  line-height: calc(19px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.close {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-secondary);
  font-size: calc(26px * var(--text-scale, 1));
  line-height: 1;
  cursor: pointer;
}

.question {
  margin: 32px 0 10px;
  font-size: calc(14px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.segmented {
  display: flex;
  padding: 4px;
  border-radius: 999px;
  background: var(--fill-2);
}

.segmented button {
  flex: 1;
  height: 40px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 500;
  cursor: pointer;
}

.segmented button.active {
  background: var(--fill-3);
  color: var(--text-primary);
}

.auto-row {
  width: 100%;
  margin-top: 24px;
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--accent) 26%, var(--line-subtle));
  border-radius: 18px;
  background: color-mix(in srgb, var(--accent) 6%, var(--fill-2));
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
}

.cart {
  color: var(--accent);
  display: flex;
}

.auto-copy {
  flex: 1;
}

.auto-copy strong {
  font-size: calc(14px * var(--text-scale, 1));
  line-height: calc(19px * var(--text-scale, 1));
  font-weight: 600;
}

.toggle {
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: var(--fill-3);
  padding: 3px;
  transition: background 0.18s ease;
}

.toggle i {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--text-primary);
  transition: transform 0.18s ease;
}

.toggle.on {
  background: var(--accent);
}

.toggle.on i {
  transform: translateX(18px);
  background: var(--text-on-accent);
}

.used {
  margin: 26px 0 12px;
  font-size: calc(13px * var(--text-scale, 1));
  line-height: calc(18px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.used-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.used-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
}

.used-art {
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  border-radius: 14px;
  overflow: hidden;
  display: grid;
  place-items: center;
}

.used-art :deep(.glass.mini) {
  width: 30px;
  height: 38px;
  margin-top: 3px;
}

.used-copy {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.used-copy strong {
  font-size: calc(15px * var(--text-scale, 1));
  line-height: calc(20px * var(--text-scale, 1));
  font-weight: 600;
}

.used-copy span {
  font-size: calc(12px * var(--text-scale, 1));
  line-height: calc(17px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.remove {
  margin-top: auto;
  height: 52px;
  border: 0;
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-size: calc(15px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.add-sheet {
  width: 516px;
}

.sheet-search {
  margin-top: 24px;
  height: 48px;
  padding: 0 15px;
  border: 1px solid var(--line-subtle);
  border-radius: 999px;
  background: var(--fill-2);
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--text-tertiary);
}

.sheet-search input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font: inherit;
  font-size: calc(14px * var(--text-scale, 1));
}

.add-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
}

.add-row {
  padding: 12px 0;
  border: 0;
  border-bottom: 1px solid var(--line-subtle);
  background: transparent;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
}

.add-icon {
  width: 24px;
  height: 24px;
  border: 1.5px solid var(--accent);
  border-radius: 50%;
  color: var(--accent);
  display: grid;
  place-items: center;
  font-size: calc(16px * var(--text-scale, 1));
}

.add-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.add-copy strong {
  font-size: calc(15px * var(--text-scale, 1));
  line-height: calc(20px * var(--text-scale, 1));
}

.add-copy span {
  font-size: calc(12px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.add-btn {
  height: 34px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text-on-accent);
  display: inline-flex;
  align-items: center;
  font-size: calc(13px * var(--text-scale, 1));
  font-weight: 600;
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 112px;
  z-index: 30;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--text-on-accent);
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-active .sheet,
.fade-leave-active .sheet {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .sheet,
.fade-leave-to .sheet {
  transform: translateX(32px);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
@media (max-width: 900px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

[data-text-large='true'] .page-head {
  flex-direction: column;
  gap: 16px;
}

[data-text-large='true'] .head-actions {
  flex-wrap: wrap;
}

[data-text-large='true'] .next-buy {
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 14px;
}

[data-text-large='true'] .filters {
  flex-wrap: wrap;
}

[data-text-large='true'] .chip {
  height: auto;
  min-height: 42px;
  padding-block: 8px;
}

[data-text-large='true'] .grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

[data-text-large='true'] .ingredient {
  height: auto;
  min-height: 128px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

[data-text-large='true'] .ingredient-name {
  position: static;
  margin-top: auto;
}
</style>
