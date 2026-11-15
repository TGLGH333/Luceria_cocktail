<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabBar from './components/TabBar.vue'
import { tabs, type Tab } from './data/navigation'
import { useDemoStore } from './stores/demo'

const route = useRoute()
const router = useRouter()
const store = useDemoStore()

const viewportWidth = ref(1400)
const viewportHeight = ref(1000)
const systemDark = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
const systemContrast = ref(window.matchMedia('(prefers-contrast: more)').matches)
const activeTab = computed(() => (route.meta.tab as string | undefined) ?? '')
const keepAliveViews = ['TonightView', 'RecipesView', 'BarView', 'ListView', 'JournalView', 'SettingsView']
const transitionName = computed(() => (route.meta.transition === 'push' ? 'push' : ''))

const scale = computed(() => {
  // On iPad the PWA should fill the screen; keep the framed desktop preview
  // for mouse-driven browsers.
  const inset = window.matchMedia('(pointer: coarse)').matches ? 0 : 56
  const sx = (viewportWidth.value - inset) / 1194
  const sy = (viewportHeight.value - inset) / 834
  return Math.max(0.42, Math.min(1, sx, sy))
})

const wrapStyle = computed(() => ({
  width: `${1194 * scale.value}px`,
  height: `${834 * scale.value}px`,
}))

const ipadStyle = computed(() => ({
  transform: `scale(${scale.value})`,
}))

function resize() {
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
}

function selectTab(tab: Tab) {
  if (tab.id !== activeTab.value) router.push(tab.path)
}

watchEffect(() => {
  const setting = store.settings.theme
  const resolved =
    setting === 'auto'
      ? systemContrast.value
        ? 'hc'
        : systemDark.value
          ? 'dark'
          : 'light'
      : setting
  document.documentElement.dataset.theme = resolved
  document.documentElement.dataset.reduceMotion = String(store.settings.reduceMotion)
  document.documentElement.dataset.largeTargets = String(store.settings.largeTargets)
  document.documentElement.dataset.textLarge = String(store.settings.textScale >= 1.6)
  document.documentElement.style.setProperty('--text-scale', String(store.settings.textScale))
})

function syncColorPreferences() {
  systemDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  systemContrast.value = window.matchMedia('(prefers-contrast: more)').matches
}

onMounted(() => {
  resize()
  syncColorPreferences()
  window.addEventListener('resize', resize)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncColorPreferences)
  window.matchMedia('(prefers-contrast: more)').addEventListener('change', syncColorPreferences)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', syncColorPreferences)
  window.matchMedia('(prefers-contrast: more)').removeEventListener('change', syncColorPreferences)
})
</script>

<template>
  <div class="stage">
    <div class="canvas-wrap" :style="wrapStyle">
      <div class="ipad" :class="{ 'has-tabbar': Boolean(activeTab) }" :style="ipadStyle">
        <RouterView v-slot="{ Component }">
          <Transition :name="transitionName" :css="Boolean(transitionName)" mode="out-in">
            <KeepAlive :include="keepAliveViews">
              <component :is="Component" />
            </KeepAlive>
          </Transition>
        </RouterView>

        <TabBar v-if="activeTab" :tabs="tabs" :active="activeTab" @select="selectTab" />
      </div>
    </div>
  </div>
</template>

<style>
.push-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.push-leave-active {
  transition: opacity 0.15s ease-in;
}

.push-enter-from {
  opacity: 0;
  transform: translateX(24px);
}

.push-leave-to {
  opacity: 0;
}
</style>
