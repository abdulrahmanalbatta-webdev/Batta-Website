import { ref, watch } from 'vue'
import { api } from '@/lib/api'
import { useAuth } from '@/composables/useAuth'

// تسجيلات الطالب في الدورات والورش (حالة مشتركة لكل الموقع): التسجيل مجاني بضغطة، ويمكن إلغاؤه.
// courses: slugs الدورات المسجّل فيها، workshops: أرقام الورش المحجوزة.
const courses = ref(new Set())
const workshops = ref(new Set())
let watching = false

async function load(signedIn) {
  if (!signedIn) {
    courses.value = new Set()
    workshops.value = new Set()
    return
  }
  try {
    const [mine, seats] = await Promise.all([api.get('me/courses'), api.get('me/workshops')])
    courses.value = new Set(mine.data.map((c) => c.slug))
    workshops.value = new Set(seats.data.map((w) => w.id))
  } catch {
    /* signed out meanwhile, or offline: the buttons fall back to "register" */
  }
}

const PATHS = { course: 'me/courses', workshop: 'me/workshops' }

export function useRegistrations() {
  const { student } = useAuth()
  if (!watching) {
    watching = true
    watch(() => student.value?.id, (id) => load(!!id), { immediate: true })
  }

  const listOf = (type) => (type === 'course' ? courses : workshops)
  const isRegistered = (type, key) => listOf(type).value.has(key)

  // returns the API's message ("تم تسجيلك في الدورة.")
  async function register(type, key) {
    const res = await api.post(`${PATHS[type]}/${encodeURIComponent(key)}`)
    listOf(type).value = new Set([...listOf(type).value, key])
    return res.message
  }

  async function cancel(type, key) {
    await api.delete(`${PATHS[type]}/${encodeURIComponent(key)}`)
    const next = new Set(listOf(type).value)
    next.delete(key)
    listOf(type).value = next
  }

  return { courses, workshops, isRegistered, register, cancel }
}
