<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import LoadState from '@/components/ui/LoadState.vue'
import CommentsSection from '@/components/comments/CommentsSection.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { api } from '@/lib/api'
import { arabicDate, toWorkshop } from '@/composables/useContent'
import { useSettings } from '@/composables/useSettings'
import { siteTitle } from '@/router'
import { texts } from '@/data/texts'

// صفحة الورشة: التفاصيل والمقاعد والحجز، وتعليقات الطلاب وأسئلتهم (تبقى بعد انتهاء الورشة).
const props = defineProps({
  id: { type: String, required: true },
})

const { price } = useSettings()
const workshop = ref(null)
const loading = ref(true)
const error = ref('')
const missing = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  missing.value = false
  try {
    workshop.value = toWorkshop((await api.get(`workshops/${encodeURIComponent(props.id)}`)).data)
  } catch (err) {
    workshop.value = null
    if (err.status === 404) missing.value = true
    else error.value = err.message
  } finally {
    loading.value = false
  }
}
watch(() => props.id, load, { immediate: true })
watchEffect(() => {
  if (workshop.value) document.title = siteTitle(workshop.value.title)
})

const ended = computed(() => workshop.value && new Date(`${workshop.value.date}T23:59:59`) < new Date())
const seatsLeft = computed(() => (workshop.value ? workshop.value.seats - workshop.value.taken : 0))
const fill = computed(() => (workshop.value ? Math.round((workshop.value.taken / workshop.value.seats) * 100) : 0))
// the description is plain text from the dashboard: one paragraph per blank line
const paragraphs = computed(() => (workshop.value?.description ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean))
</script>

<template>
  <NotFoundView v-if="missing" />
  <section v-else-if="!workshop" class="page-body"><div class="container"><LoadState :loading="loading" :error="error" @retry="load" /></div></section>

  <div v-else>
    <PageHero :title="workshop.title" :eyebrow="texts.ui.pages.workshops">
      <span><BaseIcon name="calendar" :size="16" />{{ arabicDate(workshop.date) }}</span>
      <span><BaseIcon name="clock" :size="16" />{{ workshop.time }}</span>
      <span><BaseIcon :name="workshop.online ? 'monitor' : 'pin'" :size="16" />{{ workshop.format }}</span>
    </PageHero>

    <section class="page-body">
      <div class="container layout">
        <div class="main">
          <div v-if="paragraphs.length" class="card block">
            <h2>عن الورشة</h2>
            <p v-for="(p, i) in paragraphs" :key="i" class="text">{{ p }}</p>
          </div>

          <CommentsSection type="workshop" :target="workshop.id" />
        </div>

        <aside class="side">
          <div class="card book">
            <div class="when">
              <span class="day">{{ workshop.day }}</span>
              <span>{{ workshop.month }}</span>
            </div>
            <div class="price">{{ workshop.free ? 'مجانية' : price(workshop.price) }}</div>
            <template v-if="!ended">
              <div class="seats">
                <span>المقاعد</span>
                <span><b>{{ seatsLeft }}</b> متبقية من {{ workshop.seats }}</span>
              </div>
              <div class="meter"><i :style="{ width: `${fill}%` }" /></div>
              <span v-if="workshop.full" class="btn btn-ghost btn-lg btn-block" aria-disabled="true">{{ texts.ui.buttons.seats_full }}</span>
              <RouterLink v-else class="btn btn-primary btn-lg btn-block" :to="{ name: 'enroll', query: { workshop: workshop.id } }">{{ texts.ui.buttons.book_seat }}</RouterLink>
            </template>
            <p v-else class="muted ended">انتهت هذه الورشة. تابع الورش القادمة من <RouterLink to="/workshops">صفحة الورش</RouterLink>.</p>
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
  gap: 12px;
  min-width: 0;
}
.card.block {
  padding: 24px;
}
.block h2 {
  font-size: 22px;
  margin-bottom: 14px;
}
.text {
  line-height: 2;
  color: var(--text);
}
.text + .text {
  margin-top: 12px;
}
.side {
  position: sticky;
  top: calc(var(--header-h) + 24px);
}
.book {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.when {
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 84px;
  padding: 10px 6px;
  border-radius: 14px;
  background: var(--fg);
  color: var(--bg);
  line-height: 1.2;
}
.when .day {
  font-size: 28px;
  font-weight: 900;
}
.price {
  font-size: 28px;
  font-weight: 900;
  color: var(--fg);
}
.seats {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--muted);
}
.seats b {
  color: var(--fg);
}
.meter {
  height: 8px;
  border-radius: 99px;
  background: var(--tint-2);
  overflow: hidden;
}
.meter i {
  display: block;
  height: 100%;
  background: var(--primary);
  border-radius: inherit;
}
.ended a {
  color: var(--primary-600);
  font-weight: 700;
}
@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .side {
    position: static;
    order: -1;
  }
}
</style>
