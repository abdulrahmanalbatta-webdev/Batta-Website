import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { profile } from '@/data/profile'
import { texts } from '@/data/texts'
import { useAuth } from '@/composables/useAuth'
import { trackPageView } from '@/composables/useSettings'

// old combined pages (/academy?tab=…, /resources?tab=…) → the matching standalone page, keeping filters/search
const fromTabs = (map, fallback) => (to) => {
  const { tab, ...query } = to.query
  return { path: map[tab] ?? fallback, query }
}

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '' } },
  { path: '/services', name: 'services', component: () => import('@/views/ServicesView.vue'), meta: { page: 'services', title: 'الخدمات' } },
  // the portfolio is gone: old links land on the services
  { path: '/work/:id?', redirect: '/services' },

  // الأكاديمية
  { path: '/paths', name: 'paths', component: () => import('@/views/PathsView.vue'), meta: { page: 'paths', title: 'المسارات' } },
  { path: '/paths/:id', name: 'path', component: () => import('@/views/PathView.vue'), props: true, meta: { title: 'المسارات' } },
  // courses and workshops share one page; the old addresses open it on that type
  { path: '/academy', name: 'academy', component: () => import('@/views/AcademyView.vue'), meta: { title: 'الدورات والورش' } },
  { path: '/courses', redirect: (to) => ({ path: '/academy', query: { ...to.query, type: 'courses' } }) },
  { path: '/courses/:slug', name: 'course', component: () => import('@/views/CourseView.vue'), props: true, meta: { title: 'الدورات' } },
  { path: '/workshops', redirect: (to) => ({ path: '/academy', query: { ...to.query, type: 'workshops' } }) },
  { path: '/mentorship', name: 'mentorship', component: () => import('@/views/MentorshipView.vue'), meta: { title: 'الإرشاد' } },
  { path: '/workshops/:id(\\d+)', name: 'workshop', component: () => import('@/views/WorkshopView.vue'), props: true, meta: { title: 'الورش' } },

  // الموارد
  { path: '/articles', name: 'articles', component: () => import('@/views/ArticlesView.vue'), meta: { page: 'articles', title: 'المقالات' } },
  { path: '/tools', name: 'tools', component: () => import('@/views/ToolsView.vue'), meta: { page: 'tools', title: 'أدواتي' } },
  { path: '/resources', redirect: fromTabs({ tools: '/tools' }, '/articles') },
  { path: '/stack', redirect: '/tools' },
  { path: '/articles/:id', name: 'article', component: () => import('@/views/ArticleView.vue'), props: true, meta: { title: 'المقالات' } },

  { path: '/contact', name: 'contact', component: () => import('@/views/ContactView.vue'), meta: { page: 'contact', title: 'تواصل معي' } },
  { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue'), meta: { page: 'about', title: 'من أنا' } },
  { path: '/privacy', name: 'privacy', component: () => import('@/views/LegalView.vue'), props: { page: 'privacy' }, meta: { title: 'سياسة الخصوصية' } },
  { path: '/terms', name: 'terms', component: () => import('@/views/LegalView.vue'), props: { page: 'terms' }, meta: { title: 'الشروط والأحكام' } },
  { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { title: 'تسجيل الدخول', bare: true } },
  { path: '/register', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { title: 'إنشاء حساب', bare: true } },
  { path: '/reset-password', name: 'reset-password', component: () => import('@/views/auth/ResetPasswordView.vue'), meta: { title: 'كلمة مرور جديدة', bare: true } },

  // حساب الطالب (يتطلب الدخول)
  // registering is now one click on the course or workshop page: old links land there
  {
    path: '/enroll',
    redirect: (to) =>
      to.query.course
        ? { name: 'course', params: { slug: String(to.query.course) }, query: {} }
        : to.query.workshop
          ? { name: 'workshop', params: { id: String(to.query.workshop) }, query: {} }
          : { path: '/courses', query: {} },
  },
  { path: '/my-mentorship', name: 'my-mentorship', component: () => import('@/views/MyMentorshipView.vue'), meta: { title: 'طلب الإرشاد', auth: true } },
  { path: '/my-courses', name: 'my-courses', component: () => import('@/views/MyCoursesView.vue'), meta: { title: 'تسجيلاتي', auth: true } },
  // courses have no lessons any more: old links go to the course page
  { path: '/my-courses/:slug', redirect: (to) => ({ name: 'course', params: { slug: to.params.slug } }) },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue'), meta: { title: 'الصفحة غير موجودة' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      // wait for the page transition so the target section exists
      const delay = to.path === from.path ? 0 : 320
      // vertical scroll only (RTL page), stopping 96px down so the sticky header doesn't cover the target
      return new Promise((resolve) =>
        setTimeout(() => {
          const el = document.getElementById(decodeURIComponent(to.hash.slice(1)))
          resolve(el ? { top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' } : false)
        }, delay),
      )
    }
    if (savedPosition) return savedPosition
    // switching tabs / filters on the same page: keep the scroll position
    if (to.path === from.path) return false
    return { top: 0 }
  },
})

// عنوان التبويب: "اسم الصفحة | الاسم"، والرئيسية: عنوان الموقع من اللوحة (محركات البحث والمشاركة)
export const siteTitle = (page) => (page ? `${page} | ${profile.name}` : texts.seo.title)

// صفحات الحساب: الضيف يُرسل لإنشاء حساب ثم يعود لنفس الصفحة
router.beforeEach(async (to) => {
  // the contact form used to sit at the bottom of the services page
  if (to.path === '/services' && to.hash === '#contact') return { name: 'contact', query: to.query }
  if (!to.meta.auth) return true
  const auth = useAuth()
  await auth.loaded()
  return auth.isSignedIn.value || { name: 'register', query: { next: to.fullPath } }
})

// meta.page: the page's name from the dashboard (texts.ui.pages), meta.title the bundled fallback
export const pageTitle = (route) => siteTitle(texts.ui.pages[route.meta.page] ?? route.meta.title)

// each page is its own canonical address (index.html carries the home page's for crawlers that skip JavaScript)
function setCanonical(path) {
  const url = __SITE_URL__ + (path === '/' ? '/' : path.replace(/\/$/, ''))
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)
  document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
}

router.afterEach((to) => {
  document.title = pageTitle(to)
  setCanonical(to.path)
  trackPageView(to.fullPath)
})

export default router
