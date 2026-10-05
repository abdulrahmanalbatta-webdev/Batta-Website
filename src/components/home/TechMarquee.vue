<script setup>
import { technologies } from '@/data/site'

// the list is rendered twice so the strip loops without a gap
const loop = [...technologies, ...technologies]
</script>

<template>
  <section class="marquee-section" aria-label="التقنيات التي أعمل بها">
    <p class="label">أبني بأحدث التقنيات المعتمدة عالمياً</p>

    <div class="marquee">
      <ul class="track">
        <li
          v-for="(t, i) in loop"
          :key="i"
          class="logo"
          :style="{ '--brand': t.color }"
          :title="t.name"
          :aria-hidden="i >= technologies.length"
        >
          <svg viewBox="0 0 24 24" role="img" :aria-label="t.name">
            <path :d="t.path" />
          </svg>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.marquee-section {
  padding-block: 44px;
  border-block: 1px solid var(--line);
  background: var(--surface);
}
.label {
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--muted);
  margin-bottom: 26px;
}
.marquee {
  overflow: hidden;
  direction: ltr;
  mask-image: linear-gradient(to right, transparent, #000 10%, #000 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 10%, #000 90%, transparent);
}
.track {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 20px;
  width: max-content;
  animation: scroll 40s linear infinite;
}
.marquee:hover .track {
  animation-play-state: paused;
}
.logo {
  width: 92px;
  height: 72px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: var(--bg);
  display: grid;
  place-items: center;
  flex: none;
  transition: border-color 0.2s, background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.logo svg {
  width: 36px;
  height: 36px;
  fill: var(--brand);
}
.logo:hover {
  background: var(--surface);
  border-color: var(--brand);
  transform: translateY(-3px);
  box-shadow: 0 10px 24px -12px var(--brand);
}
@keyframes scroll {
  to {
    transform: translateX(calc(-50% - 10px));
  }
}
@media (max-width: 620px) {
  .logo {
    width: 72px;
    height: 58px;
  }
  .logo svg {
    width: 28px;
    height: 28px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .marquee {
    overflow-x: auto;
  }
}
</style>
