<script setup lang="ts">
import { useId } from 'vue'

withDefaults(
  defineProps<{
    liquid?: string
    hue?: string
    mini?: boolean
  }>(),
  {
    liquid: '#F0A64B',
    hue: '#2E1C1D',
    mini: false,
  },
)

const uid = useId()
const liquidId = `liquid-${uid}`
const glowId = `glow-${uid}`
const clipId = `clip-${uid}`
</script>

<template>
  <svg
    class="glass"
    :class="{ mini }"
    viewBox="0 0 380 380"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <radialGradient
        :id="glowId"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(190 245) rotate(90) scale(150 160)"
      >
        <stop :stop-color="liquid" stop-opacity=".34" />
        <stop offset="1" :stop-color="liquid" stop-opacity="0" />
      </radialGradient>

      <linearGradient :id="liquidId" x1="190" y1="145" x2="190" y2="345" gradientUnits="userSpaceOnUse">
        <stop :stop-color="liquid" stop-opacity=".94" />
        <stop offset=".55" :stop-color="liquid" stop-opacity=".82" />
        <stop offset="1" :stop-color="liquid" stop-opacity=".58" />
      </linearGradient>

      <linearGradient id="ice-a" x1="0" y1="0" x2="1" y2="1">
        <stop stop-color="#FFFFFF" stop-opacity=".38" />
        <stop offset="1" stop-color="#FFFFFF" stop-opacity=".08" />
      </linearGradient>

      <clipPath :id="clipId">
        <path d="M96 104 L112 306 Q116 340 190 340 Q264 340 268 306 L284 104 Z" />
      </clipPath>
    </defs>

    <ellipse cx="190" cy="255" rx="155" ry="120" :fill="`url(#${glowId})`" />

    <!-- ice above the rim -->
    <g transform="rotate(-16 150 108)" opacity=".92">
      <rect x="115" y="48" width="76" height="76" rx="14" fill="url(#ice-a)" stroke="rgba(255,255,255,.6)" stroke-width="2" />
      <path d="M129 62l18 18M155 56l12 24M126 95l24-16" stroke="rgba(255,255,255,.32)" stroke-width="2" stroke-linecap="round" />
    </g>

    <!-- glass body -->
    <path
      d="M96 104 L112 306 Q116 340 190 340 Q264 340 268 306 L284 104 Z"
      fill="rgba(255,255,255,.035)"
      stroke="rgba(255,255,255,.62)"
      stroke-width="2.5"
    />

    <g :clip-path="`url(#${clipId})`">
      <rect x="80" y="146" width="220" height="220" :fill="`url(#${liquidId})`" />
      <ellipse cx="190" cy="148" rx="100" ry="18" :fill="liquid" opacity=".48" />
      <ellipse cx="190" cy="148" rx="100" ry="18" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.5" />

      <!-- ice inside the drink -->
      <g opacity=".96">
        <rect x="126" y="154" width="62" height="58" rx="11" transform="rotate(-9 157 183)" fill="url(#ice-a)" stroke="rgba(255,255,255,.58)" stroke-width="2" />
        <rect x="201" y="142" width="56" height="58" rx="11" transform="rotate(8 229 171)" fill="url(#ice-a)" stroke="rgba(255,255,255,.5)" stroke-width="2" />
        <rect x="158" y="212" width="58" height="50" rx="10" transform="rotate(-4 187 237)" fill="url(#ice-a)" stroke="rgba(255,255,255,.42)" stroke-width="2" />
        <rect x="222" y="222" width="38" height="38" rx="8" transform="rotate(16 241 241)" fill="url(#ice-a)" stroke="rgba(255,255,255,.36)" stroke-width="2" />
      </g>

      <!-- facets and highlights -->
      <path d="M122 150L136 318M158 150L166 330M190 150V332M222 150L214 330M258 150L244 318" stroke="rgba(255,255,255,.08)" stroke-width="4" />
      <path d="M118 132L130 306" stroke="rgba(255,255,255,.18)" stroke-width="5" stroke-linecap="round" />
      <path d="M252 130L240 292" stroke="rgba(255,255,255,.1)" stroke-width="8" stroke-linecap="round" />

      <g fill="rgba(255,255,255,.22)">
        <circle cx="143" cy="258" r="2.4" />
        <circle cx="240" cy="204" r="2" />
        <circle cx="213" cy="292" r="3" />
        <circle cx="166" cy="300" r="1.8" />
        <circle cx="206" cy="238" r="1.4" />
      </g>
    </g>

    <!-- rim, base, and orange wheel -->
    <ellipse cx="190" cy="104" rx="94" ry="17" fill="rgba(255,255,255,.055)" stroke="rgba(255,255,255,.72)" stroke-width="2.5" />
    <ellipse cx="190" cy="104" rx="84" ry="13" stroke="rgba(255,255,255,.18)" stroke-width="1.2" />
    <path d="M112 306 Q116 340 190 340 Q264 340 268 306" stroke="rgba(255,255,255,.35)" stroke-width="7" stroke-linecap="round" />

    <g v-if="!mini" class="orange">
      <circle cx="298" cy="122" r="37" :fill="liquid" />
      <circle cx="298" cy="122" r="37" stroke="#FFD9A3" stroke-width="4" opacity=".85" />
      <circle cx="298" cy="122" r="29" fill="none" stroke="#FFE6C2" stroke-width="1.6" opacity=".65" />
      <path
        d="M298 93v58M269 122h58M278 102l40 40M318 102l-40 40M298 122l-20-18M298 122l20-18M298 122l-20 18M298 122l20 18"
        stroke="#FFE6C2"
        stroke-width="1.5"
        opacity=".55"
      />
      <circle cx="298" cy="122" r="9" fill="#FFE6C2" opacity=".45" />
    </g>

    <g v-if="!mini" fill="rgba(255,255,255,.24)">
      <circle cx="312" cy="174" r="2.6" />
      <circle cx="326" cy="192" r="2" />
      <circle cx="298" cy="196" r="1.6" />
    </g>
  </svg>
</template>

<style scoped>
.glass {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.glass.mini {
  width: 38px;
  height: 46px;
  margin-top: 4px;
}
</style>
