<script setup>
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { services } from '@/data/site'
import { profile } from '@/data/profile'
import { texts } from '@/data/texts'
import { useContact } from '@/composables/useSettings'
import { useAuth } from '@/composables/useAuth'
import { useCourses, useWorkshops } from '@/composables/useContent'
import { useToast } from '@/composables/useToast'
import { api } from '@/lib/api'

// صفحة التواصل: لوحة واحدة، جانبها الداكن يتغيّر حسب الزائر (العنوان، الوعود، قنوات التواصل)، وفوق النموذج تبويبات:
// - مشروع جديد: نموذج طلب المشروع (يصل لطلبات المشاريع في لوحة التحكم) بنوعه وميزانيته.
// - أنا طالب: رسالة بموضوعها (دورة، ورشة، الحساب…) والدورة أو الورشة المقصودة (تصل للرسائل في اللوحة).
// - استفسار عام: رسالة عادية.
// الرابط يحفظ الاختيار (?type=project|student|general)، و?course= أو ?workshop= تفتح تبويب الطالب على الدورة أو الورشة.
// بعد الإرسال تظهر شاشة تأكيد مكان النموذج.
const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const { student } = useAuth()
const { email, whatsapp, whatsappUrl } = useContact()
const socials = computed(() => profile.socials.filter((s) => s.url))

const AUDIENCES = [
  { id: 'project', icon: 'briefcase', label: 'مشروع جديد', hint: 'موقع أو تطبيق أو متجر تريد بناءه' },
  { id: 'student', icon: 'award', label: 'أنا طالب', hint: 'سؤال عن دورة أو ورشة أو حسابك' },
  { id: 'general', icon: 'chat', label: 'استفسار عام', hint: 'أي شيء آخر تريد قوله' },
]
const audienceFromRoute = () => {
  const { type, course, workshop, service } = route.query
  if (AUDIENCES.some((a) => a.id === type)) return type
  if (course || workshop) return 'student'
  if (service) return 'project'
  return student.value ? 'student' : 'project'
}
const audience = ref(audienceFromRoute())
const audienceIndex = computed(() => AUDIENCES.findIndex((a) => a.id === audience.value))
watch(() => route.query, () => (audience.value = audienceFromRoute()))
// a signed-in student who landed on the default choice sees the student form once their account loads
watch(student, (s) => s && !route.query.type && !route.query.service && (audience.value = 'student'))
function choose(id) {
  sent.value = null
  audience.value = id
  router.replace({ query: { ...route.query, type: id } })
}
// arrow keys move between the tabs, as in any tab list
function onTabKey(e) {
  const step = { ArrowLeft: 1, ArrowRight: -1 }[e.key]
  if (!step) return
  const next = AUDIENCES[(audienceIndex.value + step + AUDIENCES.length) % AUDIENCES.length]
  choose(next.id)
  document.getElementById(`tab-${next.id}`)?.focus()
}

// the dark side: its heading and promises follow the chosen tab (the texts come from the dashboard)
const STUDENT_PROMISES = [
  { icon: 'clock', title: 'رد خلال يوم عمل', text: 'على بريدك، ومعه رابط لما تحتاجه.' },
  { icon: 'award', title: 'التسجيل مجاني', text: 'في كل الدورات والورش، بضغطة من صفحتها.' },
  { icon: 'users', title: 'لست وحدك', text: 'اسأل في تعليقات الدورة أيضاً، ويجيبك الطلاب والمدرّب.' },
]
const GENERAL_PROMISES = [
  { icon: 'clock', title: 'رد خلال 24 ساعة', text: 'في أيام العمل، من الأحد إلى الخميس.' },
  { icon: 'mail', title: 'على بريدك مباشرة', text: 'بلا قوائم بريدية ولا رسائل مزعجة.' },
]
const side = computed(() => {
  const c = texts.pages.contact
  if (audience.value === 'student') return { eyebrow: 'دعم الطلاب', title: c.student_title, text: c.student_text, points: STUDENT_PROMISES }
  if (audience.value === 'general') return { eyebrow: 'تواصل', title: c.general_title, text: 'سؤال، فكرة، أو تعاون؟ اكتب لي وأرد عليك بنفسي.', points: GENERAL_PROMISES }
  return { eyebrow: c.eyebrow, title: c.title, text: c.text, points: c.points }
})

// after sending: { title, text } shown in place of the form
const sent = ref(null)
const sending = ref(false)
const fail = (err) => showToast(Object.values(err.errors ?? {})[0] || err.message, 4500)

/* ---------- project request ---------- */
// "اطلب هذه الخدمة" passes ?service=id → the form's project type is pre-selected
const projectTypes = computed(() => services.map((s) => s.title))
const typeFromQuery = () => services.find((s) => s.id === route.query.service)?.title ?? projectTypes.value[0]
// the second budget option is the usual starting point
const budgets = computed(() => texts.pages.contact.budgets)
const defaultBudget = () => (budgets.value[1] ?? budgets.value[0])?.label ?? ''
const emptyForm = () => ({ name: '', email: '', phone: '', company: '', type: typeFromQuery(), budget: defaultBudget(), details: '', website: '' })
const form = ref(emptyForm())
watch(() => route.query.service, () => (form.value.type = typeFromQuery()))
// the dashboard's options can arrive after the form was filled with the bundled ones
watch(budgets, (list) => list.some((b) => b.label === form.value.budget) || (form.value.budget = defaultBudget()))
watch(projectTypes, (types) => types.includes(form.value.type) || (form.value.type = typeFromQuery()))

async function submit() {
  sending.value = true
  const service = services.find((s) => s.title === form.value.type)
  try {
    await api.post('project-requests', {
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone || null,
      company: form.value.company || null,
      // the dashboard's project types are these same services (by id)
      service: service?.id ?? services[0]?.id,
      // the dashboard keeps the budget as a number (the amount set beside each option)
      budget: Number(budgets.value.find((b) => b.label === form.value.budget)?.amount) || null,
      details: `${form.value.details}\n\nالميزانية المتوقعة: ${form.value.budget}`,
      website: form.value.website,
    })
    sent.value = { title: `شكراً ${form.value.name}، وصل طلبك`, text: `أراجع تفاصيل مشروعك وأرد عليك على ${form.value.email} خلال 24 ساعة بخطوات واضحة.` }
    form.value = emptyForm()
  } catch (err) {
    fail(err)
  } finally {
    sending.value = false
  }
}

/* ---------- student and general messages ---------- */
const TOPICS = [
  { id: 'course', label: 'دورة' },
  { id: 'workshop', label: 'ورشة' },
  { id: 'account', label: 'حسابي' },
  { id: 'suggestion', label: 'اقتراح' },
  { id: 'other', label: 'شيء آخر' },
]
// the course and workshop lists load only when the student form is shown
const catalog = shallowRef(null)
watch(
  audience,
  (a) => {
    if (a === 'student' && !catalog.value) catalog.value = { courses: useCourses().items, workshops: useWorkshops().items }
  },
  { immediate: true },
)
const courseOptions = computed(() => catalog.value?.courses.value ?? [])
const workshopOptions = computed(() => catalog.value?.workshops.value ?? [])

const emptyMessage = () => ({
  name: '',
  email: '',
  topic: route.query.workshop ? 'workshop' : 'course',
  course: String(route.query.course ?? ''),
  workshop: String(route.query.workshop ?? ''),
  message: '',
  website: '',
})
const note = ref(emptyMessage())
watch(() => [route.query.course, route.query.workshop], () => Object.assign(note.value, { topic: emptyMessage().topic, course: emptyMessage().course, workshop: emptyMessage().workshop }))

// what the message is about, sent beside the topic so the team sees it above the message
const about = computed(() => {
  if (note.value.topic === 'course') return courseOptions.value.find((c) => c.slug === note.value.course)?.title ?? ''
  if (note.value.topic === 'workshop') return workshopOptions.value.find((w) => String(w.id) === note.value.workshop)?.title ?? ''
  return ''
})

async function sendMessage() {
  sending.value = true
  const isStudent = audience.value === 'student'
  const name = student.value?.name ?? note.value.name
  const replyTo = student.value?.email ?? note.value.email
  try {
    await api.post('contact', {
      // a signed-in student writes into their own conversation; the server takes the name and email from the account
      name,
      email: replyTo,
      message: note.value.message,
      topic: isStudent ? note.value.topic : null,
      about: isStudent ? about.value || null : null,
      website: note.value.website,
    })
    sent.value = { title: `شكراً ${name.split(' ')[0]}، وصلت رسالتك`, text: `أرد عليك على ${replyTo} ${isStudent ? 'خلال يوم عمل' : 'خلال 24 ساعة'}.` }
    note.value = { ...emptyMessage(), topic: note.value.topic }
  } catch (err) {
    fail(err)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div>
    <PageHero :title="texts.ui.pages.contact" :subtitle="texts.pages.contact.text" />

    <section class="page-body">
      <div class="container">
        <div class="shell">
          <!-- the dark side: who you're talking to and what to expect -->
          <aside class="panel">
            <Transition name="fade" mode="out-in">
              <div :key="audience" class="panel-copy">
                <span class="eyebrow">{{ side.eyebrow }}</span>
                <h2>{{ side.title }}</h2>
                <p class="lead">{{ side.text }}</p>
                <ul class="promises">
                  <li v-for="p in side.points" :key="p.title">
                    <span class="p-ico"><BaseIcon :name="p.icon" :size="18" /></span>
                    <div><b>{{ p.title }}</b><span>{{ p.text }}</span></div>
                  </li>
                </ul>
              </div>
            </Transition>

            <div v-if="whatsappUrl || email || socials.length" class="direct">
              <span class="direct-label">أو تواصل مباشرة</span>
              <a v-if="whatsappUrl" class="line" :href="whatsappUrl" target="_blank" rel="noopener">
                <BaseIcon name="chat" :size="18" /><span dir="ltr">{{ whatsapp }}</span>
              </a>
              <a v-if="email" class="line" :href="`mailto:${email}`">
                <BaseIcon name="mail" :size="18" /><span dir="ltr">{{ email }}</span>
              </a>
              <div v-if="socials.length" class="socials">
                <a v-for="s in socials" :key="s.name" :href="s.url" target="_blank" rel="noopener" :aria-label="s.name" :title="s.name">
                  <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path :d="s.path" fill="currentColor" /></svg>
                </a>
              </div>
            </div>
          </aside>

          <div class="main">
            <div class="tabs" role="tablist" aria-label="نوع التواصل" :style="{ '--i': audienceIndex }" @keydown="onTabKey">
              <span class="thumb" aria-hidden="true" />
              <button
                v-for="a in AUDIENCES"
                :id="`tab-${a.id}`"
                :key="a.id"
                type="button"
                role="tab"
                :aria-selected="audience === a.id"
                :tabindex="audience === a.id ? 0 : -1"
                aria-controls="contact-panel"
                @click="choose(a.id)"
              >
                <BaseIcon :name="a.icon" :size="17" />{{ a.label }}
              </button>
            </div>
            <p class="tab-hint">{{ AUDIENCES[audienceIndex].hint }}</p>

            <div id="contact-panel" role="tabpanel" :aria-labelledby="`tab-${audience}`">
              <Transition name="swap" mode="out-in">
                <!-- sent: a calm confirmation instead of the form -->
                <div v-if="sent" key="sent" class="done">
                  <span class="done-ico"><BaseIcon name="check" :size="30" /></span>
                  <h3>{{ sent.title }}</h3>
                  <p>{{ sent.text }}</p>
                  <div class="done-actions">
                    <button type="button" class="btn btn-ghost" @click="sent = null">إرسال رسالة أخرى</button>
                    <RouterLink v-if="audience === 'student'" class="btn btn-soft" to="/courses">تصفّح الدورات</RouterLink>
                    <RouterLink v-else class="btn btn-soft" to="/services">تعرّف على الخدمات</RouterLink>
                  </div>
                </div>

                <form v-else-if="audience === 'project'" key="project" class="form" @submit.prevent="submit">
                  <label class="field-label">الاسم<input v-model="form.name" class="input" autocomplete="name" required /></label>
                  <label class="field-label">البريد الإلكتروني<input v-model="form.email" class="input" type="email" dir="ltr" autocomplete="email" required /></label>
                  <label class="field-label"><span class="lbl">رقم واتساب <small>اختياري</small></span><input v-model="form.phone" class="input" type="tel" dir="ltr" autocomplete="tel" placeholder="+970 59 000 0000" /></label>
                  <label class="field-label"><span class="lbl">الشركة <small>اختياري</small></span><input v-model="form.company" class="input" autocomplete="organization" /></label>
                  <!-- bot trap: never shown (display: none, so browsers and password managers don't autofill it); a filled one means a bot -->
                  <div hidden aria-hidden="true"><input v-model="form.website" type="text" name="hp_extra" tabindex="-1" autocomplete="off" /></div>
                  <label class="field-label full">نوع المشروع
                    <select v-model="form.type" class="input"><option v-for="t in projectTypes" :key="t">{{ t }}</option></select>
                  </label>
                  <fieldset class="full chips-field">
                    <legend class="field-label">الميزانية التقريبية</legend>
                    <div class="chips">
                      <label v-for="b in budgets" :key="b.label" class="chip">
                        <input v-model="form.budget" type="radio" name="budget" :value="b.label" />
                        <span>{{ b.label }}</span>
                      </label>
                    </div>
                  </fieldset>
                  <label class="field-label full">تفاصيل مختصرة
                    <textarea v-model="form.details" class="input" rows="5" placeholder="ما الذي تريد بناءه؟ ولمن؟ ومتى تحتاجه؟" required minlength="10" />
                  </label>
                  <div class="full submit">
                    <button class="btn btn-primary btn-lg" type="submit" :disabled="sending">{{ sending ? 'جارٍ الإرسال…' : 'إرسال الطلب' }}<BaseIcon v-if="!sending" name="arrow" :size="18" /></button>
                    <small>بدون أي التزام، الرد الأول مجاني.</small>
                  </div>
                </form>

                <form v-else :key="audience" class="form" @submit.prevent="sendMessage">
                  <p v-if="student" class="full signed">
                    <span class="avatar">{{ student.name.slice(0, 1) }}</span>
                    <span>ترسل باسم <b>{{ student.name }}</b>، والرد يصلك على <span dir="ltr">{{ student.email }}</span></span>
                  </p>
                  <template v-else>
                    <label class="field-label">الاسم<input v-model="note.name" class="input" autocomplete="name" required /></label>
                    <label class="field-label">البريد الإلكتروني<input v-model="note.email" class="input" type="email" dir="ltr" autocomplete="email" required /></label>
                  </template>
                  <div hidden aria-hidden="true"><input v-model="note.website" type="text" name="hp_extra" tabindex="-1" autocomplete="off" /></div>

                  <template v-if="audience === 'student'">
                    <fieldset class="full chips-field">
                      <legend class="field-label">سؤالك عن</legend>
                      <div class="chips">
                        <label v-for="t in TOPICS" :key="t.id" class="chip">
                          <input v-model="note.topic" type="radio" name="topic" :value="t.id" />
                          <span>{{ t.label }}</span>
                        </label>
                      </div>
                    </fieldset>
                    <Transition name="grow">
                      <label v-if="note.topic === 'course'" key="course" class="field-label full">أي دورة؟
                        <select v-model="note.course" class="input">
                          <option value="">اختر الدورة (اختياري)</option>
                          <option v-for="c in courseOptions" :key="c.slug" :value="c.slug">{{ c.title }}</option>
                        </select>
                      </label>
                      <label v-else-if="note.topic === 'workshop'" key="workshop" class="field-label full">أي ورشة؟
                        <select v-model="note.workshop" class="input">
                          <option value="">اختر الورشة (اختياري)</option>
                          <option v-for="w in workshopOptions" :key="w.id" :value="String(w.id)">{{ w.title }}</option>
                        </select>
                      </label>
                    </Transition>
                  </template>

                  <label class="field-label full">رسالتك
                    <textarea
                      v-model="note.message"
                      class="input"
                      rows="6"
                      :placeholder="audience === 'student' ? 'اكتب سؤالك بالتفصيل، وإن كانت مشكلة فاذكر ما ظهر لك…' : 'كيف أقدر أساعدك؟'"
                      required
                      minlength="10"
                      maxlength="5000"
                    />
                  </label>
                  <div class="full submit">
                    <button class="btn btn-primary btn-lg" type="submit" :disabled="sending">{{ sending ? 'جارٍ الإرسال…' : 'إرسال الرسالة' }}<BaseIcon v-if="!sending" name="arrow" :size="18" /></button>
                    <span v-if="audience === 'student'" class="quick">
                      أسرع:
                      <RouterLink v-if="student" to="/my-courses">تسجيلاتي</RouterLink>
                      <RouterLink v-else :to="{ name: 'login', query: { next: '/contact?type=student' } }">تسجيل الدخول</RouterLink>
                      · <RouterLink to="/courses">الدورات</RouterLink> · <RouterLink to="/workshops">الورش</RouterLink>
                    </span>
                  </div>
                </form>
              </Transition>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* one surface, two sides */
.shell {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

/* the dark side */
.panel {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 32px;
  padding: 36px 32px;
  color: #fff;
  background:
    radial-gradient(120% 60% at 100% 0%, rgba(0, 102, 255, 0.35), transparent 60%),
    radial-gradient(80% 50% at 0% 100%, rgba(0, 102, 255, 0.18), transparent 60%),
    var(--cover);
  isolation: isolate;
}
.panel::after {
  /* a faint grid, so the dark doesn't feel flat */
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(to bottom, #000, transparent 75%);
}
.eyebrow {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  color: #8cb8ff;
  letter-spacing: 0.02em;
}
.panel h2 {
  margin-top: 8px;
  font-size: 26px;
  line-height: 1.35;
  color: #fff;
}
.lead {
  margin-top: 10px;
  color: var(--ink-text);
  font-size: 15px;
  line-height: 1.8;
}
.promises {
  list-style: none;
  padding: 0;
  margin: 26px 0 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.promises li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.p-ico {
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #8cb8ff;
}
.promises b {
  display: block;
  font-size: 15px;
  color: #fff;
}
.promises span {
  font-size: 13.5px;
  color: var(--ink-text);
}
.direct {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
.direct-label {
  font-size: 12.5px;
  color: var(--ink-text);
}
.line {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-weight: 600;
  font-size: 14.5px;
  width: fit-content;
}
.line:hover {
  color: #8cb8ff;
}
.socials {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}
.socials a {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition:
    background 0.2s,
    border-color 0.2s;
}
.socials a:hover {
  background: rgba(255, 255, 255, 0.14);
  border-color: rgba(255, 255, 255, 0.25);
}

/* the form side */
.main {
  padding: 32px 36px 36px;
  min-width: 0;
}
.tabs {
  --i: 0;
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 5px;
  border-radius: 14px;
  background: var(--tint-2);
  border: 1px solid var(--line);
}
.thumb {
  position: absolute;
  top: 5px;
  bottom: 5px;
  right: 5px;
  width: calc((100% - 10px) / 3);
  border-radius: 10px;
  background: var(--surface);
  box-shadow: var(--shadow-sm), 0 0 0 1px var(--line);
  /* right-to-left: each step moves the thumb one tab to the left */
  transform: translateX(calc(var(--i) * -100%));
  transition: transform 0.35s cubic-bezier(0.3, 0.7, 0.2, 1);
}
.tabs button {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 10px;
  border: 0;
  border-radius: 10px;
  background: none;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  color: var(--muted);
  cursor: pointer;
  transition: color 0.2s;
}
.tabs button:hover {
  color: var(--fg);
}
.tabs button[aria-selected='true'] {
  color: var(--primary-600);
}
.tabs button:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.tab-hint {
  margin: 12px 4px 22px;
  font-size: 14px;
  color: var(--muted);
}

.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 16px;
}
.full {
  grid-column: 1 / -1;
}
.lbl {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.field-label small {
  font-weight: 500;
  color: var(--muted);
  font-size: 12.5px;
}
.chips-field {
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
}
.chips-field legend {
  margin-bottom: 8px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.chip span {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--bg);
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s,
    color 0.15s;
}
.chip span:hover {
  border-color: var(--line-2);
  background: var(--surface);
}
.chip input:checked + span {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary-600);
}
.chip input:focus-visible + span {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
textarea.input {
  resize: vertical;
  min-height: 130px;
}
.submit {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 4px;
}
.submit small,
.quick {
  color: var(--muted);
  font-size: 13.5px;
}
.quick a {
  color: var(--primary-600);
  font-weight: 700;
}
.signed {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--tint-2);
  border: 1px solid var(--line);
  font-size: 14px;
}
.avatar {
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
}

/* sent */
.done {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  padding: 48px 12px 40px;
}
.done-ico {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--green-soft);
  color: var(--green);
  box-shadow: 0 0 0 8px color-mix(in srgb, var(--green-soft) 50%, transparent);
  animation: pop 0.45s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.done h3 {
  margin-top: 10px;
  font-size: 22px;
}
.done p {
  max-width: 420px;
  color: var(--muted);
}
.done-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 12px;
}
@keyframes pop {
  from {
    transform: scale(0.4);
    opacity: 0;
  }
}

/* transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 0.22s,
    transform 0.22s;
}
.swap-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
.grow-enter-active,
.grow-leave-active {
  transition: opacity 0.2s;
}
.grow-enter-from,
.grow-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .thumb,
  .swap-enter-active,
  .swap-leave-active,
  .fade-enter-active,
  .fade-leave-active,
  .done-ico {
    transition: none;
    animation: none;
  }
}

@media (max-width: 960px) {
  .shell {
    grid-template-columns: minmax(0, 1fr);
  }
  /* the form comes first on small screens; the dark side follows as a footer */
  .panel {
    order: 2;
    padding: 28px 22px;
  }
  .main {
    padding: 22px 18px 26px;
  }
}
@media (max-width: 560px) {
  .form {
    grid-template-columns: minmax(0, 1fr);
  }
  .tabs button {
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    padding: 9px 4px;
  }
}
</style>
