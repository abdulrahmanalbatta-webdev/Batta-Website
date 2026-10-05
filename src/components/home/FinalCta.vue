<script setup>
import BaseIcon from '@/components/ui/BaseIcon.vue'
import TopoPattern from '@/components/ui/TopoPattern.vue'
import { texts } from '@/data/texts'
</script>

<template>
  <section class="final">
    <TopoPattern tone="dark" />
    <div class="container inner">
      <span class="eyebrow">{{ texts.home.cta.eyebrow }}</span>
      <h2>{{ texts.home.cta.title }}</h2>
      <p>{{ texts.home.cta.text }}</p>
      <div class="actions">
        <RouterLink class="btn btn-primary btn-lg" :to="{ path: '/services', hash: '#contact' }">
          ابدأ مشروعك الآن <BaseIcon name="arrow" :size="18" />
        </RouterLink>
        <RouterLink class="btn btn-outline-light btn-lg" to="/courses">أو ابدأ التعلّم</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.final {
  position: relative;
  overflow: hidden;
  background: var(--ink-panel);
  padding-block: 104px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.final::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(50% 70% at 50% 100%, rgba(0, 102, 255, 0.3), transparent 70%);
  pointer-events: none;
}
.inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}
.eyebrow {
  color: #6ea8ff;
  font-weight: 700;
  font-size: 15px;
}
h2 {
  color: #fff;
  font-size: clamp(30px, 4.6vw, 52px);
  max-width: 760px;
}
p {
  color: var(--ink-text);
  font-size: 18px;
  max-width: 600px;
}
.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 12px;
}
</style>
