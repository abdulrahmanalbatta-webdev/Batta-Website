<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { services } from '@/data/site'
import { profile } from '@/data/profile'
import { texts } from '@/data/texts'
import { useContact } from '@/composables/useSettings'
import { useToast } from '@/composables/useToast'
import { api } from '@/lib/api'

// صفحة التواصل: نموذج طلب مشروع (يصل لطلبات المشاريع في لوحة التحكم) وطرق التواصل المباشر.
// النصوص والميزانيات من لوحة التحكم (محتوى الموقع ← نصوص الصفحات ← صفحة التواصل)، وواتساب والبريد من الإعدادات.
const route = useRoute()
const { showToast } = useToast()
const { email, whatsapp, whatsappUrl } = useContact()
const socials = computed(() => profile.socials.filter((s) => s.url))

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
</script>

<template>
  <div>
    <PageHero :title="texts.ui.pages.contact" :subtitle="texts.pages.contact.text" />

    <section class="page-body">
      <div class="container contact">
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

          <div v-if="texts.pages.contact.points.length" class="card points">
            <div v-for="p in texts.pages.contact.points" :key="p.title" class="row">
              <span class="ico-box"><BaseIcon :name="p.icon" /></span>
              <div><h4>{{ p.title }}</h4><p>{{ p.text }}</p></div>
            </div>
          </div>
        </aside>

        <form class="card form" @submit.prevent="submit">
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
      </div>
    </section>
  </div>
</template>

<style scoped>
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
