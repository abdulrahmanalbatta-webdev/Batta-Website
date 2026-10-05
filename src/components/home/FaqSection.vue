<script setup>
import { ref } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { faqs } from '@/data/site'

const open = ref(0)
const toggle = (i) => (open.value = open.value === i ? -1 : i)
</script>

<template>
  <section class="section faq">
    <div class="container grid-faq">
      <div class="intro">
        <span class="eyebrow">أسئلة شائعة</span>
        <h2>إجابات واضحة قبل أن تبدأ</h2>
        <p>تفاصيل عملية عن المدة، والدفع، وملكية الكود، والدورات. لم تجد سؤالك؟</p>
        <RouterLink class="btn btn-dark" :to="{ path: '/services', hash: '#contact' }">اسألني مباشرة <BaseIcon name="arrow" :size="16" /></RouterLink>
      </div>

      <div class="list">
        <div v-for="(f, i) in faqs" :key="f.q" class="item" :class="{ open: open === i }">
          <h3>
            <button
              :id="`faq-q-${i}`"
              type="button"
              :aria-expanded="open === i"
              :aria-controls="`faq-a-${i}`"
              @click="toggle(i)"
            >
              <span>{{ f.q }}</span>
              <span class="sign" aria-hidden="true" />
            </button>
          </h3>
          <div :id="`faq-a-${i}`" class="answer" role="region" :aria-labelledby="`faq-q-${i}`">
            <div class="answer-inner"><p>{{ f.a }}</p></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid-faq {
  display: grid !important;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 56px;
  align-items: start;
}
.intro {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: flex-start;
  position: sticky;
  top: calc(var(--header-h) + 24px);
}
.eyebrow {
  color: var(--primary-600);
  font-size: 14px;
  font-weight: 700;
}
h2 {
  font-size: clamp(28px, 3.4vw, 38px);
}
.intro p {
  color: var(--muted);
  font-size: 17px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.item {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.item.open {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}
h3 {
  font-size: 17px;
}
button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: none;
  border: 0;
  padding: 20px 22px;
  text-align: right;
  font-weight: 800;
  color: var(--fg);
  cursor: pointer;
}
.sign {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--tint-2);
  position: relative;
  flex: none;
  transition: background 0.2s;
}
.sign::before,
.sign::after {
  content: '';
  position: absolute;
  inset: 50% auto auto 50%;
  width: 12px;
  height: 2px;
  background: var(--fg);
  border-radius: 2px;
  transform: translate(-50%, -50%);
  transition: transform 0.25s, background 0.2s;
}
.sign::after {
  transform: translate(-50%, -50%) rotate(90deg);
}
.open .sign {
  background: var(--primary);
}
.open .sign::before,
.open .sign::after {
  background: #fff;
}
.open .sign::after {
  transform: translate(-50%, -50%) rotate(0deg);
}
.answer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}
.open .answer {
  grid-template-rows: 1fr;
}
.answer-inner {
  overflow: hidden;
}
.answer p {
  padding: 0 22px 20px;
  color: var(--muted);
  font-size: 15.5px;
  line-height: 1.9;
}
@media (max-width: 900px) {
  .grid-faq {
    grid-template-columns: minmax(0, 1fr);
    gap: 32px;
  }
  .intro {
    position: static;
  }
}
</style>
