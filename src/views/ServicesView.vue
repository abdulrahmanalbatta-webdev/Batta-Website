<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageHero from '@/components/ui/PageHero.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { packages, processSteps, services } from '@/data/site'
import { texts } from '@/data/texts'

const route = useRoute()

// briefly highlight the service card the visitor jumped to (/services#ecommerce)
const flashed = ref('')
let flashTimer
watch(
  () => route.hash,
  (hash) => {
    const id = hash.slice(1)
    if (!services.some((s) => s.id === id)) return
    flashed.value = ''
    clearTimeout(flashTimer)
    requestAnimationFrame(() => (flashed.value = id))
    flashTimer = setTimeout(() => (flashed.value = ''), 2200)
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <PageHero :title="texts.ui.pages.services" :subtitle="texts.pages.services.text">
      <span v-for="s in services" :key="s.id">
        <RouterLink :to="{ hash: `#${s.id}` }" class="jump"><BaseIcon :name="s.icon" :size="16" />{{ s.title }}</RouterLink>
      </span>
    </PageHero>

    <section class="page-body">
      <div class="container stack">
        <div class="services-list">
          <article v-for="s in services" :id="s.id" :key="s.id" class="card service" :class="{ flash: flashed === s.id }">
            <div class="svc-head">
              <span class="svc-ico"><BaseIcon :name="s.icon" :size="26" /></span>
              <div>
                <h3>{{ s.title }}</h3>
                <p>{{ s.text }}</p>
              </div>
            </div>
            <ul class="svc-features">
              <li v-for="f in s.features" :key="f"><BaseIcon name="check" :size="16" />{{ f }}</li>
            </ul>
            <div class="svc-foot">
              <div class="svc-meta">
                <span><small>يبدأ من</small><b>{{ s.from }}</b></span>
                <span><small>المدة</small><b>{{ s.duration }}</b></span>
              </div>
              <RouterLink class="btn btn-dark" :to="{ name: 'contact', query: { service: s.id } }">
                {{ texts.ui.buttons.order_service }} <BaseIcon name="arrow" :size="16" />
              </RouterLink>
            </div>
          </article>
        </div>

        <SectionHeading :eyebrow="texts.pages.packages.eyebrow" :title="texts.pages.packages.title" />
        <div class="grid g3 packages">
          <article v-for="p in packages" :key="p.id" class="card pkg" :class="{ popular: p.popular }">
            <span v-if="p.popular" class="ribbon">{{ texts.ui.buttons.popular }}</span>
            <span class="pill" :class="{ line: !p.popular }">{{ p.label }}</span>
            <h3>{{ p.title }}</h3>
            <div class="price">{{ p.price }} <small>{{ p.priceNote }}</small></div>
            <p>{{ p.desc }}</p>
            <ul>
              <li v-for="f in p.features" :key="f"><BaseIcon name="check" :size="18" />{{ f }}</li>
            </ul>
            <RouterLink class="btn" :class="p.popular ? 'btn-primary' : 'btn-ghost'" :to="{ name: 'contact' }">{{ texts.ui.buttons.book_call }}</RouterLink>
          </article>
        </div>

        <div class="block">
          <SectionHeading :eyebrow="texts.pages.process.eyebrow" :title="texts.pages.process.title" />
          <ol class="steps">
            <li v-for="(s, i) in processSteps" :key="s.title" class="step">
              <span class="n">{{ i + 1 }}</span>
              <h3>{{ s.title }}</h3>
              <p>{{ s.text }}</p>
            </li>
          </ol>
        </div>

      </div>
    </section>

  </div>
</template>

<style scoped>
.stack {
  gap: 72px;
}
.jump {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: inherit;
}
.jump:hover {
  color: #fff;
}

/* ---------- services ---------- */
.services-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
.service {
  padding: 28px;
  gap: 18px;
  scroll-margin-top: calc(var(--header-h) + 24px);
}
.service.flash {
  animation: highlight 2s ease;
}
@keyframes highlight {
  0%, 40% {
    border-color: var(--primary);
    box-shadow: 0 0 0 4px var(--primary-soft), var(--shadow-lg);
  }
}
.svc-head {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.svc-ico {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  flex: none;
  background: var(--primary);
  color: #fff;
  box-shadow: 0 10px 20px -8px rgba(0, 102, 255, 0.55);
}
.svc-head h3 {
  font-size: 21px;
  margin-bottom: 4px;
}
.svc-features {
  list-style: none;
  padding: 16px 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  border-block: 1px solid var(--line);
  font-size: 14.5px;
}
.svc-features li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
}
.svc-features .icon {
  color: var(--green);
}
.svc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: auto;
}
.svc-meta {
  display: flex;
  gap: 24px;
}
.svc-meta span {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}
.svc-meta small {
  font-size: 12px;
  color: var(--muted);
  font-weight: 600;
}
.svc-meta b {
  font-size: 17px;
  color: var(--fg);
}
@media (max-width: 900px) {
  .services-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
@media (max-width: 520px) {
  .svc-features {
    grid-template-columns: 1fr;
  }
}
.block {
  display: flex;
  flex-direction: column;
  gap: 36px;
}
.pkg {
  gap: 16px;
  padding: 28px;
  position: relative;
}
.pkg.popular {
  border: 2px solid var(--primary);
  box-shadow: var(--shadow-lg);
}
.ribbon {
  position: absolute;
  top: -13px;
  inset-inline-start: 24px;
  background: var(--primary);
  color: var(--on-primary);
  font-size: 12.5px;
  font-weight: 800;
  padding: 2px 12px;
  border-radius: 99px;
}
.price {
  font-weight: 800;
  font-size: 26px;
  color: var(--fg);
}
.price small {
  font-size: 14px;
  color: var(--muted);
  font-weight: 600;
}
.pkg ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 15px;
}
.pkg li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.pkg li .icon {
  color: var(--green);
  margin-top: 4px;
}
.pkg .btn {
  margin-top: auto;
}
.steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
}
.step {
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}
.step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 24px;
  inset-inline-start: 60px;
  inset-inline-end: -12px;
  border-top: 2px dashed var(--line-2);
}
.n {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--fg);
  color: var(--bg);
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 18px;
  position: relative;
  z-index: 1;
}
.step h3 {
  font-size: 17px;
}
.step p {
  color: var(--muted);
  font-size: 15px;
}
@media (max-width: 860px) {
  .steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .step::after {
    display: none;
  }
}
</style>
