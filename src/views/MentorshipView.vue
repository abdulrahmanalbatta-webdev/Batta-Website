<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PageHero from '@/components/ui/PageHero.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { api } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { mentorship as copy } from '@/data/mentorship'

// صفحة الإرشاد: التعريف بالخدمة والباقات ونموذج الطلب. الباقات والمقاعد من لوحة التحكم (GET mentorship)؛
// الطلب يحتاج حساباً، فالطالب يتابع طلبه ويرفع إشعار التحويل من صفحة "طلب الإرشاد".
const router = useRouter()
const { student, ready } = useAuth()
const { showToast } = useToast()

const config = ref({ accepting: false, enabled: false, seats_left: null, capacity: null, payment_hours: 24, packages: copy.packages, policy: '' })
const loaded = ref(false)
const openRequest = ref(null)
const OPEN = ['pending', 'accepted', 'proof_submitted', 'paid', 'scheduled']

onMounted(async () => {
  try {
    config.value = (await api.get('mentorship')).data
  } catch {
    /* the bundled packages stay; the form says requests are closed */
  }
  loaded.value = true
})

// a signed-in student with a request still going is sent to follow it instead of applying again
watch(
  () => [ready.value, student.value],
  async ([isReady, who]) => {
    if (!isReady || !who) return (openRequest.value = null)
    try {
      const mine = (await api.get('me/mentorship')).data
      openRequest.value = mine && OPEN.includes(mine.status) ? mine : null
    } catch {
      openRequest.value = null
    }
  },
  { immediate: true },
)

const faqs = computed(() => copy.faqs.map((f) => ({ ...f, a: f.a.replace('{hours}', config.value.payment_hours) })))
const seatsText = computed(() => {
  const n = config.value.seats_left
  if (n === null || !config.value.enabled) return ''
  if (n === 0) return 'المقاعد مكتملة هذا الشهر'
  return n === 1 ? 'متبقي مقعد واحد هذا الشهر' : n === 2 ? 'متبقي مقعدان هذا الشهر' : `متبقي ${n} ${n <= 10 ? 'مقاعد' : 'مقعداً'} هذا الشهر`
})
const closedText = computed(() => {
  if (!loaded.value) return ''
  if (!config.value.enabled) return 'استقبال طلبات الإرشاد مغلق حالياً. تابعني لتعرف موعد فتح المقاعد القادمة.'
  if (!config.value.accepting) return 'المقاعد مكتملة حالياً. يمكنك المحاولة لاحقاً عند توفّر مقعد.'
  return ''
})

const form = reactive({ package_id: 'monthly', goal: '', background: '', links: '', availability: '', accept_policy: false })
const errors = ref({})
const sending = ref(false)
watch(
  () => config.value.packages,
  (list) => list.some((p) => p.id === form.package_id) || (form.package_id = (list.find((p) => p.featured) ?? list[0])?.id),
  { immediate: true },
)

function choose(id) {
  form.package_id = id
  document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function submit() {
  sending.value = true
  errors.value = {}
  try {
    await api.post('me/mentorship', { ...form, links: form.links || null })
    showToast('وصل طلبك، وسأردّ عليك خلال يومين.', 4500)
    router.push({ name: 'my-mentorship' })
  } catch (err) {
    errors.value = err.errors ?? {}
    showToast(errors.value.mentorship || Object.values(errors.value)[0] || err.message, 4500)
  } finally {
    sending.value = false
  }
}

const price = (p) => `${p.price.toLocaleString('en-US')} ₪`
</script>

<template>
  <div>
    <PageHero :eyebrow="copy.eyebrow" :title="copy.title" :subtitle="copy.subtitle">
      <a class="btn btn-primary" href="#apply">قدّم طلبك <BaseIcon name="arrow" :size="16" /></a>
      <span v-if="seatsText" class="seats"><span class="dot" />{{ seatsText }}</span>
    </PageHero>

    <section class="section">
      <div class="container about">
        <div class="about-text">
          <h2>{{ copy.about.title }}</h2>
          <p>{{ copy.about.text }}</p>
        </div>
        <div class="card audience">
          <h3>لمن هذه الخدمة؟</h3>
          <ul>
            <li v-for="a in copy.audience" :key="a.text"><span class="ico-box"><BaseIcon :name="a.icon" /></span>{{ a.text }}</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section tinted">
      <div class="container">
        <SectionHeading eyebrow="ماذا تحصل عليه؟" title="متابعة شخصية حقيقية، لا محتوى عاماً" />
        <ul class="benefits">
          <li v-for="b in copy.benefits" :key="b.text" class="card"><span class="ico-box"><BaseIcon :name="b.icon" /></span><b>{{ b.text }}</b></li>
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <SectionHeading eyebrow="كيف تعمل الخدمة؟" title="أربع خطوات حتى أول جلسة" />
        <ol class="steps">
          <li v-for="(s, i) in copy.steps" :key="s.title">
            <span class="n">{{ i + 1 }}</span>
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="section tinted">
      <div class="container">
        <SectionHeading eyebrow="الباقات" title="اختر ما يناسب هدفك" />
        <div class="grid g3 packages">
          <article v-for="p in config.packages" :key="p.id" class="card package" :class="{ featured: p.featured }">
            <span v-if="p.featured" class="pill">الأكثر طلباً</span>
            <h3>{{ p.name }}</h3>
            <div class="price">
              <b>{{ price(p) }}</b><small v-if="p.period">/ {{ p.period }}</small>
            </div>
            <p>{{ p.description }}</p>
            <ul class="features">
              <li v-for="f in p.features" :key="f"><BaseIcon name="check" :size="16" />{{ f }}</li>
            </ul>
            <button type="button" class="btn btn-block" :class="p.featured ? 'btn-primary' : 'btn-ghost'" @click="choose(p.id)">اختر هذه الباقة</button>
          </article>
        </div>
      </div>
    </section>

    <section id="apply" class="section apply-section">
      <div class="container apply">
        <div class="apply-intro">
          <span class="eyebrow">طلب الانضمام</span>
          <h2>قدّم طلبك</h2>
          <p>أراجع كل طلب بنفسي وأردّ خلال يومين. بعد القبول تظهر لك تفاصيل الدفع، ولديك {{ config.payment_hours }} ساعة لرفع إشعار التحويل.</p>
          <p v-if="seatsText" class="seats-line"><BaseIcon name="users" :size="18" />{{ seatsText }}</p>
        </div>

        <div class="card apply-card">
          <div v-if="openRequest" class="state">
            <BaseIcon name="clock" :size="28" />
            <h3>لديك طلب قيد المتابعة</h3>
            <p>طلبك {{ openRequest.number }}: {{ openRequest.status_label }}.</p>
            <RouterLink class="btn btn-primary" :to="{ name: 'my-mentorship' }">متابعة طلبي</RouterLink>
          </div>

          <div v-else-if="closedText" class="state">
            <BaseIcon name="lock" :size="28" />
            <h3>الطلبات مغلقة حالياً</h3>
            <p>{{ closedText }}</p>
          </div>

          <div v-else-if="ready && !student" class="state">
            <BaseIcon name="user" :size="28" />
            <h3>سجّل دخولك لتقديم الطلب</h3>
            <p>تحتاج حساباً لتتابع طلبك وترفع إشعار التحويل. إنشاء الحساب مجاني.</p>
            <div class="row">
              <RouterLink class="btn btn-primary" :to="{ name: 'register', query: { next: '/mentorship#apply' } }">إنشاء حساب</RouterLink>
              <RouterLink class="btn btn-ghost" :to="{ name: 'login', query: { next: '/mentorship#apply' } }">تسجيل الدخول</RouterLink>
            </div>
          </div>

          <form v-else-if="loaded" class="form" @submit.prevent="submit">
            <fieldset class="full">
              <legend class="field-label">الباقة</legend>
              <div class="choices">
                <label v-for="p in config.packages" :key="p.id" class="choice" :class="{ on: form.package_id === p.id }">
                  <input v-model="form.package_id" type="radio" name="package" :value="p.id" />
                  <b>{{ p.name }}</b>
                  <small>{{ price(p) }}<template v-if="p.period"> / {{ p.period }}</template></small>
                </label>
              </div>
            </fieldset>
            <label class="field-label full">ما هدفك من الإرشاد؟
              <textarea v-model="form.goal" class="input" rows="3" required minlength="10" maxlength="1000" placeholder="مثلاً: بناء أول مشروع حقيقي، أو الاستعداد لأول وظيفة" />
              <small v-if="errors.goal" class="err">{{ errors.goal }}</small>
            </label>
            <label class="field-label full">ما مستواك الحالي، وماذا تعلّمت حتى الآن؟
              <textarea v-model="form.background" class="input" rows="3" required minlength="10" maxlength="1000" />
              <small v-if="errors.background" class="err">{{ errors.background }}</small>
            </label>
            <label class="field-label"><span class="lbl">روابط أعمالك <small>اختياري</small></span>
              <input v-model="form.links" class="input" dir="ltr" maxlength="500" placeholder="GitHub أو بورتفوليو" />
            </label>
            <label class="field-label">الأوقات المناسبة لك
              <input v-model="form.availability" class="input" required maxlength="300" placeholder="مثلاً: مساءً بعد الساعة 6" />
            </label>
            <div class="policy full">
              <b>سياسة الإلغاء والاسترجاع</b>
              <p>{{ config.policy }}</p>
              <label class="check"><input v-model="form.accept_policy" type="checkbox" required /> قرأت السياسة وأوافق عليها</label>
            </div>
            <button class="btn btn-primary btn-lg full" :disabled="sending">{{ sending ? 'جارٍ الإرسال…' : 'أرسل الطلب' }}</button>
          </form>
        </div>
      </div>
    </section>

    <section class="section tinted">
      <div class="container narrow">
        <SectionHeading eyebrow="أسئلة شائعة" title="قبل أن تقدّم طلبك" />
        <div class="faq">
          <details v-for="f in faqs" :key="f.q">
            <summary>{{ f.q }}<BaseIcon name="chevron-down" :size="18" /></summary>
            <p>{{ f.a }}</p>
          </details>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.seats {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #d5dbe5;
  font-weight: 700;
  font-size: 14.5px;
}
.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.2);
}

.about {
  display: grid !important;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 48px;
  align-items: center;
}
.about-text h2 {
  font-size: clamp(26px, 3vw, 34px);
  margin-bottom: 14px;
}
.about-text p {
  font-size: 17.5px;
  line-height: 2;
  color: var(--text);
}
.audience ul,
.benefits,
.features {
  list-style: none;
  margin: 0;
  padding: 0;
}
.audience ul {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.audience li {
  display: flex;
  gap: 12px;
  align-items: center;
  font-weight: 600;
}

.benefits {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}
.benefits li {
  align-items: flex-start;
}
.benefits b {
  color: var(--fg);
  line-height: 1.6;
}

.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  counter-reset: step;
}
.steps li {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.steps .n {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--fg);
  color: #fff;
  font-weight: 800;
  font-size: 18px;
}
.steps li:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 22px;
  inset-inline-start: 56px;
  inset-inline-end: -8px;
  border-top: 2px dashed var(--line-2);
}
.steps p {
  color: var(--muted);
}

.package {
  gap: 14px;
}
.package.featured {
  border: 2px solid var(--primary);
  box-shadow: var(--shadow-lg);
}
.price b {
  font-size: 34px;
  font-weight: 800;
  color: var(--fg);
}
.price small {
  color: var(--muted);
  margin-inline-start: 6px;
  font-size: 15px;
}
.features {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 6px;
}
.features li {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  color: var(--text);
}
.features .icon {
  color: var(--green);
  margin-top: 4px;
}
.package .btn {
  margin-top: auto;
}

.apply {
  display: grid !important;
  grid-template-columns: minmax(0, 0.75fr) minmax(0, 1.25fr);
  gap: 48px;
  align-items: start;
}
.apply-intro {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: calc(var(--header-h) + 24px);
}
.eyebrow {
  color: var(--primary-600);
  font-weight: 700;
  font-size: 14px;
}
.apply-intro h2 {
  font-size: clamp(26px, 3vw, 34px);
}
.apply-intro p {
  color: var(--muted);
  line-height: 1.9;
}
.seats-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--green) !important;
  font-weight: 700;
}
.apply-card {
  padding: 28px;
}
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 24px 8px;
}
.state .icon {
  color: var(--primary-600);
}
.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 6px;
}
.form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.full {
  grid-column: 1 / -1;
}
fieldset {
  border: 0;
  margin: 0;
  padding: 0;
}
.choices {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 8px;
}
.choice {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  cursor: pointer;
  background: var(--bg);
}
.choice.on {
  border-color: var(--primary);
  background: var(--primary-soft);
}
.choice input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.choice small {
  color: var(--muted);
}
.lbl small {
  color: var(--muted);
  font-weight: 500;
}
.err {
  color: var(--rose);
  font-weight: 600;
}
.policy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--tint-2);
}
.policy p {
  color: var(--muted);
  font-size: 14.5px;
  line-height: 1.8;
}
.check {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-weight: 700;
  cursor: pointer;
}
.check input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
}

.narrow {
  max-width: 820px;
}
.faq {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.faq details {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 4px 18px;
}
.faq summary {
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  font-weight: 700;
  color: var(--fg);
  cursor: pointer;
}
.faq summary::-webkit-details-marker {
  display: none;
}
.faq details[open] summary .icon {
  transform: rotate(180deg);
}
.faq details p {
  padding-bottom: 16px;
  color: var(--muted);
  line-height: 1.9;
}

@media (max-width: 980px) {
  .about,
  .apply {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .apply-intro {
    position: static;
  }
  .benefits {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .steps li::after {
    display: none;
  }
}
@media (max-width: 620px) {
  .benefits,
  .steps,
  .form,
  .choices {
    grid-template-columns: 1fr;
  }
}
</style>
