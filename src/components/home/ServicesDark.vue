<script setup>
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { services } from '@/data/site'
import { texts } from '@/data/texts'
</script>

<template>
  <section class="services">
    <div class="container inner">
      <header class="head">
        <span class="eyebrow">{{ texts.home.services.eyebrow }}</span>
        <h2>{{ texts.home.services.title }}</h2>
        <p>{{ texts.home.services.text }}</p>
      </header>

      <div class="grid g3">
        <RouterLink v-for="s in services" :key="s.id" :to="{ path: '/services', hash: `#${s.id}` }" class="svc">
          <span class="ico"><BaseIcon :name="s.icon" :size="24" /></span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
          <span class="more">{{ texts.ui.buttons.service_more }} <BaseIcon name="arrow" :size="16" /></span>
        </RouterLink>
      </div>

      <div class="center-row">
        <RouterLink class="btn btn-primary btn-lg" :to="{ name: 'contact' }">
          {{ texts.ui.buttons.request_service }} <BaseIcon name="arrow" :size="18" />
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.services {
  background: var(--ink-panel);
  padding-block: 96px;
  position: relative;
  overflow: hidden;
}
.services::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(40% 50% at 100% 0%, rgba(0, 102, 255, 0.22), transparent 70%),
    radial-gradient(30% 40% at 0% 100%, rgba(0, 102, 255, 0.14), transparent 70%);
  pointer-events: none;
}
.inner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 48px;
}
.head {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 640px;
  margin-inline: auto;
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #6ea8ff;
  font-size: 14px;
  font-weight: 700;
}
.eyebrow::before,
.eyebrow::after {
  content: '';
  width: 22px;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
}
.head h2 {
  color: #fff;
  font-size: clamp(28px, 3.6vw, 40px);
}
.head p {
  color: var(--ink-text);
  font-size: 17px;
}
.svc {
  background: #fff;
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.25s, box-shadow 0.25s;
}
.svc:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 48px -16px rgba(0, 102, 255, 0.45);
}
.ico {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: var(--primary-soft);
  color: var(--primary-600);
  transition: background 0.25s, color 0.25s;
}
.svc:hover .ico {
  background: var(--primary);
  color: #fff;
}
.svc h3 {
  font-size: 20px;
}
.svc p {
  color: var(--muted);
  font-size: 15px;
}
.more {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-600);
  font-weight: 700;
  font-size: 15px;
  padding-top: 6px;
}
</style>
