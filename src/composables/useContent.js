import { computed, ref } from 'vue'
import { api } from '@/lib/api'
import { markdownToBlocks } from '@/lib/markdown'

// محتوى الموقع من لوحة التحكم، بنفس الشكل الذي تتوقعه البطاقات والصفحات.
// كل قائمة تُحمَّل مرة واحدة وتُشارك بين الصفحات.

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

// "2026-10-14" → Date بتوقيت محلي (بدون انزياح المنطقة الزمنية)
const parseDate = (value) => {
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const arabicDate = (value) => {
  if (!value) return ''
  const date = parseDate(value)
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}
const clock = (time) => {
  const [h, m] = String(time).split(':').map(Number)
  const suffix = h < 12 ? 'صباحاً' : 'مساءً'
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${suffix}`
}

export const toCourse = (c) => ({
  id: c.slug,
  slug: c.slug,
  title: c.title,
  description: c.short_description,
  level: c.level_label,
  glyph: c.glyph,
  students: c.students,
  rating: c.rating,
  reviews: c.reviews,
  outcomes: c.outcomes ?? [],
  cover: c.cover_url,
  certificate: c.has_certificate,
})

export const toWorkshop = (w) => {
  const date = parseDate(w.date)
  return {
    id: w.id,
    date: w.date,
    day: String(date.getDate()).padStart(2, '0'),
    month: MONTHS[date.getMonth()],
    title: w.title,
    description: w.description,
    format: w.place ? `${w.format_label} · ${w.place}` : w.format_label,
    online: w.format === 'online',
    time: `${DAYS[date.getDay()]} · ${clock(w.time)}`,
    seats: w.seats,
    taken: w.seats - w.seats_left,
    full: w.is_full,
    // the day has passed (the dashboard closes registration from the next day)
    ended: date < new Date(new Date().setHours(0, 0, 0, 0)),
  }
}

export const toArticle = (a) => ({
  id: a.slug,
  title: a.title,
  category: a.category_label,
  minutes: a.reading_minutes,
  date: arabicDate(a.published_at),
  excerpt: a.excerpt ?? '',
  featured: a.is_featured,
  cover: a.cover_url,
  author: a.author,
  body: a.body === undefined ? undefined : markdownToBlocks(a.body),
  metaTitle: a.meta_title,
  metaDescription: a.meta_description,
})

export const toTools = (categories) =>
  categories.flatMap((category) =>
    category.tools.map((t) => ({ id: t.id, name: t.name, short: t.short, color: t.color, logo: t.logo_url, category: category.name, why: t.why, since: t.since, url: t.url, affiliate: t.is_affiliate })),
  )

// قائمة مشتركة: { items, loading, error, load() }
function shared(fetcher) {
  const state = { items: ref([]), loading: ref(false), error: ref(''), promise: null }
  state.load = () => {
    state.promise ??= (async () => {
      state.loading.value = true
      try {
        state.items.value = await fetcher()
      } catch (err) {
        state.error.value = err.message
        state.promise = null // retry on the next visit
      } finally {
        state.loading.value = false
      }
    })()
    return state.promise
  }
  return state
}

const courses = shared(async () => (await api.get('courses')).data.map(toCourse))
const workshops = shared(async () => (await api.get('workshops')).data.map(toWorkshop))
const articles = shared(async () => (await api.get('articles', { per_page: 50 })).data.map(toArticle))
const tools = shared(async () => toTools((await api.get('tools')).data))

const use = (state) => {
  state.load()
  return { items: state.items, loading: state.loading, error: state.error, reload: () => ((state.promise = null), state.load()) }
}

export const useCourses = () => use(courses)
export const useWorkshops = () => use(workshops)
export const useArticles = () => use(articles)
export const useTools = () => use(tools)

// أرقام حقيقية من اللوحة لشرائط الإحصائيات (تُحدَّث كل 10 دقائق هناك)
const stats = shared(async () => (await api.get('stats')).data)
const count = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—')

export function useStats() {
  stats.load()
  return computed(() => {
    const s = Array.isArray(stats.items.value) ? {} : stats.items.value
    return [
      { icon: 'users', value: count(s.students), label: 'طالب ومتدرب' },
      { icon: 'play', value: count(s.courses), label: 'دورات عملية' },
      { icon: 'briefcase', value: count(s.projects), label: 'مشروعاً منجزاً' },
      { icon: 'article', value: count(s.articles), label: 'مقالاً تقنياً' },
    ]
  })
}

// the raw numbers (students, projects, rating, reviews), for sentences such as the hero's
export function useStatsNumbers() {
  stats.load()
  return computed(() => (Array.isArray(stats.items.value) ? {} : stats.items.value))
}
