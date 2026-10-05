<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageHero from '@/components/ui/PageHero.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import FaqSection from '@/components/home/FaqSection.vue'
import { packages, processSteps, services } from '@/data/site'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const { showToast } = useToast()

// "اطلب هذه الخدمة" passes ?service=id → the form's project type is pre-selected
const projectTypes = services.map((s) => s.title)
const typeFromQuery = () => services.find((s) => s.id === route.query.service)?.title ?? projectTypes[0]
const emptyForm = () => ({ name: '', email: '', type: typeFromQuery(), budget: '500$ – 1,500$', details: '' })
const form = ref(emptyForm())
watch(() => route.query.service, () => (form.value.type = typeFromQuery()))

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
const budgets = ['أقل من 500$', '500$ – 1,500$', '1,500$ – 5,000$', 'أكثر من 5,000$']

// TODO: أرسل الطلب إلى API أو خدمة نماذج (Formspree / Resend)
function submit() {
  showToast('وصل طلبك (نموذج تجريبي). سأرد خلال 24 ساعة')
  form.value = emptyForm()
}
</script>

<template>
  <div>
    <PageHero title="الخدمات" subtitle="حلول رقمية متكاملة بسعر واضح ونطاق مكتوب. السعر النهائي بعد مكالمة تعارف مجانية.">
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
              <RouterLink class="btn btn-dark" :to="{ query: { service: s.id }, hash: '#contact' }">
                اطلب هذه الخدمة <BaseIcon name="arrow" :size="16" />
              </RouterLink>
            </div>
          </article>
        </div>

        <SectionHeading eyebrow="الباقات" title="اختر الباقة المناسبة لمرحلة مشروعك" />
        <div class="grid g3 packages">
          <article v-for="p in packages" :key="p.id" class="card pkg" :class="{ popular: p.popular }">
            <span v-if="p.popular" class="ribbon">الأكثر طلباً</span>
            <span class="pill" :class="{ line: !p.popular }">{{ p.label }}</span>
            <h3>{{ p.title }}</h3>
            <div class="price">{{ p.price }} <small>{{ p.priceNote }}</small></div>
            <p>{{ p.desc }}</p>
            <ul>
              <li v-for="f in p.features" :key="f"><BaseIcon name="check" :size="18" />{{ f }}</li>
            </ul>
            <RouterLink class="btn" :class="p.popular ? 'btn-primary' : 'btn-ghost'" :to="{ hash: '#contact' }">احجز مكالمة</RouterLink>
          </article>
        </div>

        <div class="block">
          <SectionHeading eyebrow="طريقة العمل" title="من الفكرة إلى الإطلاق في أربع خطوات" />
          <ol class="steps">
            <li v-for="(s, i) in processSteps" :key="s.title" class="step">
              <span class="n">{{ i + 1 }}</span>
              <h3>{{ s.title }}</h3>
              <p>{{ s.text }}</p>
            </li>
          </ol>
        </div>

        <div id="contact" class="block">
          <SectionHeading eyebrow="تواصل" title="أخبرني عن مشروعك" subtitle="أرد على كل طلب خلال 24 ساعة." />
          <div class="contact">
            <aside class="card side">
              <div class="row"><span class="ico-box"><BaseIcon name="clock" /></span><div><h4>رد خلال 24 ساعة</h4><p>في أيام العمل، من الأحد إلى الخميس.</p></div></div>
              <div class="row"><span class="ico-box"><BaseIcon name="chat" /></span><div><h4>مكالمة مجانية</h4><p>30 دقيقة لفهم مشروعك قبل أي التزام.</p></div></div>
              <div class="row"><span class="ico-box"><BaseIcon name="globe" /></span><div><h4>أعمل عن بُعد</h4><p>مع عملاء في الخليج والأردن وفلسطين وأوروبا.</p></div></div>
            </aside>

            <form class="card form" @submit.prevent="submit">
              <label class="field-label">الاسم<input v-model="form.name" class="input" required /></label>
              <label class="field-label">البريد الإلكتروني<input v-model="form.email" class="input" type="email" required /></label>
              <label class="field-label">نوع المشروع
                <select v-model="form.type" class="input"><option v-for="t in projectTypes" :key="t">{{ t }}</option></select>
              </label>
              <label class="field-label">الميزانية التقريبية
                <select v-model="form.budget" class="input"><option v-for="b in budgets" :key="b">{{ b }}</option></select>
              </label>
              <label class="field-label full">تفاصيل مختصرة
                <textarea v-model="form.details" class="input" rows="4" placeholder="ما الذي تريد بناءه؟ ومتى تحتاجه؟" />
              </label>
              <div class="full"><button class="btn btn-primary btn-lg" type="submit">إرسال الطلب</button></div>
            </form>
          </div>
        </div>
      </div>
    </section>

    <FaqSection class="tinted" />
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
.contact {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 24px;
}
.side {
  gap: 18px;
}
.row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.row h4 {
  font-size: 15px;
}
.row p {
  font-size: 14px;
}
.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.full {
  grid-column: 1 / -1;
}
@media (max-width: 860px) {
  .steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .step::after {
    display: none;
  }
  .contact {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 620px) {
  .form {
    grid-template-columns: 1fr;
  }
}
</style>
