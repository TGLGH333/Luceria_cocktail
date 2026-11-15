<script setup lang="ts">
import type { Tab } from '../data/navigation'

defineProps<{
  tabs: Tab[]
  active: string
}>()

const emit = defineEmits<{
  (event: 'select', tab: Tab): void
}>()
</script>

<template>
  <nav class="tabbar" aria-label="Main">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      class="tab"
      :class="{ active: tab.id === active }"
      type="button"
      @click="emit('select', tab)"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
        v-html="tab.icon"
      />
      <span>{{ tab.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.tabbar {
  position: absolute;
  left: 50%;
  bottom: calc(28px + env(safe-area-inset-bottom, 0px));
  z-index: 10;
  transform: translateX(-50%);
  width: 560px;
  height: 68px;
  padding: 0 5px;
  border-radius: 999px;
  border: 1px solid var(--line-subtle);
  background: color-mix(in srgb, var(--bg-elevated) 86%, transparent);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.tab {
  width: 105px;
  height: 56px;
  border: 0;
  border-radius: 28px;
  background: transparent;
  color: var(--text-tertiary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: calc(11px * var(--text-scale, 1));
  line-height: calc(14px * var(--text-scale, 1));
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.tab svg {
  display: block;
}

.tab.active {
  background: var(--fill-3);
  color: var(--text-primary);
}

.tab.active svg {
  color: var(--accent);
}

.tab:hover {
  color: var(--text-primary);
}
</style>
