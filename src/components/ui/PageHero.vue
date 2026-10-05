<script setup>
import TopoPattern from '@/components/ui/TopoPattern.vue'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
})
</script>

<template>
  <section class="page-hero">
    <TopoPattern tone="dark" />
    <div class="container inner">
      <nav class="crumbs" aria-label="مسار التنقل">
        <RouterLink to="/">الرئيسية</RouterLink>
        <span class="sep">/</span>
        <span>{{ title }}</span>
      </nav>
      <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
      <div v-if="$slots.default" class="facts"><slot /></div>
    </div>
  </section>
</template>

<style scoped>
.page-hero {
  position: relative;
  overflow: hidden;
  background: var(--ink-panel);
  padding-block: 72px 64px;
  isolation: isolate;
}
.page-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(45% 90% at 85% 0%, rgba(0, 102, 255, 0.35), transparent 70%),
    radial-gradient(35% 80% at 0% 100%, rgba(0, 102, 255, 0.18), transparent 70%);
}
.page-hero::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(110, 168, 255, 0.5), transparent);
}
.inner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.crumbs {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  font-size: 13.5px;
  color: var(--ink-text);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 99px;
  padding: 4px 14px;
}
.crumbs a:hover {
  color: #fff;
}
.sep {
  opacity: 0.5;
}
.eyebrow {
  color: #6ea8ff;
  font-weight: 700;
  font-size: 14px;
}
h1 {
  color: #fff;
  font-size: clamp(32px, 4.6vw, 50px);
}
p {
  color: var(--ink-text);
  font-size: 18px;
  max-width: 640px;
}
.facts {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
  font-size: 14px;
  color: #d5dbe5;
}
.facts :deep(span) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 99px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.facts :deep(b) {
  color: #fff;
}
.facts :deep(.icon) {
  color: #6ea8ff;
}
</style>
