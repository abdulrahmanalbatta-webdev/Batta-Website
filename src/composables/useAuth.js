import { computed, ref } from 'vue'
import { api, token } from '@/lib/api'

// الطالب المسجّل (حالة مشتركة لكل الموقع)
const student = ref(null)
const ready = ref(false)
let loading

async function load() {
  if (!token.get()) {
    student.value = null
    ready.value = true
    return
  }
  try {
    student.value = (await api.get('me')).data
  } catch {
    student.value = null
  } finally {
    ready.value = true
  }
}

export function useAuth() {
  // مرة واحدة عند أول استخدام
  loading ??= load()

  async function signIn({ email, password }) {
    const res = await api.post('auth/login', { email, password, device_name: navigator.userAgent.slice(0, 100) })
    token.set(res.token)
    student.value = res.data
  }

  async function register(fields) {
    const res = await api.post('auth/register', { ...fields, device_name: navigator.userAgent.slice(0, 100) })
    token.set(res.token)
    student.value = res.data
  }

  async function signOut() {
    try {
      await api.post('auth/logout')
    } catch {
      /* the token may already be gone */
    }
    token.set(null)
    student.value = null
  }

  return {
    student,
    ready,
    loaded: () => loading,
    isSignedIn: computed(() => !!student.value),
    signIn,
    register,
    signOut,
    refresh: load,
  }
}
