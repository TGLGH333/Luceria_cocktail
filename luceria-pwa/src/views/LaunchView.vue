<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDemoStore } from '../stores/demo'

const router = useRouter()
const store = useDemoStore()
let enterTimer: number | undefined

function enter() {
  if (enterTimer) window.clearTimeout(enterTimer)
  enterTimer = undefined
  router.replace('/welcome')
}

onMounted(() => {
  enterTimer = window.setTimeout(enter, store.settings.reduceMotion ? 1600 : 2800)
})

onBeforeUnmount(() => {
  if (enterTimer) window.clearTimeout(enterTimer)
})
</script>

<template>
  <button class="launch" type="button" aria-label="Continue to Luceria" @click="enter">
    <img class="ink" src="/art/launch-ink.webp" alt="" draggable="false" />
    <span class="fade" aria-hidden="true" />
    <span class="title">
      <span class="opening">THE BAR'S OPEN</span>
      <span class="brand">
        <i aria-hidden="true" />
        Luceria
        <i aria-hidden="true" />
      </span>
    </span>
  </button>
</template>

<style scoped>
.launch {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: #121110;
  color: #f4f0e9;
  cursor: pointer;
  text-align: center;
}

.ink {
  position: absolute;
  left: 0;
  top: -24px;
  width: 100%;
  height: 1077px;
  object-fit: cover;
  object-position: center top;
  filter: invert(1);
  mix-blend-mode: screen;
  opacity: 0.94;
  animation: ink-in 1.5s ease-out both;
  pointer-events: none;
}

.fade {
  position: absolute;
  inset: 520px 0 0;
  background: linear-gradient(180deg, rgba(18, 17, 16, 0) 0%, #121110 72%);
  pointer-events: none;
}

.title {
  position: absolute;
  left: 0;
  right: 0;
  top: 664px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.opening {
  font-size: calc(52px * var(--text-scale, 1));
  line-height: calc(63px * var(--text-scale, 1));
  font-weight: 600;
  letter-spacing: -1.2px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #f0a64b;
  font-size: calc(20px * var(--text-scale, 1));
  line-height: calc(26px * var(--text-scale, 1));
  font-weight: 600;
}

.brand i {
  display: block;
  width: 40px;
  height: 1px;
  background: #f0a64b;
}

[data-text-large='true'] .opening {
  font-size: 56px;
  line-height: 68px;
}

[data-text-large='true'] .brand {
  font-size: 20px;
}

@keyframes ink-in {
  from {
    opacity: 0;
    transform: scale(1.035);
  }
  to {
    opacity: 0.94;
    transform: scale(1);
  }
}

[data-reduce-motion='true'] .ink {
  animation: none;
}

@media (prefers-reduced-motion: reduce) {
  .ink {
    animation: none;
  }
}
</style>
