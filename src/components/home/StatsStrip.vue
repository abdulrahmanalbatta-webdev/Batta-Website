<script setup>
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useStats } from '@/composables/useContent'

const stats = useStats()
</script>

<template>
  <div class="container wrap">
    <div class="stats">
      <div v-for="s in stats" :key="s.label" class="stat">
        <span class="ico-box"><BaseIcon :name="s.icon" /></span>
        <div>
          <b>{{ s.value }}</b>
          <span>{{ s.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  margin-top: -56px;
  position: relative;
  z-index: 2;
}
.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow);
}
.stat {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 14px;
}
.stat + .stat {
  border-inline-start: 1px solid var(--line);
}
b {
  display: block;
  font-size: 26px;
  font-weight: 800;
  color: var(--fg);
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
span {
  font-size: 14px;
  color: var(--muted);
}
@media (max-width: 860px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .stat:nth-child(3) {
    border-inline-start: 0;
  }
  .stat:nth-child(n + 3) {
    border-top: 1px solid var(--line);
  }
}
@media (max-width: 420px) {
  .stat {
    padding: 16px;
  }
  .ico-box {
    display: none;
  }
}
</style>
