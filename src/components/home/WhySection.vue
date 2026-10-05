<script setup>
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { reasons } from '@/data/site'
import { texts } from '@/data/texts'
import { useStats } from '@/composables/useContent'

const stats = useStats()
</script>

<template>
  <section class="section tinted why">
    <div class="container grid-why">
      <div class="copy">
        <span class="eyebrow">{{ texts.home.why.eyebrow }}</span>
        <h2>{{ texts.home.why.title }}</h2>
        <p class="lead">{{ texts.home.why.text }}</p>
        <ul>
          <li v-for="r in reasons" :key="r">
            <span class="check"><BaseIcon name="check" :size="16" /></span>{{ r }}
          </li>
        </ul>
        <RouterLink class="btn btn-dark btn-lg" :to="{ path: '/services', hash: '#contact' }">
          {{ texts.ui.buttons.consult }} <BaseIcon name="arrow" :size="18" />
        </RouterLink>
      </div>

      <div class="stats">
        <div v-for="s in stats" :key="s.label" class="stat">
          <span class="ico-box"><BaseIcon :name="s.icon" /></span>
          <b>{{ s.value }}</b>
          <span class="lbl">{{ s.label }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid-why {
  display: grid !important;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 64px;
  align-items: center;
}
.copy {
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: flex-start;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--primary-600);
  font-size: 14px;
  font-weight: 700;
}
.eyebrow::after {
  content: '';
  width: 22px;
  height: 2px;
  border-radius: 2px;
  background: var(--primary);
}
h2 {
  font-size: clamp(28px, 3.6vw, 40px);
}
.lead {
  color: var(--muted);
  font-size: 17.5px;
  max-width: 560px;
}
ul {
  list-style: none;
  padding: 0;
  margin: 6px 0 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 24px;
  width: 100%;
}
li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-weight: 600;
  color: var(--fg);
  font-size: 15px;
  line-height: 1.7;
}
.check {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: grid;
  place-items: center;
  flex: none;
  margin-top: 2px;
}
.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.stat {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: var(--shadow-sm);
}
.stat:nth-child(2),
.stat:nth-child(3) {
  background: var(--ink-panel);
  border-color: var(--ink-panel);
}
.stat:nth-child(2) b,
.stat:nth-child(3) b {
  color: #fff;
}
.stat:nth-child(2) .lbl,
.stat:nth-child(3) .lbl {
  color: var(--ink-text);
}
.stat:nth-child(2) .ico-box,
.stat:nth-child(3) .ico-box {
  background: rgba(0, 102, 255, 0.2);
  color: #6ea8ff;
}
.stat b {
  font-size: 40px;
  font-weight: 800;
  color: var(--fg);
  line-height: 1.2;
  margin-top: 10px;
  font-variant-numeric: tabular-nums;
}
.lbl {
  color: var(--muted);
  font-weight: 600;
}
@media (max-width: 980px) {
  .grid-why {
    grid-template-columns: minmax(0, 1fr);
    gap: 40px;
  }
}
@media (max-width: 620px) {
  ul {
    grid-template-columns: 1fr;
  }
  .stat {
    padding: 20px 18px;
  }
  .stat b {
    font-size: 30px;
  }
}
</style>
