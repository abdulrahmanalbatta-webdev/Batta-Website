<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { api } from '@/lib/api'
import { toCourse, useWorkshops } from '@/composables/useContent'
import { useAuth } from '@/composables/useAuth'
import { useSettings } from '@/composables/useSettings'

// التسجيل في دورة أو ورشة: الدفع يدوي.
// 1) يرسل الطالب طلب التسجيل → يصل للفريق في رسائل لوحة التحكم
// 2) يدفع حسب "تعليمات الدفع" ويتواصل على واتساب
// 3) الفريق يسجّل الطلب في اللوحة → تظهر الدورة في "دوراتي"
const route = useRoute()
const { student } = useAuth()
const { settings, price } = useSettings()
const { items: workshops, loading: workshopsLoading } = useWorkshops()

const course = ref(null)
const owned = ref(false)
const loading = ref(false)
const error = ref('')

const workshop = computed(() => (route.query.workshop ? workshops.value.find((w) => String(w.id) === String(route.query.workshop)) : null))
const item = computed(() =>
  course.value
    ? { kind: 'الدورة', title: course.value.title, price: course.value.price }
    : workshop.value
      ? { kind: 'الورشة', title: workshop.value.title, price: workshop.value.free ? 0 : workshop.value.price, when: `${workshop.value.day} ${workshop.value.month} · ${workshop.value.time}` }
      : null,
)

async function load() {
  if (!route.query.course) return
  loading.value = true
  error.value = ''
  try {
    const [res, mine] = await Promise.all([api.get(`courses/${encodeURIComponent(route.query.course)}`), api.get('me/courses')])
    course.value = toCourse(res.data)
    owned.value = mine.data.some((c) => c.slug === course.value.slug)
  } catch (err) {
    error.value = err.status === 404 ? 'الدورة غير موجودة.' : err.message
  } finally {
    loading.value = false
  }
}
watch(() => route.query.course, load, { immediate: true })

const message = computed(() =>
  item.value ? `مرحباً، أريد التسجيل في ${item.value.kind}: ${item.value.title}.\nالاسم: ${student.value?.name}\nالبريد: ${student.value?.email}` : '',
)
const whatsappUrl = computed(() => {
  const digits = String(settings.value?.whatsapp ?? '').replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message.value)}` : null
})

const sent = ref(false)
const sending = ref(false)
const sendError = ref('')
async function sendRequest() {
  sending.value = true
  sendError.value = ''
  try {
    await api.post('contact', { name: student.value.name, email: student.value.email, message: `طلب تسجيل — ${message.value}` })
    sent.value = true
  } catch (err) {
    sendError.value = err.message
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div>
    <PageHero title="التسجيل" eyebrow="الأكاديمية" subtitle="أرسل طلبك، ادفع بالطريقة المناسبة لك، ونفتح لك المحتوى فور تأكيد الدفع." />
    <section class="page-body">
      <div class="container narrow">
        <LoadState v-if="!item" :loading="loading || workshopsLoading" :error="error" :empty="!loading && !workshopsLoading" empty-text="لم نجد ما تريد التسجيل فيه. اختر دورة أو ورشة أولاً." @retry="load" />

        <div v-else-if="owned" class="card step done">
          <BaseIcon name="check" :size="28" />
          <div>
            <h2>الدورة مفتوحة في حسابك</h2>
            <p>يمكنك البدء مباشرة من صفحة دوراتي.</p>
          </div>
          <RouterLink class="btn btn-primary" :to="{ name: 'learn', params: { slug: course.slug } }">ابدأ التعلّم</RouterLink>
        </div>

        <template v-else>
          <div class="card summary">
            <span class="pill">{{ item.kind }}</span>
            <h2>{{ item.title }}</h2>
            <p v-if="item.when" class="muted">{{ item.when }}</p>
            <div class="price">{{ price(item.price) }}</div>
          </div>

          <ol class="steps">
            <li class="card step" :class="{ done: sent }">
              <span class="num">1</span>
              <div>
                <h3>أرسل طلب التسجيل</h3>
                <p>يصلنا طلبك باسمك وبريدك ورقمك، ونتواصل معك على واتساب.</p>
                <p v-if="sent" class="ok"><BaseIcon name="check" :size="16" />وصل طلبك، سنتواصل معك قريباً.</p>
                <p v-if="sendError" class="err">{{ sendError }}</p>
              </div>
              <button v-if="!sent" class="btn btn-primary" type="button" :disabled="sending" @click="sendRequest">{{ sending ? 'جارٍ الإرسال…' : 'أرسل الطلب' }}</button>
            </li>
            <li class="card step">
              <span class="num">2</span>
              <div>
                <h3>ادفع</h3>
                <p v-if="settings?.payment_instructions" class="instructions">{{ settings.payment_instructions }}</p>
                <p v-else>سنرسل لك طريقة الدفع على واتساب (تحويل بنكي، محفظة إلكترونية أو نقداً).</p>
              </div>
            </li>
            <li class="card step">
              <span class="num">3</span>
              <div>
                <h3>أرسل الإيصال على واتساب</h3>
                <p>بعد تأكيد الدفع تظهر {{ item.kind === 'الدورة' ? 'الدورة' : 'الورشة' }} في حسابك.</p>
              </div>
              <a v-if="whatsappUrl" class="btn btn-ghost" :href="whatsappUrl" target="_blank" rel="noopener"><BaseIcon name="chat" :size="18" />واتساب</a>
            </li>
          </ol>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.narrow {
  max-width: 760px;
}
.summary {
  padding: 22px;
  display: grid;
  gap: 8px;
  justify-items: start;
}
.summary h2 {
  font-size: 22px;
}
.price {
  font-size: 26px;
  font-weight: 800;
  color: var(--fg);
}
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}
.step {
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.step > div {
  flex: 1;
}
.step h3 {
  font-size: 18px;
  margin-bottom: 4px;
}
.step p {
  color: var(--muted);
}
.num {
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--primary-soft);
  color: var(--primary-600);
  font-weight: 800;
}
.step.done .num,
.step.done > .icon {
  background: var(--green-soft);
  color: var(--green);
}
.step.done > .icon {
  border-radius: 50%;
  padding: 6px;
}
.instructions {
  white-space: pre-line;
  color: var(--text) !important;
  background: var(--tint);
  padding: 12px 14px;
  border-radius: var(--r-sm);
  margin-top: 6px;
}
.ok {
  color: var(--green) !important;
  font-weight: 700;
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 6px;
}
.err {
  color: var(--rose) !important;
  margin-top: 6px;
}
.muted {
  color: var(--muted);
}
@media (max-width: 600px) {
  .step {
    flex-wrap: wrap;
  }
  .step .btn {
    width: 100%;
  }
}
</style>
