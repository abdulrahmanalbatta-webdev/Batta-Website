<script setup>
import BrandLogo from '@/components/ui/BrandLogo.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { texts } from '@/data/texts'

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})

</script>

<template>
  <div class="auth">
    <section class="form-side">
      <div class="top">
        <RouterLink to="/" aria-label="العودة للرئيسية"><BrandLogo :size="38" /></RouterLink>
        <RouterLink to="/" class="back"><BaseIcon name="arrow" :size="16" />العودة للموقع</RouterLink>
      </div>

      <div class="form-wrap">
        <header class="head">
          <h1>{{ title }}</h1>
          <p v-if="subtitle">{{ subtitle }}</p>
        </header>
        <slot />
      </div>

      <p class="legal">© Batta · جميع الحقوق محفوظة</p>
    </section>

    <aside class="brand-side" aria-hidden="true">
      <div class="brand-inner">
        <BrandLogo :size="72" :with-name="false" inverse />
        <h2>{{ texts.general.auth.title }}</h2>
        <ul>
          <li v-for="p in texts.general.auth.perks" :key="p.text">
            <span class="ico"><BaseIcon :name="p.icon" :size="20" /></span>{{ p.text }}
          </li>
        </ul>
        <figure class="quote">
          <blockquote>{{ texts.general.auth.quote }}</blockquote>
          <figcaption>{{ texts.general.auth.quote_by }}</figcaption>
        </figure>
      </div>
    </aside>
  </div>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  min-height: 100dvh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  background: var(--surface);
}
.form-side {
  display: flex;
  flex-direction: column;
  padding: 28px clamp(20px, 5vw, 64px);
  gap: 24px;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: var(--muted);
}
.back:hover {
  color: var(--primary-600);
}
.form-wrap {
  width: min(420px, 100%);
  margin: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.head h1 {
  font-size: 30px;
}
.head p {
  color: var(--muted);
  margin-top: 6px;
}
.legal {
  font-size: 13px;
  color: var(--muted);
  text-align: center;
}

.brand-side {
  background: var(--ink-panel);
  color: var(--ink-text);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 48px clamp(28px, 5vw, 72px);
}
.brand-side::before {
  content: '';
  position: absolute;
  inset-inline-start: -120px;
  bottom: -120px;
  width: 420px;
  height: 420px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 102, 255, 0.4), transparent 70%);
}
.brand-side::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 22px 22px;
}
.brand-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 460px;
}
h2 {
  color: #fff;
  font-size: clamp(26px, 2.6vw, 34px);
  line-height: 1.5;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  font-size: 16px;
  color: #d5dbe5;
}
li {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ico {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(0, 102, 255, 0.18);
  color: #6ea8ff;
  flex: none;
}
.quote {
  margin: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 22px;
}
.quote blockquote {
  margin: 0;
  color: #fff;
  font-size: 16px;
  line-height: 1.9;
}
.quote figcaption {
  margin-top: 8px;
  font-size: 13.5px;
}

@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .brand-side {
    display: none;
  }
}
</style>
