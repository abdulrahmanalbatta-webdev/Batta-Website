import { ref } from 'vue'
import { api } from '@/lib/api'

// إعدادات المنصة العامة من لوحة التحكم: التواصل، التسجيل، العملة، تعليمات الدفع، Google Analytics…
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

  // سعر بعملة المنصة: 49 → "49$"
  const price = (amount) => {
    if (!amount) return 'مجاناً'
    const value = Number.isInteger(amount) ? amount : amount.toFixed(2)
    return `${value}${settings.value?.currency_symbol ?? '$'}`
  }

  return { settings, loaded: () => loading, price }
}

// مشاهدة صفحة لـ Google Analytics (تُستدعى بعد كل تنقّل)
export function trackPageView(path) {
  window.gtag?.('event', 'page_view', { page_path: path, page_title: document.title })
}
