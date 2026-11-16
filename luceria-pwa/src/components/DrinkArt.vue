<script setup lang="ts">
import DrinkGlass from './DrinkGlass.vue'
import type { Recipe } from '../types'

withDefaults(
  defineProps<{
    recipe: Recipe
    hue?: string
    mini?: boolean
  }>(),
  { hue: '', mini: false },
)
</script>

<template>
  <img
    v-if="recipe.art"
    class="drink-art"
    :class="{ mini }"
    :src="recipe.art"
    :alt="recipe.name"
    draggable="false"
  />
  <DrinkGlass v-else :liquid="recipe.liquid" :hue="hue || recipe.hue" :mini="mini" />
</template>

<style scoped>
.drink-art {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  pointer-events: none;
  user-select: none;
  filter: drop-shadow(0 12px 26px rgba(0, 0, 0, 0.24));
}

.drink-art.mini {
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.2));
}
</style>
