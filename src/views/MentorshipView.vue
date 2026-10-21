<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { api } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { mentorship as copy } from '@/data/mentorship'
import { walletLogo } from '@/data/wallets'

// صفحة الإرشاد: التعريف بالخدمة والباقات، ثم الطلب على ثلاث خطوات بجانبه ملخّص الطلب.
// الباقات والمقاعد من لوحة التحكم (GET mentorship). الطلب يحتاج حساباً، فالطالب يتابعه ويدفع من صفحة "طلب الإرشاد".
const router = useRouter()
const { student, ready } = useAuth()
const { showToast } = useToast()

const config = ref({ accepting: false, enabled: false, seats_left: null, capacity: null, payment_hours: 24, payment_methods: ['بال باي', 'جوال باي'], packages: copy.packages, policy: '' })
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

// a signed-in student with a request still going follows it instead of applying again
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
const seatsKnown = computed(() => config.value.enabled && config.value.seats_left !== null && config.value.capacity)
const seatsTaken = computed(() => (seatsKnown.value ? config.value.capacity - config.value.seats_left : 0))
const seatsText = computed(() => {
  const n = config.value.seats_left
  if (!seatsKnown.value) return ''
  if (n === 0) return 'المقاعد مكتملة هذا الشهر'
  return n === 1 ? 'متبقي مقعد واحد هذا الشهر' : n === 2 ? 'متبقي مقعدان هذا الشهر' : `متبقي ${n} ${n <= 10 ? 'مقاعد' : 'مقعداً'} هذا الشهر`
})
const closedText = computed(() => {
  if (!loaded.value) return ''
  if (!config.value.enabled) return 'استقبال طلبات الإرشاد مغلق حالياً. تابعني لتعرف موعد فتح المقاعد القادمة.'
  if (!config.value.accepting) return 'المقاعد مكتملة حالياً. يمكنك المحاولة لاحقاً عند توفّر مقعد.'
  return ''
})

/* ---------- the application: package → about you → review ---------- */
const STEPS = ['الباقة', 'عنك', 'المراجعة والإرسال']
const step = ref(0)
const form = reactive({ package_id: 'monthly', goal: '', background: '', links: '', availability: '', accept_policy: false })
const errors = ref({})
const sending = ref(false)
watch(
  () => config.value.packages,
  (list) => list.some((p) => p.id === form.package_id) || (form.package_id = (list.find((p) => p.featured) ?? list[0])?.id),
  { immediate: true },
)
const chosen = computed(() => config.value.packages.find((p) => p.id === form.package_id) ?? config.value.packages[0])
const price = (p) => `${Number(p?.price ?? 0).toLocaleString('en-US')} ₪`

function scrollToApply() {
  document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function choose(id) {
  form.package_id = id
  step.value = 0
  scrollToApply()
}

function aboutErrors() {
  const e = {}
  if (form.goal.trim().length < 10) e.goal = 'اكتب هدفك في جملة واحدة على الأقل (10 أحرف).'
  if (form.background.trim().length < 10) e.background = 'اكتب مستواك وما تعلّمته (10 أحرف على الأقل).'
  if (!form.availability.trim()) e.availability = 'اكتب الأوقات المناسبة لك.'
  return e
}
async function next() {
  if (step.value === 1) {
    errors.value = aboutErrors()
    if (Object.keys(errors.value).length) return
  }
  step.value = Math.min(step.value + 1, STEPS.length - 1)
  await nextTick()
  scrollToApply()
}
const back = () => (step.value = Math.max(0, step.value - 1))

async function submit() {
  if (!form.accept_policy) return (errors.value = { accept_policy: 'وافق على سياسة الإلغاء والاسترجاع للمتابعة.' })
  sending.value = true
  errors.value = {}
  try {
    await api.post('me/mentorship', { ...form, links: form.links || null })
    showToast('وصل طلبك، وسأردّ عليك خلال يومين.', 4500)
    router.push({ name: 'my-mentorship' })
  } catch (err) {
    errors.value = err.errors ?? {}
    if (errors.value.goal || errors.value.background || errors.value.availability) step.value = 1
    showToast(errors.value.mentorship || Object.values(errors.value)[0] || err.message, 4500)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="mentorship">
    <!-- ---------- hero ---------- -->
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-text">
          <span class="badge"><span class="live" />{{ copy.eyebrow }}<template v-if="seatsText"> · {{ seatsText }}</template></span>
          <h1>{{ copy.title }}</h1>
          <p class="lead">{{ copy.subtitle }}</p>
          <div class="cta">
            <button type="button" class="btn btn-primary btn-lg" @click="scrollToApply">قدّم طلبك <BaseIcon name="arrow" :size="18" /></button>
            <a class="btn btn-ghost btn-lg" href="#packages">الباقات والأسعار</a>
          </div>
          <ul class="trust">
            <li v-for="t in copy.trust" :key="t"><BaseIcon name="check" :size="16" />{{ t }}</li>
          </ul>
        </div>

        <!-- an illustration of what the mentorship looks like -->
        <div class="hero-art" aria-hidden="true">
          <div class="mentor-card">
            <div class="plan">
              <small>خطتك الشخصية</small>
              <ol>
                <li v-for="(p, i) in copy.plan" :key="p" :class="{ done: i < 2, now: i === 2 }">
                  <span class="dot"><BaseIcon v-if="i < 2" name="check" :size="12" /></span>{{ p }}
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ---------- seats ---------- -->
    <div v-if="seatsKnown" class="container seats-wrap">
      <div class="seats">
        <div class="seats-text">
          <BaseIcon name="users" :size="20" />
          <span><b>{{ seatsTaken }} من {{ config.capacity }}</b> مقاعد محجوزة · {{ seatsText }}</span>
        </div>
        <div class="meter" role="progressbar" :aria-valuenow="seatsTaken" aria-valuemin="0" :aria-valuemax="config.capacity">
          <i :style="{ width: `${(seatsTaken / config.capacity) * 100}%` }" />
        </div>
      </div>
    </div>

    <!-- ---------- what it is ---------- -->
    <section class="section">
      <div class="container about">
        <div class="about-text">
          <span class="eyebrow">{{ copy.about.title }}</span>
          <h2>خبرة سنوات، في وقت أقصر</h2>
          <p>{{ copy.about.text }}</p>
        </div>
        <div class="audience">
          <h3>لمن هذه الخدمة؟</h3>
          <div v-for="a in copy.audience" :key="a.text" class="who">
            <span class="ico-box"><BaseIcon :name="a.icon" /></span>
            <p>{{ a.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section tinted">
      <div class="container">
        <SectionHeading eyebrow="ماذا تحصل عليه؟" title="متابعة شخصية حقيقية، لا محتوى عاماً" />
        <ul class="benefits">
          <li v-for="b in copy.benefits" :key="b.text">
            <span class="ico-box"><BaseIcon :name="b.icon" /></span>
            <b>{{ b.text }}</b>
          </li>
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <SectionHeading eyebrow="كيف تعمل الخدمة؟" title="أربع خطوات حتى أول جلسة" />
        <ol class="steps">
          <li v-for="(s, i) in copy.steps" :key="s.title">
            <span class="n">{{ i + 1 }}</span>
            <div>
              <h3>{{ s.title }}</h3>
              <p>{{ s.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- ---------- packages ---------- -->
    <section id="packages" class="section tinted">
      <div class="container">
        <SectionHeading eyebrow="الباقات" title="اختر ما يناسب هدفك" subtitle="الأسعار بالشيكل، والدفع بعد قبول طلبك فقط." />
        <div class="pricing">
          <article v-for="p in config.packages" :key="p.id" class="plan-card" :class="{ featured: p.featured }">
            <span v-if="p.featured" class="ribbon"><BaseIcon name="star" :size="14" filled />الأكثر طلباً</span>
            <h3>{{ p.name }}</h3>
            <p class="desc">{{ p.description }}</p>
            <div class="price">
              <b>{{ price(p) }}</b><small v-if="p.period">/ {{ p.period }}</small>
            </div>
            <button type="button" class="btn btn-block btn-lg" :class="p.featured ? 'btn-primary' : 'btn-dark'" @click="choose(p.id)">اختر {{ p.name }}</button>
            <ul class="features">
              <li v-for="f in p.features" :key="f"><span class="tick"><BaseIcon name="check" :size="14" /></span>{{ f }}</li>
            </ul>
          </article>
        </div>
        <p class="pay-note"><BaseIcon name="shield" :size="18" />الدفع عبر {{ config.payment_methods?.join(' أو ') || 'بال باي أو جوال باي' }} بعد قبول الطلب، مع استرجاع كامل قبل موعد الجلسة الأولى.</p>
      </div>
    </section>

    <!-- ---------- the application ---------- -->
    <section id="apply" class="section apply-section">
      <div class="container apply">
        <div class="apply-main card">
          <header class="apply-head">
            <h2>طلب الانضمام</h2>
            <p>أراجع كل طلب بنفسي وأردّ خلال يومين. لا دفع الآن.</p>
          </header>

          <div v-if="openRequest" class="state">
            <span class="state-ico"><BaseIcon name="clock" :size="28" /></span>
            <h3>لديك طلب قيد المتابعة</h3>
            <p>طلبك {{ openRequest.number }}: {{ openRequest.status_label }}.</p>
            <RouterLink class="btn btn-primary btn-lg" :to="{ name: 'my-mentorship' }">متابعة طلبي <BaseIcon name="arrow" :size="18" /></RouterLink>
          </div>

          <div v-else-if="closedText" class="state">
            <span class="state-ico"><BaseIcon name="lock" :size="28" /></span>
            <h3>الطلبات مغلقة حالياً</h3>
            <p>{{ closedText }}</p>
          </div>

          <div v-else-if="ready && !student" class="state">
            <span class="state-ico"><BaseIcon name="user" :size="28" /></span>
            <h3>سجّل دخولك لتقديم الطلب</h3>
            <p>تحتاج حساباً لتتابع طلبك وتدفع وترفع إشعار التحويل. إنشاء الحساب مجاني ويستغرق دقيقة.</p>
            <div class="row">
              <RouterLink class="btn btn-primary btn-lg" :to="{ name: 'register', query: { next: '/mentorship#apply' } }">إنشاء حساب</RouterLink>
              <RouterLink class="btn btn-ghost btn-lg" :to="{ name: 'login', query: { next: '/mentorship#apply' } }">تسجيل الدخول</RouterLink>
            </div>
          </div>

          <template v-else-if="loaded">
            <ol class="wizard" aria-label="خطوات الطلب">
              <li v-for="(s, i) in STEPS" :key="s" :class="{ done: i < step, now: i === step }">
                <span class="n"><BaseIcon v-if="i < step" name="check" :size="14" /><template v-else>{{ i + 1 }}</template></span>{{ s }}
              </li>
            </ol>

            <!-- 1: the package -->
            <div v-if="step === 0" class="pane">
              <label v-for="p in config.packages" :key="p.id" class="option" :class="{ on: form.package_id === p.id }">
                <input v-model="form.package_id" type="radio" name="package" :value="p.id" />
                <span class="radio" />
                <span class="option-text">
                  <b>{{ p.name }} <span v-if="p.featured" class="pill">الأكثر طلباً</span></b>
                  <small>{{ p.description }}</small>
                </span>
                <span class="option-price">{{ price(p) }}<small v-if="p.period">/ {{ p.period }}</small></span>
              </label>
            </div>

            <!-- 2: about you -->
            <div v-else-if="step === 1" class="pane fields">
              <label class="field-label full">ما هدفك من الإرشاد؟
                <textarea v-model="form.goal" class="input" :class="{ bad: errors.goal }" rows="3" maxlength="1000" placeholder="مثلاً: بناء أول مشروع حقيقي، أو الاستعداد لأول وظيفة" />
                <small v-if="errors.goal" class="err">{{ errors.goal }}</small>
              </label>
              <label class="field-label full">ما مستواك الحالي، وماذا تعلّمت حتى الآن؟
                <textarea v-model="form.background" class="input" :class="{ bad: errors.background }" rows="3" maxlength="1000" />
                <small v-if="errors.background" class="err">{{ errors.background }}</small>
              </label>
              <label class="field-label"><span class="lbl">روابط أعمالك <small>اختياري</small></span>
                <input v-model="form.links" class="input" dir="ltr" maxlength="500" placeholder="GitHub أو بورتفوليو" />
              </label>
              <label class="field-label">الأوقات المناسبة لك
                <input v-model="form.availability" class="input" :class="{ bad: errors.availability }" maxlength="300" placeholder="مثلاً: مساءً بعد الساعة 6" />
                <small v-if="errors.availability" class="err">{{ errors.availability }}</small>
              </label>
            </div>

            <!-- 3: review -->
            <div v-else class="pane">
              <dl class="review">
                <div><dt>الباقة</dt><dd>{{ chosen?.name }}</dd></div>
                <div><dt>هدفك</dt><dd>{{ form.goal }}</dd></div>
                <div><dt>مستواك</dt><dd>{{ form.background }}</dd></div>
                <div v-if="form.links"><dt>روابطك</dt><dd dir="ltr">{{ form.links }}</dd></div>
                <div><dt>الأوقات المناسبة</dt><dd>{{ form.availability }}</dd></div>
              </dl>
              <div class="policy" :class="{ bad: errors.accept_policy }">
                <b><BaseIcon name="shield" :size="16" />سياسة الإلغاء والاسترجاع</b>
                <p>{{ config.policy }}</p>
                <label class="check"><input v-model="form.accept_policy" type="checkbox" /> قرأت السياسة وأوافق عليها</label>
                <small v-if="errors.accept_policy" class="err">{{ errors.accept_policy }}</small>
              </div>
            </div>

            <footer class="wizard-foot">
              <button v-if="step > 0" type="button" class="btn btn-ghost btn-lg" @click="back">رجوع</button>
              <span class="grow" />
              <button v-if="step < STEPS.length - 1" type="button" class="btn btn-primary btn-lg" @click="next">متابعة <BaseIcon name="arrow" :size="18" /></button>
              <button v-else type="button" class="btn btn-primary btn-lg" :disabled="sending" @click="submit">
                <BaseIcon name="lock" :size="18" />{{ sending ? 'جارٍ الإرسال…' : 'إرسال الطلب' }}
              </button>
            </footer>
          </template>
        </div>

        <!-- the order summary, like a checkout -->
        <aside class="summary card">
          <small class="muted">ملخّص الطلب</small>
          <div class="sum-plan">
            <span class="ico-box"><BaseIcon name="target" /></span>
            <div>
              <b>{{ chosen?.name }}</b>
              <small>{{ chosen?.period ? `مدة الباقة: ${chosen.period}` : 'جلسة واحدة' }}</small>
            </div>
          </div>
          <ul class="sum-lines">
            <li><span>سعر الباقة</span><span>{{ price(chosen) }}</span></li>
            <li><span>رسوم إضافية</span><span>0 ₪</span></li>
            <li class="total"><span>الإجمالي</span><b>{{ price(chosen) }}</b></li>
          </ul>
          <div class="sum-note">
            <BaseIcon name="clock" :size="16" />
            <span>تدفع بعد قبول طلبك فقط، ولديك {{ config.payment_hours }} ساعة لإتمام التحويل.</span>
          </div>
          <div class="methods">
            <span v-for="m in config.payment_methods?.length ? config.payment_methods : ['بال باي', 'جوال باي']" :key="m" class="method"><img v-if="walletLogo(m)" :src="walletLogo(m)" alt="" /><BaseIcon v-else name="wallet" :size="16" />{{ m }}</span>
          </div>
        </aside>
      </div>
    </section>

    <!-- ---------- FAQ ---------- -->
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
/* ---------- hero ---------- */
.hero {
  position: relative;
  overflow: hidden;
  padding-block: 72px 56px;
  background:
    radial-gradient(50% 70% at 10% 10%, rgba(0, 102, 255, 0.12), transparent 70%),
    radial-gradient(40% 60% at 95% 30%, rgba(0, 102, 255, 0.1), transparent 70%),
    linear-gradient(180deg, #e8eef9 0%, var(--bg) 100%);
}
.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 56px;
  align-items: center;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--line);
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text);
  box-shadow: var(--shadow-sm);
}
.live {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 0 4px var(--green-soft);
}
.hero h1 {
  margin-top: 18px;
  font-size: clamp(34px, 4.6vw, 54px);
  line-height: 1.25;
  letter-spacing: -0.5px;
}
.lead {
  margin-top: 16px;
  font-size: 18px;
  line-height: 1.9;
  color: var(--text);
  max-width: 560px;
}
.cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}
.trust {
  list-style: none;
  padding: 0;
  margin: 26px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 22px;
  color: var(--muted);
  font-size: 14.5px;
  font-weight: 600;
}
.trust li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.trust .icon {
  color: var(--green);
}

.hero-art {
  position: relative;
  padding: 36px 28px;
}
.mentor-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 30px 60px -20px rgba(11, 13, 18, 0.25);
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.plan > small {
  color: var(--muted);
}
.plan ol {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.plan li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 12px;
  background: var(--bg);
  font-weight: 600;
  color: var(--muted);
}
.plan .dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--line-2);
  display: grid;
  place-items: center;
  flex: none;
}
.plan li.done {
  color: var(--text);
}
.plan li.done .dot {
  background: var(--green);
  border-color: var(--green);
  color: #fff;
}
.plan li.now {
  background: var(--primary-soft);
  color: var(--primary-600);
}
.plan li.now .dot {
  border-color: var(--primary);
  box-shadow: inset 0 0 0 4px var(--surface), inset 0 0 0 9px var(--primary);
}

/* ---------- seats ---------- */
.seats-wrap {
  margin-top: -28px;
  position: relative;
  z-index: 1;
}
.seats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 18px 24px;
  border-radius: 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
}
.seats-text {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  white-space: nowrap;
}
.seats-text .icon {
  color: var(--primary-600);
}
.meter {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background: var(--tint);
  overflow: hidden;
}
.meter i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary), #4d94ff);
}

/* ---------- about ---------- */
.about {
  display: grid !important;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 56px;
  align-items: center;
}
.eyebrow {
  color: var(--primary-600);
  font-weight: 700;
  font-size: 14px;
}
.about-text h2 {
  font-size: clamp(26px, 3vw, 36px);
  margin: 8px 0 14px;
}
.about-text p {
  font-size: 17.5px;
  line-height: 2;
  color: var(--text);
}
.audience {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.audience h3 {
  font-size: 18px;
}
.who {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 16px;
  border-radius: 16px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
}
.who p {
  font-weight: 600;
  color: var(--text);
  line-height: 1.7;
}

.benefits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}
.benefits li {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 22px;
  border-radius: 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s, box-shadow 0.2s;
}
.benefits li:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
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
}
.steps li {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.steps .n {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: var(--fg);
  color: #fff;
  font-weight: 800;
  font-size: 19px;
  box-shadow: 0 10px 20px -8px rgba(11, 13, 18, 0.5);
}
.steps li:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 24px;
  inset-inline-start: 60px;
  inset-inline-end: -8px;
  border-top: 2px dashed var(--line-2);
}
.steps h3 {
  font-size: 17px;
  margin-bottom: 4px;
}
.steps p {
  color: var(--muted);
  line-height: 1.8;
}

/* ---------- pricing ---------- */
.pricing {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
  align-items: stretch;
}
.plan-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 30px 26px;
  border-radius: 22px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-sm);
}
.plan-card.featured {
  border: 2px solid transparent;
  background:
    linear-gradient(var(--surface), var(--surface)) padding-box,
    linear-gradient(135deg, var(--primary), #7cb2ff) border-box;
  box-shadow: 0 30px 60px -24px rgba(0, 102, 255, 0.45);
  transform: translateY(-8px);
}
.ribbon {
  position: absolute;
  top: -14px;
  inset-inline-start: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 12.5px;
  font-weight: 700;
}
.plan-card h3 {
  font-size: 20px;
}
.desc {
  color: var(--muted);
  min-height: 52px;
  line-height: 1.75;
}
.price {
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding-block: 4px 6px;
}
.price b {
  font-size: 40px;
  font-weight: 800;
  color: var(--fg);
  letter-spacing: -1px;
}
.price small {
  color: var(--muted);
  font-size: 15px;
}
.features {
  list-style: none;
  margin: 6px 0 0;
  padding: 18px 0 0;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.features li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: var(--text);
}
.tick {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex: none;
  margin-top: 2px;
  background: var(--green-soft);
  color: var(--green);
}
.pay-note {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-weight: 600;
  text-align: center;
}
.pay-note .icon {
  color: var(--green);
}

/* ---------- application ---------- */
.apply {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 28px;
  align-items: start;
}
.apply-main {
  padding: 32px;
  border-radius: 22px;
  gap: 24px;
}
.apply-head h2 {
  font-size: 26px;
}
.apply-head p {
  color: var(--muted);
  margin-top: 4px;
}
.wizard {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.wizard li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 14.5px;
  color: var(--muted);
  padding-bottom: 12px;
  border-bottom: 3px solid var(--line);
}
.wizard .n {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 13px;
  background: var(--tint);
  flex: none;
}
.wizard li.now {
  color: var(--fg);
  border-color: var(--primary);
}
.wizard li.now .n {
  background: var(--primary);
  color: #fff;
}
.wizard li.done {
  color: var(--green);
  border-color: var(--green);
}
.wizard li.done .n {
  background: var(--green);
  color: #fff;
}
.pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  border: 1.5px solid var(--line);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}
.option:hover {
  border-color: var(--line-2);
}
.option.on {
  border-color: var(--primary);
  background: var(--primary-soft);
  box-shadow: 0 0 0 4px rgba(0, 102, 255, 0.08);
}
.option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.radio {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--line-2);
  flex: none;
}
.option.on .radio {
  border-color: var(--primary);
  box-shadow: inset 0 0 0 4px var(--surface), inset 0 0 0 10px var(--primary);
}
.option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.option-text b {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--fg);
}
.option-text small {
  color: var(--muted);
  line-height: 1.6;
}
.option-price {
  font-weight: 800;
  font-size: 18px;
  color: var(--fg);
  white-space: nowrap;
}
.option-price small {
  font-weight: 500;
  font-size: 13px;
  color: var(--muted);
  margin-inline-start: 4px;
}
.fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}
.full {
  grid-column: 1 / -1;
}
.input.bad {
  border-color: var(--rose);
}
.lbl small {
  color: var(--muted);
  font-weight: 500;
}
.err {
  color: var(--rose);
  font-weight: 600;
}
.review {
  margin: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
}
.review div {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 12px;
  padding: 14px 18px;
}
.review div + div {
  border-top: 1px solid var(--line);
}
.review dt {
  color: var(--muted);
  font-weight: 600;
}
.review dd {
  margin: 0;
  color: var(--fg);
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.policy {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px 18px;
  border-radius: 16px;
  background: var(--tint-2);
  border: 1px solid transparent;
}
.policy.bad {
  border-color: var(--rose);
}
.policy b {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--fg);
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
.wizard-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
}
.grow {
  flex: 1;
}
.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 28px 8px 12px;
}
.state p {
  color: var(--muted);
  max-width: 440px;
}
.state-ico {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: grid;
  place-items: center;
  background: var(--primary-soft);
  color: var(--primary-600);
}
.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 8px;
}

.summary {
  position: sticky;
  top: calc(var(--header-h) + 24px);
  padding: 24px;
  border-radius: 22px;
  gap: 16px;
}
.sum-plan {
  display: flex;
  align-items: center;
  gap: 12px;
}
.sum-plan div {
  display: flex;
  flex-direction: column;
}
.sum-plan small {
  color: var(--muted);
}
.sum-lines {
  list-style: none;
  margin: 0;
  padding: 14px 0 0;
  border-top: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.sum-lines li {
  display: flex;
  justify-content: space-between;
  color: var(--muted);
}
.sum-lines .total {
  padding-top: 12px;
  border-top: 1px dashed var(--line-2);
  color: var(--fg);
  font-weight: 700;
}
.sum-lines .total b {
  font-size: 22px;
}
.sum-note {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 12px;
  background: var(--primary-soft);
  color: var(--primary-600);
  font-size: 14px;
  line-height: 1.7;
}
.sum-note .icon {
  margin-top: 4px;
}
.methods {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.method img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.method {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 10px;
  border: 1px solid var(--line);
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text);
}

/* ---------- FAQ ---------- */
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
  border-radius: 16px;
  padding: 4px 20px;
}
.faq summary {
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  font-weight: 700;
  color: var(--fg);
  cursor: pointer;
}
.faq summary::-webkit-details-marker {
  display: none;
}
.faq summary .icon {
  transition: transform 0.2s;
}
.faq details[open] summary .icon {
  transform: rotate(180deg);
}
.faq details p {
  padding-bottom: 18px;
  color: var(--muted);
  line-height: 1.9;
}

@media (max-width: 1080px) {
  .benefits {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 980px) {
  .hero-grid,
  .about,
  .apply {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .hero-art {
    max-width: 520px;
    width: 100%;
    margin-inline: auto;
  }
  .summary {
    position: static;
    order: -1;
  }
  .steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .steps li::after {
    display: none;
  }
  .pricing {
    grid-template-columns: 1fr;
    max-width: 480px;
    margin-inline: auto;
    width: 100%;
  }
  .plan-card.featured {
    transform: none;
  }
}
@media (max-width: 620px) {
  .hero {
    padding-top: 44px;
  }
  .benefits,
  .steps,
  .fields {
    grid-template-columns: 1fr;
  }
  .seats {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .seats-text {
    white-space: normal;
  }
  .apply-main {
    padding: 22px 18px;
  }
  .wizard li {
    font-size: 12.5px;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .option {
    flex-wrap: wrap;
  }
  .option-price {
    width: 100%;
    padding-inline-start: 34px;
  }
  .review div {
    grid-template-columns: 1fr;
    gap: 2px;
  }
  .hero-art {
    padding: 0;
  }
}
</style>
