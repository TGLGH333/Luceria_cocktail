<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DrinkGlass from '../components/DrinkGlass.vue'
import { useDemoStore } from '../stores/demo'
import type { RecipeIngredient, Unit } from '../types'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()

const recipe = computed(() => store.recipeBySlug(String(route.params.slug)))
const tab = ref<'ingredients' | 'method'>('ingredients')
const servings = ref(store.settings.defaultServings)
const unit = ref<Unit>(store.settings.units)
const favourite = ref(false)
const toast = ref('')
let toastTimer: number | undefined

const missing = computed(() => (recipe.value ? store.missingFor(recipe.value) : []))
const ready = computed(() => missing.value.length === 0)

function trimNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function amountFor(item: RecipeIngredient) {
  const total = item.amount * servings.value
  if (item.unit !== 'ml') {
    const rounded = Math.max(1, Math.round(total))
    return `${rounded} ${item.unit}${rounded === 1 ? '' : item.unit === 'dash' ? 'es' : 's'}`
  }
  if (unit.value === 'oz') return `${trimNumber(total / 29.5735)} oz`
  if (unit.value === 'cl') return `${trimNumber(total / 10)} cl`
  return `${trimNumber(Math.round(total * 2) / 2)} ml`
}

function ingredientName(slug: string) {
  return store.ingredientBySlug(slug)?.name ?? slug
}

function showToast(message: string) {
  if (toastTimer) window.clearTimeout(toastTimer)
  toast.value = message
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2200)
}

function start() {
  if (!recipe.value) return
  router.push(`/mix/${recipe.value.slug}?servings=${servings.value}`)
}

function addOptional(slug: string) {
  showToast(`${ingredientName(slug)} added to your list.`)
}

function shrink() {
  servings.value = Math.max(1, servings.value - 1)
}

function grow() {
  servings.value = Math.min(8, servings.value + 1)
}

onBeforeUnmount(() => {
  if (toastTimer) window.clearTimeout(toastTimer)
})
</script>

<template>
  <div v-if="recipe" class="recipe-page">
    <aside class="art" :style="{ background: `linear-gradient(180deg, ${recipe.hue} 0%, var(--bg-base) 88%)` }">
      <button class="round back" type="button" aria-label="Back" @click="router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <div class="art-actions">
        <button class="round" type="button" aria-label="Favourite" :class="{ on: favourite }" @click="favourite = !favourite">
          <svg width="20" height="20" viewBox="0 0 24 24" :fill="favourite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M12 20s-7-4.4-7-9.4A4.1 4.1 0 0 1 12 7a4.1 4.1 0 0 1 7 3.6C19 15.6 12 20 12 20z" />
          </svg>
        </button>
        <button class="round" type="button" aria-label="Share" @click="showToast('Sharing is not in this demo yet.')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="2.5" />
            <circle cx="6" cy="12" r="2.5" />
            <circle cx="18" cy="19" r="2.5" />
            <path d="M8.2 10.8l7.6-4.3M8.2 13.2l7.6 4.3" />
          </svg>
        </button>
      </div>
      <div class="art-glow" />
      <img v-if="recipe.art" class="art-image" :src="recipe.art" alt="" />
      <DrinkGlass v-else :liquid="recipe.liquid" :hue="recipe.hue" />
    </aside>

    <section class="detail">
      <h1>{{ recipe.name }}</h1>
      <p class="description">{{ recipe.description }}</p>

      <div class="meta">
        <span class="pill">{{ recipe.baseSpirit }}</span>
        <span class="pill">{{ recipe.method }}</span>
        <span class="pill">{{ recipe.abv }}% ABV</span>
        <span class="pill">{{ recipe.glassware.replace(' glass', '') }}</span>
        <span class="rating">
          <span class="star">★</span>
          {{ recipe.rating }} · {{ recipe.reviews }}
        </span>
      </div>

      <div class="controls">
        <div class="tabs">
          <button type="button" :class="{ active: tab === 'ingredients' }" @click="tab = 'ingredients'">Ingredients</button>
          <button type="button" :class="{ active: tab === 'method' }" @click="tab = 'method'">Method · {{ recipe.steps.length }} steps</button>
        </div>
        <div class="serving-controls">
          <div class="unit-toggle">
            <button v-for="option in (['ml', 'oz', 'cl'] as Unit[])" :key="option" type="button" :class="{ active: unit === option }" @click="unit = option">
              {{ option }}
            </button>
          </div>
          <div class="stepper">
            <button type="button" aria-label="Fewer servings" @click="shrink">−</button>
            <span>{{ servings }} drinks</span>
            <button type="button" aria-label="More servings" @click="grow">+</button>
          </div>
        </div>
      </div>

      <div v-if="tab === 'ingredients'" class="ingredient-list">
        <div
          v-for="item in recipe.ingredients"
          :key="item.slug"
          class="ingredient-row"
          :class="{ optional: item.optional }"
        >
          <span class="ingredient-check" :class="{ optional: item.optional }">
            <svg v-if="!item.optional" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 12.5l2.5 2.5L16 9.5" />
            </svg>
            <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </span>
          <span class="ingredient-copy">
            <span class="ingredient-name">{{ ingredientName(item.slug) }}</span>
            <span v-if="item.optional" class="ingredient-sub">Not in your bar · optional</span>
            <span v-else-if="item.prep" class="ingredient-sub">{{ item.prep }}</span>
          </span>
          <span class="ingredient-qty">{{ amountFor(item) }}</span>
          <button v-if="item.optional" class="add-to-list" type="button" @click="addOptional(item.slug)">Add to list</button>
        </div>
      </div>

      <div v-else class="step-list">
        <div v-for="(step, index) in recipe.steps" :key="step.title" class="step-row">
          <span class="step-num">{{ index + 1 }}</span>
          <span class="step-copy">
            <span class="step-title">{{ step.title }}</span>
            <span class="step-instruction">{{ step.instruction }}</span>
          </span>
          <span class="step-time">
            <template v-if="step.timer">◷ {{ step.timer }} s timer</template>
            <template v-else>{{ step.duration }} s</template>
          </span>
        </div>
      </div>

      <div class="service">
        <span>{{ recipe.glassware }}</span>
        <span>{{ recipe.ice }}</span>
        <span>Garnish · {{ recipe.garnish.toLowerCase() }}</span>
      </div>

      <div v-if="!ready" class="missing-note">
        <strong>You need {{ missing.map(ingredientName).join(', ') }}</strong>
        <button type="button" @click="addOptional(missing[0])">Add to list</button>
      </div>

      <div class="start-wrap">
        <button class="start" type="button" @click="start">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5.5v13l10-6.5-10-6.5z" />
          </svg>
          Start mixing
        </button>
      </div>
    </section>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.recipe-page {
  position: relative;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 500px minmax(0, 1fr);
  background: var(--bg-base);
  color: var(--text-primary);
  overflow: hidden;
}

.art {
  position: relative;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.art :deep(.glass) {
  position: relative;
  z-index: 2;
  width: 380px;
  margin-top: 20px;
  filter: drop-shadow(0 26px 44px rgba(0, 0, 0, 0.4));
}

.art-image {
  position: relative;
  z-index: 2;
  display: block;
  width: auto;
  height: 460px;
  max-width: 86%;
  object-fit: contain;
  margin-top: 0;
  filter: drop-shadow(0 26px 44px rgba(0, 0, 0, 0.4));
}

.art-glow {
  position: absolute;
  top: 190px;
  left: 10px;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--accent) 30%, transparent) 0%, transparent 70%);
}

.round {
  width: 44px;
  height: 44px;
  border: 1px solid var(--line-subtle);
  border-radius: 50%;
  background: color-mix(in srgb, var(--fill-2) 82%, transparent);
  color: var(--text-primary);
  display: grid;
  place-items: center;
  cursor: pointer;
  backdrop-filter: blur(12px);
}

.back {
  position: absolute;
  top: 36px;
  left: 40px;
  z-index: 4;
}

.art-actions {
  position: absolute;
  top: 36px;
  right: 40px;
  z-index: 4;
  display: flex;
  gap: 10px;
}

.art-actions .round.on {
  color: var(--accent);
}

.detail {
  height: 100%;
  overflow-y: auto;
  padding: 52px 40px 120px;
  scrollbar-width: none;
}

.detail::-webkit-scrollbar {
  display: none;
}

h1 {
  margin: 0;
  font-size: calc(40px * var(--text-scale, 1));
  line-height: calc(46px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: -1.2px;
}

.description {
  margin: 7px 0 0;
  max-width: 540px;
  font-size: calc(18px * var(--text-scale, 1));
  line-height: calc(25px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 17px;
}

.pill {
  height: 34px;
  padding: 0 16px;
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 500;
}

.rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: calc(14px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.star {
  color: var(--accent);
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 24px;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: var(--fill-2);
}

.tabs button {
  height: 38px;
  padding: 0 18px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-secondary);
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 500;
  cursor: pointer;
}

.tabs button.active {
  background: var(--fill-3);
  color: var(--text-primary);
}

.serving-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit-toggle {
  display: flex;
  padding: 3px;
  border-radius: 999px;
  background: var(--fill-2);
}

.unit-toggle button {
  height: 32px;
  padding: 0 10px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-tertiary);
  font-size: calc(12px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.unit-toggle button.active {
  background: var(--fill-3);
  color: var(--text-primary);
}

.stepper {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px;
  border-radius: 999px;
  background: var(--fill-2);
}

.stepper button {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-primary);
  font-size: calc(18px * var(--text-scale, 1));
  cursor: pointer;
}

.stepper span {
  min-width: 76px;
  text-align: center;
  font-size: calc(12px * var(--text-scale, 1));
  font-weight: 600;
}

.ingredient-list,
.step-list {
  margin-top: 18px;
  border-top: 1px solid var(--line-subtle);
}

.ingredient-row {
  min-height: 56px;
  padding: 8px 0;
  border-bottom: 1px solid var(--line-subtle);
  display: flex;
  align-items: center;
  gap: 12px;
}

.ingredient-check {
  color: var(--status-ready);
  display: flex;
}

.ingredient-check.optional {
  color: var(--accent);
}

.ingredient-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ingredient-name {
  font-size: calc(17px * var(--text-scale, 1));
  line-height: calc(22px * var(--text-scale, 1));
  font-weight: 500;
}

.ingredient-sub {
  font-size: calc(12px * var(--text-scale, 1));
  line-height: calc(16px * var(--text-scale, 1));
  color: var(--text-tertiary);
}

.ingredient-qty {
  font-size: calc(15px * var(--text-scale, 1));
  color: var(--text-secondary);
  white-space: nowrap;
}

.add-to-list {
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font-size: calc(13px * var(--text-scale, 1));
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.step-row {
  padding: 15px 0;
  border-bottom: 1px solid var(--line-subtle);
  display: flex;
  gap: 14px;
}

.step-num {
  width: 26px;
  height: 26px;
  flex: 0 0 26px;
  border-radius: 50%;
  background: var(--fill-2);
  color: var(--text-secondary);
  display: grid;
  place-items: center;
  font-size: calc(12px * var(--text-scale, 1));
  font-weight: 600;
}

.step-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.step-title {
  font-size: calc(15px * var(--text-scale, 1));
  line-height: calc(20px * var(--text-scale, 1));
  font-weight: 600;
}

.step-instruction {
  font-size: calc(13px * var(--text-scale, 1));
  line-height: calc(18px * var(--text-scale, 1));
  color: var(--text-secondary);
}

.step-time {
  font-size: calc(12px * var(--text-scale, 1));
  color: var(--text-tertiary);
  white-space: nowrap;
}

.service {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.service span {
  padding: 8px 13px;
  border: 1px solid var(--line-subtle);
  border-radius: 999px;
  color: var(--text-secondary);
  font-size: calc(12px * var(--text-scale, 1));
}

.missing-note {
  margin-top: 14px;
  padding: 12px 16px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--status-missing) 9%, var(--fill-2));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.missing-note strong {
  font-size: calc(13px * var(--text-scale, 1));
  font-weight: 500;
  color: var(--status-missing);
}

.missing-note button {
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font-size: calc(13px * var(--text-scale, 1));
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.start-wrap {
  position: absolute;
  left: 540px;
  right: 40px;
  bottom: 32px;
}

.start {
  width: 100%;
  height: 64px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: var(--text-on-accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-size: calc(20px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 96px;
  z-index: 30;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--text-on-accent);
  font-size: calc(14px * var(--text-scale, 1));
  font-weight: 600;
  white-space: nowrap;
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

[data-text-large='true'] .recipe-page {
  display: block;
  overflow-y: auto;
  padding-bottom: 40px;
}

[data-text-large='true'] .art {
  height: 320px;
}

[data-text-large='true'] .art-glow {
  display: none;
}

[data-text-large='true'] .art-image {
  height: auto;
  max-height: 260px;
  margin-top: 0;
}

[data-text-large='true'] .art :deep(.glass) {
  width: 220px;
  margin-top: 0;
}

[data-text-large='true'] .detail {
  height: auto;
  overflow: visible;
  padding: 26px 32px 40px;
}

[data-text-large='true'] .controls {
  flex-wrap: wrap;
  align-items: flex-start;
}

[data-text-large='true'] .tabs button {
  height: auto;
  min-height: 44px;
  padding-block: 8px;
}

[data-text-large='true'] .start-wrap {
  position: static;
  margin-top: 28px;
}

[data-text-large='true'] .start {
  height: auto;
  min-height: 64px;
  padding-block: 10px;
}
</style>
