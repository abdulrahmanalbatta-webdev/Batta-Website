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

// صفحة التواصل: تسأل الزائر أولاً "كيف أقدر أساعدك؟" وتعرض النموذج المناسب له:
// - عندي مشروع: نموذج طلب المشروع (يصل لطلبات المشاريع في لوحة التحكم) بنوعه وميزانيته.
// - أنا طالب: رسالة بموضوعها (دورة، ورشة، الحساب…) والدورة أو الورشة المقصودة (تصل للرسائل في اللوحة).
// - استفسار عام: رسالة عادية.
// الرابط يحفظ الاختيار (?type=project|student|general)، و?course= أو ?workshop= تفتح نموذج الطالب على الدورة أو الورشة.
const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const { student } = useAuth()
const { email, whatsapp, whatsappUrl } = useContact()
const socials = computed(() => profile.socials.filter((s) => s.url))

const AUDIENCES = [
  { id: 'project', icon: 'briefcase', title: 'عندي مشروع', text: 'موقع أو تطبيق أو متجر تريد بناءه' },
  { id: 'student', icon: 'award', title: 'أنا طالب', text: 'سؤال عن دورة أو ورشة أو حسابك' },
  { id: 'general', icon: 'chat', title: 'استفسار عام', text: 'أي شيء آخر تريد قوله' },
]
const audienceFromRoute = () => {
  const { type, course, workshop, service } = route.query
  if (AUDIENCES.some((a) => a.id === type)) return type
  if (course || workshop) return 'student'
  if (service) return 'project'
  return student.value ? 'student' : 'project'
}
const audience = ref(audienceFromRoute())
watch(() => route.query, () => (audience.value = audienceFromRoute()))
// a signed-in student who landed on the default choice sees the student form once their account loads
watch(student, (s) => s && !route.query.type && !route.query.service && (audience.value = 'student'))
function choose(id) {
  audience.value = id
  router.replace({ query: { ...route.query, type: id } })
}

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

const sending = ref(false)
async function submit() {
  sending.value = true
  const service = services.find((s) => s.title === form.value.type)
  try {
    const res = await api.post('project-requests', {
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
    showToast(res.message, 4000)
    form.value = emptyForm()
  } catch (err) {
    showToast(Object.values(err.errors ?? {})[0] || err.message, 4500)
  } finally {
    sending.value = false
  }
}

/* ---------- student and general messages ---------- */
const TOPICS = [
  { id: 'course', label: 'سؤال عن دورة' },
  { id: 'workshop', label: 'سؤال عن ورشة' },
  { id: 'account', label: 'مشكلة في حسابي' },
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
  try {
    const res = await api.post('contact', {
      // a signed-in student writes into their own conversation; the server takes the name and email from the account
      name: student.value?.name ?? note.value.name,
      email: student.value?.email ?? note.value.email,
      message: note.value.message,
      topic: isStudent ? note.value.topic : null,
      about: isStudent ? about.value || null : null,
      website: note.value.website,
    })
    showToast(res.message, 4000)
    note.value = { ...emptyMessage(), topic: note.value.topic }
  } catch (err) {
    showToast(Object.values(err.errors ?? {})[0] || err.message, 4500)
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div>
    <PageHero :title="texts.ui.pages.contact" :subtitle="texts.pages.contact.text" />

    <section class="page-body">
      <div class="container stack">
        <div class="choose" role="radiogroup" aria-label="كيف أقدر أساعدك؟">
          <h2>كيف أقدر أساعدك؟</h2>
          <div class="choices">
            <button v-for="a in AUDIENCES" :key="a.id" type="button" role="radio" class="card choice" :aria-checked="audience === a.id" @click="choose(a.id)">
              <span class="ico-box"><BaseIcon :name="a.icon" /></span>
              <span><b>{{ a.title }}</b><small>{{ a.text }}</small></span>
              <span class="tick"><BaseIcon name="check" :size="14" /></span>
            </button>
          </div>
        </div>

        <div class="contact">
          <aside class="side">
            <div v-if="whatsappUrl || email" class="card channels">
              <h2>تواصل مباشر</h2>
              <a v-if="whatsappUrl" class="channel" :href="whatsappUrl" target="_blank" rel="noopener">
                <span class="ico-box green"><BaseIcon name="chat" /></span>
                <span><b>واتساب</b><small dir="ltr">{{ whatsapp }}</small></span>
                <BaseIcon name="arrow" :size="16" class="go" />
              </a>
              <a v-if="email" class="channel" :href="`mailto:${email}`">
                <span class="ico-box"><BaseIcon name="mail" /></span>
                <span><b>البريد الإلكتروني</b><small dir="ltr">{{ email }}</small></span>
                <BaseIcon name="arrow" :size="16" class="go" />
              </a>
              <div v-if="socials.length" class="socials">
                <a v-for="s in socials" :key="s.name" :href="s.url" target="_blank" rel="noopener" :aria-label="s.name" :title="s.name">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path :d="s.path" fill="currentColor" /></svg>
                </a>
              </div>
            </div>

            <div v-if="audience === 'project' && texts.pages.contact.points.length" class="card points">
              <div v-for="p in texts.pages.contact.points" :key="p.title" class="row">
                <span class="ico-box"><BaseIcon :name="p.icon" /></span>
                <div><h4>{{ p.title }}</h4><p>{{ p.text }}</p></div>
              </div>
            </div>

            <div v-if="audience === 'student'" class="card points">
              <h2>قد تجد جوابك هنا</h2>
              <RouterLink v-if="student" class="channel" to="/my-courses"><span class="ico-box"><BaseIcon name="user" /></span><span><b>تسجيلاتي</b><small>الدورات والورش المسجّل فيها</small></span><BaseIcon name="arrow" :size="16" class="go" /></RouterLink>
              <RouterLink v-else class="channel" :to="{ name: 'login', query: { next: '/contact?type=student' } }"><span class="ico-box"><BaseIcon name="lock" /></span><span><b>تسجيل الدخول</b><small>ومن هناك "نسيت كلمة المرور؟"</small></span><BaseIcon name="arrow" :size="16" class="go" /></RouterLink>
              <RouterLink class="channel" to="/courses"><span class="ico-box"><BaseIcon name="play" /></span><span><b>الدورات</b><small>التفاصيل والتسجيل المجاني</small></span><BaseIcon name="arrow" :size="16" class="go" /></RouterLink>
              <RouterLink class="channel" to="/workshops"><span class="ico-box"><BaseIcon name="calendar" /></span><span><b>الورش القادمة</b><small>المواعيد والمقاعد المتبقية</small></span><BaseIcon name="arrow" :size="16" class="go" /></RouterLink>
            </div>
          </aside>

          <form v-if="audience === 'project'" class="card form" @submit.prevent="submit">
            <div class="full head">
              <span class="eyebrow">{{ texts.pages.contact.eyebrow }}</span>
              <h2>{{ texts.pages.contact.title }}</h2>
            </div>
            <label class="field-label">الاسم<input v-model="form.name" class="input" required /></label>
            <label class="field-label">البريد الإلكتروني<input v-model="form.email" class="input" type="email" dir="ltr" required /></label>
            <label class="field-label">رقم واتساب (اختياري)<input v-model="form.phone" class="input" type="tel" dir="ltr" placeholder="+970 59 000 0000" /></label>
            <label class="field-label">الشركة (اختياري)<input v-model="form.company" class="input" /></label>
            <!-- bot trap: never shown (display: none, so browsers and password managers don't autofill it); a filled one means a bot -->
            <div hidden aria-hidden="true"><input v-model="form.website" type="text" name="hp_extra" tabindex="-1" autocomplete="off" /></div>
            <label class="field-label">نوع المشروع
              <select v-model="form.type" class="input"><option v-for="t in projectTypes" :key="t">{{ t }}</option></select>
            </label>
            <label class="field-label">الميزانية التقريبية
              <select v-model="form.budget" class="input"><option v-for="b in budgets" :key="b.label">{{ b.label }}</option></select>
            </label>
            <label class="field-label full">تفاصيل مختصرة
              <textarea v-model="form.details" class="input" rows="5" placeholder="ما الذي تريد بناءه؟ ومتى تحتاجه؟" required minlength="10" />
            </label>
            <div class="full"><button class="btn btn-primary btn-lg" type="submit" :disabled="sending">{{ sending ? 'جارٍ الإرسال…' : 'إرسال الطلب' }}</button></div>
          </form>

          <form v-else class="card form" @submit.prevent="sendMessage">
            <div class="full head">
              <h2>{{ audience === 'student' ? texts.pages.contact.student_title : texts.pages.contact.general_title }}</h2>
              <p v-if="audience === 'student'" class="muted">{{ texts.pages.contact.student_text }}</p>
            </div>
            <p v-if="student" class="full signed">
              <BaseIcon name="user" :size="16" />ترسل باسم <b>{{ student.name }}</b> ويصلك الرد على <span dir="ltr">{{ student.email }}</span>
            </p>
            <template v-else>
              <label class="field-label">الاسم<input v-model="note.name" class="input" required /></label>
              <label class="field-label">البريد الإلكتروني<input v-model="note.email" class="input" type="email" dir="ltr" required /></label>
            </template>
            <div hidden aria-hidden="true"><input v-model="note.website" type="text" name="hp_extra" tabindex="-1" autocomplete="off" /></div>
            <template v-if="audience === 'student'">
              <label class="field-label">الموضوع
                <select v-model="note.topic" class="input"><option v-for="t in TOPICS" :key="t.id" :value="t.id">{{ t.label }}</option></select>
              </label>
              <label v-if="note.topic === 'course'" class="field-label">الدورة
                <select v-model="note.course" class="input">
                  <option value="">اختر الدورة</option>
                  <option v-for="c in courseOptions" :key="c.slug" :value="c.slug">{{ c.title }}</option>
                </select>
              </label>
              <label v-else-if="note.topic === 'workshop'" class="field-label">الورشة
                <select v-model="note.workshop" class="input">
                  <option value="">اختر الورشة</option>
                  <option v-for="w in workshopOptions" :key="w.id" :value="String(w.id)">{{ w.title }}</option>
                </select>
              </label>
            </template>
            <label class="field-label full">رسالتك
              <textarea v-model="note.message" class="input" rows="6" :placeholder="audience === 'student' ? 'اكتب سؤالك بالتفصيل، وإن كانت مشكلة فاذكر ما ظهر لك…' : 'كيف أقدر أساعدك؟'" required minlength="10" maxlength="5000" />
            </label>
            <div class="full"><button class="btn btn-primary btn-lg" type="submit" :disabled="sending">{{ sending ? 'جارٍ الإرسال…' : 'إرسال الرسالة' }}</button></div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.choose h2 {
  font-size: 20px;
  margin-bottom: 14px;
}
.choices {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
.choice {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  text-align: start;
  font: inherit;
  color: inherit;
  cursor: pointer;
  border: 1.5px solid var(--line);
  transition:
    border-color 0.2s,
    background 0.2s,
    transform 0.2s;
}
.choice:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
}
.choice[aria-checked='true'] {
  border-color: var(--primary);
  background: var(--primary-soft);
}
.choice > span:nth-child(2) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.choice b {
  color: var(--fg);
  font-size: 16px;
}
.choice small {
  color: var(--muted);
  font-size: 13px;
}
.tick {
  position: absolute;
  top: 10px;
  inset-inline-end: 10px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--primary);
  color: #fff;
  opacity: 0;
  transform: scale(0.6);
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.choice[aria-checked='true'] .tick {
  opacity: 1;
  transform: none;
}
.points h2 {
  font-size: 17px;
}
.signed {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-radius: var(--r-sm);
  background: var(--tint);
  font-size: 14px;
}
.muted {
  color: var(--muted);
  margin-top: 4px;
}
.contact {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 24px;
  align-items: start;
}
.side {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.channels,
.points {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.channels h2 {
  font-size: 19px;
}
.channel {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: var(--r);
  color: inherit;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.channel:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}
.channel > span:nth-child(2) {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.channel small {
  color: var(--muted);
  text-align: start;
}
.go {
  color: var(--muted);
}
.ico-box.green {
  background: var(--green-soft);
  color: var(--green);
}
.socials {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.socials a {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  border: 1px solid var(--line);
  color: var(--text);
}
.socials a:hover {
  color: var(--primary);
  border-color: var(--primary);
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
  padding: 28px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.eyebrow {
  color: var(--primary-600);
  font-weight: 700;
  font-size: 14px;
}
.head h2 {
  font-size: 24px;
  margin-top: 4px;
}
.full {
  grid-column: 1 / -1;
}
@media (max-width: 860px) {
  .choices {
    grid-template-columns: minmax(0, 1fr);
  }
  .choice {
    flex-direction: row;
    padding: 14px 16px;
  }
  .contact {
    grid-template-columns: 1fr;
  }
  .form {
    order: -1;
  }
}
@media (max-width: 620px) {
  .form {
    grid-template-columns: 1fr;
    padding: 20px;
  }
}
</style>
