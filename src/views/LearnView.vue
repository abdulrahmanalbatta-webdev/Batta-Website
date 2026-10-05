<script setup>
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { api } from '@/lib/api'
import { useToast } from '@/composables/useToast'
import { siteTitle } from '@/router'

// دورة في حساب الطالب: المنهج مع إنهاء الدروس، والتقدّم، وتقييمه للدورة
const props = defineProps({
  slug: { type: String, required: true },
})
const { showToast } = useToast()

const course = ref(null)
const completed = ref(new Set())
const progress = ref(0)
const loading = ref(true)
const error = ref('')
const review = reactive({ rating: 5, body: '', status: null, status_label: '', reply: null })

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = (await api.get(`me/courses/${encodeURIComponent(props.slug)}`)).data
    course.value = data
    completed.value = new Set(data.completed_lessons)
    progress.value = data.progress
    if (data.my_review) Object.assign(review, data.my_review)
  } catch (err) {
    error.value = err.status === 403 ? 'هذه الدورة غير مفتوحة في حسابك بعد. أرسل طلب التسجيل من صفحة الدورة.' : err.status === 404 ? 'الدورة غير موجودة.' : err.message
  } finally {
    loading.value = false
  }
}
watch(() => props.slug, load, { immediate: true })
watchEffect(() => {
  if (course.value) document.title = siteTitle(course.value.title)
})

const busy = ref(null)
async function toggle(lesson) {
  busy.value = lesson.id
  const done = completed.value.has(lesson.id)
  try {
    const res = await api[done ? 'delete' : 'post'](`me/lessons/${lesson.id}/completion`)
    completed.value = new Set(res.data.completed_lessons)
    progress.value = res.data.progress
    if (progress.value === 100) showToast('أنهيت الدورة، مبروك! 🎉')
  } catch (err) {
    showToast(err.message)
  } finally {
    busy.value = null
  }
}

const reviewError = ref('')
const saving = ref(false)
async function saveReview() {
  saving.value = true
  reviewError.value = ''
  try {
    Object.assign(review, (await api.put(`me/courses/${encodeURIComponent(props.slug)}/review`, { rating: review.rating, body: review.body })).data)
    showToast('شكراً لك! يظهر تقييمك بعد مراجعته.')
  } catch (err) {
    reviewError.value = Object.values(err.errors)[0] || err.message
  } finally {
    saving.value = false
  }
}
const totalLessons = computed(() => course.value?.modules.reduce((n, m) => n + m.lessons.length, 0) ?? 0)
</script>

<template>
  <section v-if="!course" class="page-body"><div class="container"><LoadState :loading="loading" :error="error" @retry="load" /></div></section>

  <div v-else>
    <PageHero :title="course.title" eyebrow="دوراتي">
      <span><BaseIcon name="check" :size="16" /><b>{{ completed.size }}</b> من {{ totalLessons }} دروس</span>
      <span><b>{{ progress }}%</b> منجز</span>
    </PageHero>

    <section class="page-body">
      <div class="container layout">
        <div class="main">
          <div class="bar" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"><i :style="{ width: `${progress}%` }" /></div>
          <div v-for="m in course.modules" :key="m.id" class="card module">
            <h2>{{ m.title }}</h2>
            <ul>
              <li v-for="l in m.lessons" :key="l.id" :class="{ done: completed.has(l.id) }">
                <label>
                  <input type="checkbox" :checked="completed.has(l.id)" :disabled="busy === l.id" @change="toggle(l)" />
                  <span>{{ l.title }}</span>
                </label>
                <span class="muted mono">{{ l.duration }}</span>
              </li>
            </ul>
          </div>
        </div>

        <aside class="side">
          <form class="card rate" @submit.prevent="saveReview">
            <h3>{{ review.status ? 'تقييمك' : 'قيّم الدورة' }}</h3>
            <p v-if="review.status" class="muted small">الحالة: {{ review.status_label }}</p>
            <div class="stars" role="radiogroup" aria-label="التقييم">
              <button v-for="n in 5" :key="n" type="button" :aria-pressed="review.rating >= n" :aria-label="`${n} من 5`" @click="review.rating = n">
                <BaseIcon name="star" :size="24" :filled="review.rating >= n" />
              </button>
            </div>
            <textarea v-model="review.body" class="input" rows="4" placeholder="ما الذي أعجبك؟ وما الذي يمكن تحسينه؟ (10 أحرف على الأقل)" />
            <p v-if="reviewError" class="err">{{ reviewError }}</p>
            <button class="btn btn-primary btn-block" type="submit" :disabled="saving">{{ saving ? 'جارٍ الإرسال…' : review.status ? 'تحديث التقييم' : 'إرسال التقييم' }}</button>
            <p v-if="review.reply" class="reply"><b>رد المدرّب:</b> {{ review.reply }}</p>
          </form>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 32px;
  align-items: start;
}
.main {
  display: grid;
  gap: 14px;
}
.bar {
  height: 10px;
  border-radius: 99px;
  background: var(--tint);
  overflow: hidden;
}
.bar i {
  display: block;
  height: 100%;
  background: var(--primary);
  transition: width 0.3s;
}
.module {
  padding: 18px 20px;
}
.module h2 {
  font-size: 18px;
  margin-bottom: 8px;
}
.module ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.module li {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-top: 1px solid var(--line);
}
.module label {
  display: flex;
  gap: 10px;
  align-items: center;
  cursor: pointer;
}
.module input {
  width: 18px;
  height: 18px;
  accent-color: var(--green);
}
.module li.done span:first-of-type {
  color: var(--muted);
  text-decoration: line-through;
}
.side {
  position: sticky;
  top: calc(var(--header-h) + 24px);
}
.rate {
  padding: 20px;
  display: grid;
  gap: 12px;
}
.stars {
  display: flex;
  gap: 4px;
}
.stars button {
  border: 0;
  background: none;
  padding: 2px;
  cursor: pointer;
  color: #f5a524;
}
.muted {
  color: var(--muted);
}
.small {
  font-size: 13.5px;
}
.err {
  color: var(--rose);
  font-weight: 600;
  font-size: 14px;
}
.reply {
  padding: 10px 12px;
  border-radius: var(--r-sm);
  background: var(--tint);
  font-size: 14.5px;
}
@media (max-width: 900px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .side {
    position: static;
  }
}
</style>
