import { computed, ref } from 'vue'
import { api } from '@/lib/api'

// إعدادات المنصة العامة من لوحة التحكم: التواصل، التسجيل، التعليقات، Google Analytics…
const settings = ref(null)
let loading

function loadAnalytics(id) {
  if (!id || window.gtag) return
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
  document.head.append(script)
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', id, { send_page_view: false })
}

export function useSettings() {
  loading ??= api
    .get('settings')
    .then((res) => {
      settings.value = res.data
      loadAnalytics(res.data.ga_measurement_id)
    })
    .catch(() => {
      settings.value = null
    })

  return { settings, loaded: () => loading }
}

// مشاهدة صفحة لـ Google Analytics (تُستدعى بعد كل تنقّل)
export function trackPageView(path) {
  window.gtag?.('event', 'page_view', { page_path: path, page_title: document.title })
}

// التواصل من إعدادات اللوحة (الإعدادات ← عام): البريد ورقم واتساب
export function useContact() {
  const { settings } = useSettings()
  const email = computed(() => settings.value?.contact_email || '')
  const whatsapp = computed(() => settings.value?.whatsapp || '')
  const whatsappUrl = computed(() => {
    const digits = whatsapp.value.replace(/\D/g, '')
    return digits ? `https://wa.me/${digits}` : ''
  })
  return { email, whatsapp, whatsappUrl }
}
