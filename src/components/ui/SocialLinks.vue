<script setup>
import { profile } from '@/data/profile'

defineProps({
  dark: { type: Boolean, default: false },
})
</script>

<template>
  <ul class="socials" :class="{ dark }">
    <li v-for="s in profile.socials" :key="s.name">
      <a :href="s.url" target="_blank" rel="noopener noreferrer" :aria-label="s.name" :title="s.name">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="s.path" /></svg>
      </a>
    </li>
  </ul>
</template>

<style scoped>
.socials {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
a {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--fg);
  transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s;
}
a:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
  transform: translateY(-2px);
}
svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
}
.dark a {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: #d5dbe5;
}
.dark a:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
</style>
