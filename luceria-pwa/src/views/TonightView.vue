<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DrinkGlass from '../components/DrinkGlass.vue'
import { useDemoStore } from '../stores/demo'

const router = useRouter()
const store = useDemoStore()

const heroIndex = ref(0)
const toast = ref('')
const titleEl = ref<HTMLElement | null>(null)
const titleStyle = ref<Record<string, string>>({})
let toastTimer: number | undefined

const ready = computed(() => store.readyRecipes)
const heroRecipe = computed(() => ready.value[heroIndex.value % Math.max(1, ready.value.length)])
const counts = computed(() => store.counts)

const resolvedTheme = computed(() => {
  if (store.settings.theme !== 'auto') return store.settings.theme
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
})

const heroHue = computed(() => {
  if (!heroRecipe.value) return '#2E1C1D'
  if (resolvedTheme.value === 'hc') return '#000000'
  return resolvedTheme.value === 'light' ? heroRecipe.value.hueLight : heroRecipe.value.hue
})

const heroGlow = computed(() => {
  if (!heroRecipe.value || resolvedTheme.value === 'hc') return 'transparent'
  return heroRecipe.value.glow
})

const heroStyle = computed<Record<string, string>>(() => {
  if (!heroRecipe.value) return { background: 'var(--bg-base)', '--hero-glow': 'transparent' }
  return {
    background: `linear-gradient(180deg, ${heroHue.value} 0%, var(--bg-base) 60%)`,
    '--hero-glow': heroGlow.value,
  }
})

const heroLede = computed(() => {
  if (!heroRecipe.value) return ''
  return `${heroRecipe.value.description} Everything is already in your bar.`
})

const heroMeta = computed(() => {
  if (!heroRecipe.value) return []
  return [
    heroRecipe.value.baseSpirit,
    heroRecipe.value.method,
    `${heroRecipe.value.abv}% ABV`,
    `${heroRecipe.value.minutes} min`,
  ]
})

// The design curates the three suggestions on T01/T01b rather than taking
// whatever order the bar happens to return.
const alsoPriority = [
  'whiskey-sour',
  'margarita',
  'black-russian',
  'negroni',
  'boulevardier',
  'old-fashioned',
  'daiquiri',
]

const also = computed(() =>
  ready.value
    .filter((recipe) => recipe.slug !== heroRecipe.value?.slug)
    .sort((a, b) => alsoPriority.indexOf(a.slug) - alsoPriority.indexOf(b.slug))
    .slice(0, 3)
    .map((recipe) => ({
      slug: recipe.slug,
      name: recipe.name,
      status: `Ready · ${recipe.minutes} min`,
      hue: resolvedTheme.value === 'light' ? recipe.hueLight : recipe.hue,
      liquid: recipe.liquid,
      art: recipe.art,
    })),
)

function showToast(message: string) {
  if (toastTimer) window.clearTimeout(toastTimer)
  toast.value = message
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2200)
}

function startMixing() {
  if (heroRecipe.value) router.push(`/mix/${heroRecipe.value.slug}`)
}

function viewRecipe(slug = heroRecipe.value?.slug) {
  if (slug) router.push(`/recipe/${slug}`)
}

function shuffle() {
  if (ready.value.length > 1) heroIndex.value += 1
}

async function fitTitle() {
  // At default size the design title is 88px on one line. Long names such as
  // "Old Fashioned" would wrap and push the action row into Also ready.
  // At larger Dynamic Type sizes we intentionally allow wrapping and let the
  // hero grow, so only auto-fit the default scale.
  await nextTick()
  const el = titleEl.value
  if (!el) return
  el.style.removeProperty('font-size')
  el.style.removeProperty('line-height')
  if (store.settings.textScale !== 1) {
    titleStyle.value = {}
    return
  }
  const naturalWidth = el.scrollWidth
  const available = el.clientWidth
  if (!naturalWidth || naturalWidth <= available) {
    titleStyle.value = {}
    return
  }
  const fitted = Math.max(70, Math.floor((88 * available) / naturalWidth) - 1)
  titleStyle.value = {
    fontSize: `${fitted}px`,
    lineHeight: '92px',
  }
}

onMounted(fitTitle)

watch(
  [() => heroRecipe.value?.slug, () => store.settings.textScale],
  fitTitle,
  { flush: 'post' },
)

onBeforeUnmount(() => {
  if (toastTimer) window.clearTimeout(toastTimer)
})
</script>

<template>
  <div class="tonight">
    <section class="hero" :style="heroStyle">
      <div class="top-actions">
        <button class="round" type="button" aria-label="Search" @click="router.push('/recipes')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4 4" />
          </svg>
        </button>
        <button class="round" type="button" aria-label="Notifications" @click="showToast('Notifications are coming next.')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 9a6 6 0 10-12 0c0 6-2 6-2 7h16c0-1-2-1-2-7" />
            <path d="M10 20h4" />
          </svg>
          <span class="bell-dot" />
        </button>
        <button class="avatar" type="button" aria-label="Profile" @click="router.push('/settings')">M</button>
      </div>

      <div v-if="heroRecipe" class="hero-copy">
        <p class="overline">YOUR POUR FOR TONIGHT</p>
        <h1 ref="titleEl" :class="{ 'fit-title': store.settings.textScale === 1 }" :style="titleStyle">{{ heroRecipe.name }}</h1>
        <p class="lede">{{ heroLede }}</p>
        <div class="meta">
          <span v-for="item in heroMeta" :key="item" class="pill">{{ item }}</span>
        </div>
        <div class="actions">
          <button class="btn primary" type="button" @click="startMixing">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13l10-6.5-10-6.5z" />
            </svg>
            Start mixing
          </button>
          <button class="btn secondary" type="button" @click="viewRecipe()">View recipe</button>
          <button class="btn icon" type="button" aria-label="Shuffle tonight's pour" @click="shuffle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 7h3c4 0 6 10 10 10h3" />
              <path d="M4 17h3c4 0 6-10 10-10h3" />
              <path d="M17 4l3 3-3 3" />
              <path d="M17 14l3 3-3 3" />
            </svg>
          </button>
        </div>
      </div>

      <div v-else class="hero-copy">
        <p class="overline">YOUR POUR FOR TONIGHT</p>
        <h1>Your bar is empty</h1>
        <p class="lede">Add a few bottles and Luceria will show what you can make tonight.</p>
        <div class="actions">
          <button class="btn primary" type="button" @click="router.push('/bar')">Add ingredients</button>
        </div>
      </div>

      <div v-if="heroRecipe" class="hero-art" aria-hidden="true">
        <div class="art-glow" />
        <img v-if="heroRecipe.art" class="hero-image" :src="heroRecipe.art" alt="" />
        <DrinkGlass v-else :liquid="heroRecipe.liquid" :hue="heroHue" />
      </div>
    </section>

    <section class="also">
      <div class="also-head">
        <h2>Also ready tonight</h2>
        <button class="see-all" type="button" @click="router.push('/recipes')">
          All {{ counts.ready }} you can make
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div class="cards">
        <button v-for="drink in also" :key="drink.slug" class="card" type="button" @click="viewRecipe(drink.slug)">
          <span
            class="thumb"
            :style="{ background: `radial-gradient(circle at 50% 32%, ${drink.hue} 0%, var(--fill-1) 72%)` }"
          >
            <DrinkGlass :liquid="drink.liquid" :hue="drink.hue" mini />
          </span>
          <span class="card-copy">
            <span class="card-title">{{ drink.name }}</span>
            <span class="card-sub">
              <span class="ready">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 12.5l2.5 2.5L16 9.5" />
                </svg>
              </span>
              {{ drink.status }}
            </span>
          </span>
          <span class="chev">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </section>

    <Transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<style scoped>
.tonight {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background: var(--bg-base);
  color: var(--text-primary);
}

.hero {
  position: relative;
  min-height: 540px;
  height: auto;
  padding: 152px 40px 0;
  overflow: hidden;
}

[data-text-large='true'] .tonight {
  overflow-y: auto;
  padding-bottom: 120px;
}

[data-text-large='true'] .hero {
  height: auto;
  padding: 96px 40px 32px;
  overflow: visible;
}

[data-text-large='true'] .hero-copy {
  width: 100%;
  max-width: 980px;
}

[data-text-large='true'] .hero-art {
  display: none;
}

[data-text-large='true'] .lede {
  max-width: 820px;
}

[data-text-large='true'] .cards {
  grid-template-columns: 1fr;
}

[data-text-large='true'] .card {
  height: auto;
  min-height: 88px;
  padding-block: 14px;
  border-radius: 28px;
}

[data-text-large='true'] .btn {
  height: auto;
  min-height: 64px;
  padding-block: 10px;
}

[data-text-large='true'] .btn.icon {
  width: 64px;
  min-width: 64px;
  height: 64px;
  padding: 0;
}

.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(180deg, var(--bg-clear) 62%, color-mix(in srgb, var(--bg-base) 55%, transparent) 100%);
}

.hero-copy {
  position: relative;
  z-index: 2;
  width: 580px;
}

.overline {
  margin: 0 0 13px;
  font-size: calc(13px * var(--text-scale, 1));
  line-height: calc(16px * var(--text-scale, 1));
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent);
}

h1 {
  margin: 0 0 15px;
  font-size: calc(88px * var(--text-scale, 1));
  line-height: calc(92px * var(--text-scale, 1));
  font-weight: 700;
  letter-spacing: -2px;
  color: var(--text-primary);
}

h1.fit-title {
  white-space: nowrap;
}

[data-text-large='true'] h1 {
  white-space: normal;
}

.lede {
  margin: 0 0 14px;
  max-width: 540px;
  font-size: calc(18px * var(--text-scale, 1));
  line-height: calc(26px * var(--text-scale, 1));
  font-weight: 400;
  letter-spacing: -0.2px;
  color: var(--text-secondary);
}

.meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 34px;
}

.pill {
  height: 34px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: var(--fill-2);
  color: var(--text-primary);
  font-size: calc(15px * var(--text-scale, 1));
  font-weight: 500;
  letter-spacing: -0.1px;
  white-space: nowrap;
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  height: 60px;
  padding: 0 30px;
  border: 0;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: calc(20px * var(--text-scale, 1));
  font-weight: 600;
  letter-spacing: -0.2px;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.btn:active {
  transform: scale(0.98);
}

.btn.primary {
  padding-inline: 36px;
  background: var(--accent);
  color: var(--text-on-accent);
}

.btn.primary:hover {
  filter: brightness(1.06);
}

.btn.secondary {
  background: var(--fill-2);
  color: var(--text-primary);
}

.btn.secondary:hover {
  background: var(--fill-3);
}

.btn.icon {
  width: 60px;
  height: 60px;
  padding: 0;
  border-radius: 50%;
  background: var(--fill-2);
  color: var(--text-primary);
}

.btn.icon:hover {
  background: var(--fill-3);
}

.top-actions {
  position: absolute;
  top: 40px;
  right: 40px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 10px;
}

.round {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--line-subtle);
  background: color-mix(in srgb, var(--fill-2) 88%, transparent);
  color: var(--text-primary);
  display: grid;
  place-items: center;
  cursor: pointer;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition:
    transform 0.15s ease,
    background 0.15s ease;
  position: relative;
}

.round:active {
  transform: scale(0.94);
}

.round:hover {
  background: var(--fill-3);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid var(--line-subtle);
  background: var(--fill-3);
  color: var(--accent);
  display: grid;
  place-items: center;
  font-size: calc(17px * var(--text-scale, 1));
  font-weight: 600;
  cursor: pointer;
}

.bell-dot {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  top: 10px;
  right: 10px;
}

.hero-art {
  position: absolute;
  top: 92px;
  right: 134px;
  z-index: 1;
  width: 380px;
  height: 390px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
}

.art-glow {
  position: absolute;
  top: -92px;
  left: -70px;
  width: 540px;
  height: 540px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--hero-glow) 34%, transparent) 0%, transparent 70%);
}

.hero-image {
  position: relative;
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 26px 46px rgba(0, 0, 0, 0.45));
  animation: pour-in 900ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.hero-art :deep(.glass) {
  position: relative;
  width: 300px;
  filter: drop-shadow(0 26px 46px rgba(0, 0, 0, 0.45));
  animation: pour-in 900ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

@keyframes pour-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.also {
  position: relative;
  z-index: 3;
  padding: 0 40px;
  margin-top: 6px;
}

.also-head {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.also-head h2 {
  margin: 0;
  font-size: calc(20px * var(--text-scale, 1));
  line-height: calc(24px * var(--text-scale, 1));
  font-weight: 600;
  letter-spacing: -0.5px;
}

.see-all {
  border: 0;
  background: transparent;
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: calc(15px * var(--text-scale, 1));
  line-height: calc(20px * var(--text-scale, 1));
  font-weight: 500;
  cursor: pointer;
  padding: 8px 0;
}

.see-all:hover {
  color: var(--accent);
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.card {
  height: 84px;
  padding: 0 22px 0 10px;
  border: 1px solid var(--line-subtle);
  border-radius: 999px;
  background: var(--fill-2);
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  text-align: left;
  color: inherit;
  transition:
    background 0.18s ease,
    transform 0.18s ease;
}

.card:hover {
  background: var(--fill-3);
}

.card:active {
  transform: scale(0.995);
}

.thumb {
  width: 68px;
  height: 68px;
  flex: 0 0 68px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  display: grid;
  place-items: center;
}

.thumb :deep(.glass.mini) {
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.4));
}


.card-copy {
  min-width: 0;
}

.card-title {
  display: block;
  margin: 0 0 3px;
  font-size: calc(17px * var(--text-scale, 1));
  line-height: calc(22px * var(--text-scale, 1));
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: calc(13px * var(--text-scale, 1));
  line-height: calc(18px * var(--text-scale, 1));
  color: var(--text-secondary);
  white-space: nowrap;
}

.card-sub .ready {
  color: var(--status-ready);
  display: inline-flex;
}

.chev {
  margin-left: auto;
  color: var(--text-tertiary);
  display: flex;
}

.toast {
  position: absolute;
  left: 50%;
  bottom: 112px;
  z-index: 30;
  transform: translateX(-50%);
  max-width: 520px;
  padding: 12px 20px;
  border-radius: 999px;
  background: var(--text-primary);
  color: var(--text-on-accent);
  font-size: calc(14px * var(--text-scale, 1));
  line-height: calc(18px * var(--text-scale, 1));
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
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
</style>
