<script setup>
import { computed } from 'vue'
import logoMark from '@/assets/images/logo-dark.png'
import { brand, heroHubs } from '@/data/site'

// شعارك في المنتصف، وما تقدّمه (دورات، ورش، تطوير مواقع…) حوله في بطاقات صغيرة موصولة به بخطوط متحركة.
// القائمة من لوحة التحكم (محتوى الموقع ← الرئيسية ← العنوان الرئيسي ← ما تقدّمه)، حتى 6 بطاقات.

// where each card sits around the logo (centre of the card, in % of the stage)
const SLOTS = [
  [20, 13],
  [80, 17],
  [13, 51],
  [87, 55],
  [24, 89],
  [76, 91],
]
const COLORS = ['#0066ff', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

// the light version of an uploaded logo, unless the name is drawn into it (too wide for the box)
const mark = computed(() => (brand.logoDark && !brand.logoHasName ? brand.logoDark : logoMark))
const hubs = computed(() => heroHubs.slice(0, SLOTS.length).map((text, i) => ({ text, x: SLOTS[i][0], y: SLOTS[i][1], color: COLORS[i] })))
</script>

<template>
  <div class="showcase" aria-label="ما أقدّمه">
    <svg class="links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <line v-for="hub in hubs" :key="hub.text" x1="50" y1="50" :x2="hub.x" :y2="hub.y" />
    </svg>

    <span class="ripple" aria-hidden="true" />
    <div class="core"><img :src="mark" alt="" /></div>

    <ul>
      <li v-for="(hub, i) in hubs" :key="hub.text" :style="{ left: `${hub.x}%`, top: `${hub.y}%`, '--i': i }">
        <span class="hub"><i :style="{ background: hub.color }" />{{ hub.text }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.showcase {
  position: relative;
  min-height: 460px;
  height: 100%;
}
.links {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.links line {
  stroke: rgba(0, 102, 255, 0.3);
  stroke-width: 1.5;
  stroke-dasharray: 4 6;
  vector-effect: non-scaling-stroke;
  animation: dash 20s linear infinite;
}

/* ---------- the logo ---------- */
.core,
.ripple {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 136px;
  height: 136px;
  margin: -68px 0 0 -68px;
  border-radius: 36px;
}
.core {
  display: grid;
  place-items: center;
  background: var(--fg);
  box-shadow:
    0 0 0 14px rgba(0, 102, 255, 0.08),
    0 0 0 30px rgba(0, 102, 255, 0.05),
    0 30px 60px rgba(11, 13, 18, 0.3);
  animation: pop 0.8s cubic-bezier(0.2, 0.8, 0.2, 1.2) both;
}
.core img {
  width: 88px;
  height: 88px;
  object-fit: contain;
}
.ripple {
  border: 2px solid rgba(0, 102, 255, 0.4);
  animation: ripple 3s 0.8s ease-out infinite;
}

/* ---------- what you offer ---------- */
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  position: absolute;
  transform: translate(-50%, -50%);
}
.hub {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: 0 12px 28px rgba(11, 13, 18, 0.08);
  font-weight: 700;
  font-size: 14.5px;
  white-space: nowrap;
  animation:
    pop 0.6s calc(0.3s + var(--i) * 0.1s) both,
    float 6s calc(var(--i) * 0.7s) ease-in-out infinite;
}
.hub i {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex: none;
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
}
@keyframes float {
  50% {
    translate: 0 -8px;
  }
}
@keyframes dash {
  to {
    stroke-dashoffset: -200;
  }
}
@keyframes ripple {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(2.2);
    opacity: 0;
  }
}

@media (max-width: 980px) {
  .showcase {
    min-height: 420px;
    max-width: 560px;
    width: 100%;
    margin-inline: auto;
  }
}
@media (max-width: 520px) {
  .showcase {
    min-height: 360px;
  }
  .core,
  .ripple {
    width: 104px;
    height: 104px;
    margin: -52px 0 0 -52px;
    border-radius: 28px;
  }
  .core img {
    width: 66px;
    height: 66px;
  }
  .hub {
    padding: 8px 11px;
    font-size: 12.5px;
    gap: 6px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .showcase *,
  .showcase *::before {
    animation: none !important;
  }
}
</style>
