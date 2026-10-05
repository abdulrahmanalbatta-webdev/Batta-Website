<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import StarRating from '@/components/ui/StarRating.vue'
import LoadState from '@/components/ui/LoadState.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { api } from '@/lib/api'
import { arabicDate, toCourse } from '@/composables/useContent'
import { useSettings } from '@/composables/useSettings'
import { siteTitle } from '@/router'
import { texts } from '@/data/texts'

const props = defineProps({
  slug: { type: String, required: true },
})

const { price } = useSettings()
const course = ref(null)
const curriculum = ref([])
const reviews = ref([])
const loading = ref(true)
const error = ref('')
const missing = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  missing.value = false
  try {
    const [res, rev] = await Promise.all([api.get(`courses/${encodeURIComponent(props.slug)}`), api.get(`courses/${encodeURIComponent(props.slug)}/reviews`)])
    course.value = { ...toCourse(res.data), longDescription: res.data.description, tags: res.data.tags ?? [] }
    curriculum.value = res.data.modules
    reviews.value = rev.data
  } catch (err) {
    course.value = null
    if (err.status === 404) missing.value = true
    else error.value = err.message
  } finally {
    loading.value = false
  }
}
watch(() => props.slug, load, { immediate: true })
watchEffect(() => {
  if (course.value) document.title = siteTitle(course.value.title)
})

// the description is plain text from the dashboard: one paragraph per blank line
const paragraphs = computed(() => (course.value?.longDescription ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean))
const open = ref(0)
</script>

<template>
  <NotFoundView v-if="missing" />
  <section v-else-if="!course" class="page-body"><div class="container"><LoadState :loading="loading" :error="error" @retry="load" /></div></section>

  <div v-else>
    <PageHero :title="course.title" :eyebrow="texts.ui.pages.courses" :subtitle="course.description || ''">
      <span><BaseIcon name="award" :size="16" />{{ course.level }}</span>
      <span><BaseIcon name="clock" :size="16" /><b>{{ course.hours }}</b> ساعة</span>
      <span><BaseIcon name="play" :size="16" /><b>{{ course.lessons }}</b> درساً</span>
      <span v-if="course.reviews"><BaseIcon name="star" :size="16" /><b>{{ course.rating }}</b> ({{ course.reviews }} تقييم)</span>
    </PageHero>

    <section class="page-body">
      <div class="container layout">
        <div class="main">
          <div v-if="course.outcomes.length" class="card block">
            <h2>ماذا ستتعلّم</h2>
            <ul class="outcomes">
              <li v-for="item in course.outcomes" :key="item"><BaseIcon name="check" :size="18" />{{ item }}</li>
            </ul>
          </div>

          <div v-if="paragraphs.length" class="block">
            <h2>عن الدورة</h2>
            <p v-for="(p, i) in paragraphs" :key="i" class="text">{{ p }}</p>
          </div>

          <div v-if="curriculum.length" class="block">
            <h2>محتوى الدورة</h2>
            <div class="modules">
              <div v-for="(m, i) in curriculum" :key="m.id" class="card module">
                <button type="button" class="module-head" :aria-expanded="open === i" @click="open = open === i ? -1 : i">
                  <b>{{ m.title }}</b>
                  <span class="muted">{{ m.lessons.length }} دروس</span>
                  <BaseIcon name="chevron-down" :size="18" :class="{ flip: open === i }" />
                </button>
                <ol v-show="open === i" class="lessons">
                  <li v-for="l in m.lessons" :key="l.id"><BaseIcon name="play" :size="15" /><span>{{ l.title }}</span><span class="muted mono">{{ l.duration }}</span></li>
                </ol>
              </div>
            </div>
          </div>

          <div class="block">
            <h2>آراء الطلاب</h2>
            <p v-if="!reviews.length" class="muted">لا توجد تقييمات بعد، كن أول من يقيّم الدورة بعد التسجيل.</p>
            <div v-for="r in reviews" :key="r.id" class="card review">
              <div class="review-head">
                <span class="avatar">{{ r.initial }}</span>
                <div><b>{{ r.name }}</b><div class="muted small">{{ arabicDate(r.date) }}</div></div>
                <StarRating :count="r.rating" />
              </div>
              <p>{{ r.body }}</p>
              <p v-if="r.reply" class="reply"><b>رد المدرّب:</b> {{ r.reply }}</p>
            </div>
          </div>
        </div>

        <aside class="side">
          <div class="card buy">
            <img v-if="course.cover" class="buy-cover" :src="course.cover" :alt="course.title" />
            <div class="price">{{ price(course.price) }} <s v-if="course.oldPrice">{{ price(course.oldPrice) }}</s></div>
            <ul class="facts">
              <li><BaseIcon name="users" :size="16" />{{ course.students }} طالب</li>
              <li v-if="course.certificate"><BaseIcon name="award" :size="16" />شهادة إتمام</li>
              <li v-if="course.includedInPro"><BaseIcon name="star" :size="16" />ضمن اشتراك Pro</li>
            </ul>
            <RouterLink class="btn btn-primary btn-lg btn-block" :to="{ name: 'enroll', query: { course: course.slug } }">{{ texts.ui.buttons.enroll }}</RouterLink>
            <p class="muted small">الدفع يدوي: بعد التسجيل نتواصل معك على واتساب لإتمام الدفع، ثم تُفتح لك الدورة.</p>
          </div>
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
  gap: 36px;
}
.block h2 {
  font-size: 22px;
  margin-bottom: 14px;
}
.card.block {
  padding: 24px;
}
.outcomes {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 20px;
}
.outcomes li {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.outcomes .icon {
  color: var(--green);
  flex: none;
  margin-top: 4px;
}
.text {
  line-height: 2;
  color: var(--text);
}
.text + .text {
  margin-top: 12px;
}
.modules {
  display: grid;
  gap: 10px;
}
.module {
  padding: 0;
  overflow: hidden;
}
.module-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border: 0;
  background: none;
  font: inherit;
  text-align: start;
  cursor: pointer;
  color: var(--fg);
}
.module-head b {
  flex: 1;
}
.flip {
  transform: rotate(180deg);
}
.lessons {
  list-style: none;
  margin: 0;
  padding: 0 18px 12px;
}
.lessons li {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  border-top: 1px solid var(--line);
}
.lessons li span:first-of-type {
  flex: 1;
}
.review {
  padding: 18px;
  margin-bottom: 12px;
}
.review-head {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 10px;
}
.review-head > div {
  flex: 1;
}
.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--primary-soft);
  color: var(--primary-600);
  font-weight: 800;
}
.reply {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: var(--r-sm);
  background: var(--tint);
  font-size: 15px;
}
.side {
  position: sticky;
  top: calc(var(--header-h) + 24px);
}
.buy {
  padding: 22px;
  display: grid;
  gap: 16px;
}
.price {
  font-size: 30px;
  font-weight: 800;
  color: var(--fg);
}
.price s {
  font-size: 17px;
  color: var(--muted);
  font-weight: 600;
}
.facts {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}
.facts li {
  display: flex;
  gap: 8px;
  align-items: center;
}
.muted {
  color: var(--muted);
}
.small {
  font-size: 13.5px;
}
@media (max-width: 900px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .side {
    position: static;
    order: -1;
  }
  .outcomes {
    grid-template-columns: minmax(0, 1fr);
  }
}
.buy-cover {
  width: calc(100% + 44px);
  max-width: none;
  margin: -22px -22px 0;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--r) var(--r) 0 0;
}
</style>
