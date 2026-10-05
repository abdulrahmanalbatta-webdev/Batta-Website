<script setup>
// Decorative contour-line background (inspired by topographic maps)
defineProps({
  // 'light' = blue lines for light backgrounds, 'dark' = white lines for dark backgrounds
  tone: { type: String, default: 'light' },
})

const lines = Array.from({ length: 14 }, (_, i) => {
  const y = 40 + i * 46
  const a = 18 + (i % 4) * 7
  const shift = (i % 3) * 120
  return `M-50 ${y} C ${200 + shift} ${y - a * 2}, ${420 - shift} ${y + a * 2}, 700 ${y} S ${1100 + shift} ${y - a * 2}, 1500 ${y + a}`
})
</script>

<template>
  <svg class="topo" :class="tone" viewBox="0 0 1440 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <path v-for="(d, i) in lines" :key="i" :d="d" />
  </svg>
</template>

<style scoped>
.topo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
path {
  fill: none;
  stroke-width: 1.2;
}
.light path {
  stroke: var(--primary);
  stroke-opacity: 0.1;
}
.dark path {
  stroke: #fff;
  stroke-opacity: 0.07;
}
</style>
