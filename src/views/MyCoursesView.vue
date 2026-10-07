<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { api } from '@/lib/api'
import { toCourse } from '@/composables/useContent'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { student, signOut } = useAuth()
const { showToast } = useToast()

const courses = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    courses.value = (await api.get('me/courses')).data.map((c) => ({ ...toCourse(c), access: c.access }))
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
    <PageHero title="دوراتي" eyebrow="حسابي" :subtitle="student ? `أهلاً ${student.name}` : ''">
      <span v-if="student?.is_pro"><BaseIcon name="star" :size="16" />مشترك Pro</span>
      <button class="link-btn" type="button" @click="logout"><BaseIcon name="next" :size="16" />تسجيل الخروج</button>
    </PageHero>

    <section class="page-body">
      <div class="container">
        <div class="grid g3">
          <RouterLink v-for="c in courses" :key="c.id" class="card hover mine" :to="{ name: 'course', params: { slug: c.slug } }">
            <div class="cover"><span class="glyph">{{ c.glyph }}</span></div>
            <div class="body">
              <span class="pill">{{ c.access === 'pro' ? 'ضمن Pro' : c.level }}</span>
              <h3>{{ c.title }}</h3>
              <div class="foot"><span>مسجّل</span><span class="link-more">صفحة الدورة <BaseIcon name="arrow" :size="16" /></span></div>
            </div>
          </RouterLink>
          <LoadState :loading="loading" :error="error" @retry="load" />
        </div>

        <div v-if="!loading && !error && !courses.length" class="card empty">
          <BaseIcon name="play" :size="28" />
          <div>
            <h2>لا توجد دورات في حسابك بعد</h2>
            <p>اختر دورة وأرسل طلب التسجيل، وبعد تأكيد الدفع تظهر هنا.</p>
          </div>
          <RouterLink class="btn btn-primary" to="/courses">تصفّح الدورات</RouterLink>
        </div>
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
.empty h2 {
  font-size: 19px;
}
.empty p {
  color: var(--muted);
}
</style>
