<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import LoadState from '@/components/ui/LoadState.vue'
import WorkshopCard from '@/components/cards/WorkshopCard.vue'
import { api } from '@/lib/api'
import { toCourse, toWorkshop } from '@/composables/useContent'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

// تسجيلات الطالب: الدورات التي سجّل فيها والورش التي حجز فيها مقعداً (القادمة أولاً، ثم المنتهية).
const router = useRouter()
const { student, signOut } = useAuth()
const { showToast } = useToast()

const courses = ref([])
const workshops = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const [mine, seats] = await Promise.all([api.get('me/courses'), api.get('me/workshops')])
    courses.value = mine.data.map(toCourse)
    const list = seats.data.map(toWorkshop)
    workshops.value = [...list.filter((w) => !w.ended), ...list.filter((w) => w.ended).reverse()]
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function logout() {
  await signOut()
  showToast('تم تسجيل الخروج')
  router.push('/')
}
</script>

<template>
  <div>
    <PageHero title="تسجيلاتي" eyebrow="حسابي" :subtitle="student ? `أهلاً ${student.name}` : ''">
      <button class="link-btn" type="button" @click="logout"><BaseIcon name="next" :size="16" />تسجيل الخروج</button>
    </PageHero>

    <section class="page-body">
      <div class="container stack">
        <LoadState :loading="loading" :error="error" @retry="load" />

        <template v-if="!loading && !error">
          <div>
            <h2 class="section-title">الدورات</h2>
            <div v-if="courses.length" class="grid g3">
              <RouterLink v-for="c in courses" :key="c.id" class="card hover mine" :to="{ name: 'course', params: { slug: c.slug } }">
                <div class="cover"><span class="glyph">{{ c.glyph }}</span></div>
                <div class="body">
                  <span class="pill">{{ c.level }}</span>
                  <h3>{{ c.title }}</h3>
                  <div class="foot"><span>مسجّل</span><span class="link-more">صفحة الدورة <BaseIcon name="arrow" :size="16" /></span></div>
                </div>
              </RouterLink>
            </div>
            <div v-else class="card empty">
              <BaseIcon name="play" :size="28" />
              <div>
                <h3>لم تسجّل في أي دورة بعد</h3>
                <p>التسجيل مجاني: افتح صفحة الدورة واضغط "سجّل في الدورة".</p>
              </div>
              <RouterLink class="btn btn-primary" to="/courses">تصفّح الدورات</RouterLink>
            </div>
          </div>

          <div>
            <h2 class="section-title">الورش</h2>
            <div v-if="workshops.length" class="list">
              <WorkshopCard v-for="w in workshops" :key="w.id" :workshop="w" />
            </div>
            <div v-else class="card empty">
              <BaseIcon name="calendar" :size="28" />
              <div>
                <h3>لم تحجز مقعداً في أي ورشة بعد</h3>
                <p>احجز مقعدك مجاناً من صفحة الورش.</p>
              </div>
              <RouterLink class="btn btn-primary" to="/workshops">الورش القادمة</RouterLink>
            </div>
          </div>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.link-btn {
  border: 0;
  background: none;
  font: inherit;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 0;
}
.mine {
  padding: 0;
  overflow: hidden;
  color: inherit;
  text-decoration: none;
}
.cover {
  height: 120px;
  display: grid;
  place-items: center;
  background: var(--cover);
}
.glyph {
  font-family: var(--mono);
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}
.body {
  padding: 18px;
  display: grid;
  gap: 10px;
  justify-items: start;
}
.body h3 {
  font-size: 18px;
}
.foot {
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 14px;
}
.empty {
  padding: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}
.empty > div {
  flex: 1;
  min-width: 220px;
}
.empty h3 {
  font-size: 17px;
}
.stack {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.section-title {
  font-size: 22px;
  margin-bottom: 16px;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.empty p {
  color: var(--muted);
}
</style>
