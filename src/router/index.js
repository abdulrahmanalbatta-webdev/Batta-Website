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
  { path: '/work', name: 'work', component: () => import('@/views/WorkView.vue'), meta: { page: 'work', title: 'أعمالي' } },
  { path: '/work/:id', name: 'project', component: () => import('@/views/ProjectView.vue'), props: true, meta: { title: 'أعمالي' } },

  // الأكاديمية
  { path: '/courses', name: 'courses', component: () => import('@/views/CoursesView.vue'), meta: { page: 'courses', title: 'الدورات' } },
  { path: '/courses/:slug', name: 'course', component: () => import('@/views/CourseView.vue'), props: true, meta: { title: 'الدورات' } },
  { path: '/workshops', name: 'workshops', component: () => import('@/views/WorkshopsView.vue'), meta: { page: 'workshops', title: 'الورش' } },
  { path: '/workshops/:id(\\d+)', name: 'workshop', component: () => import('@/views/WorkshopView.vue'), props: true, meta: { title: 'الورش' } },
  { path: '/academy', redirect: fromTabs({ workshops: '/workshops' }, '/courses') },

  // الموارد
  { path: '/articles', name: 'articles', component: () => import('@/views/ArticlesView.vue'), meta: { page: 'articles', title: 'المقالات' } },
  { path: '/tools', name: 'tools', component: () => import('@/views/ToolsView.vue'), meta: { page: 'tools', title: 'أدواتي' } },
  { path: '/resources', redirect: fromTabs({ tools: '/tools' }, '/articles') },
  { path: '/stack', redirect: '/tools' },
  { path: '/articles/:id', name: 'article', component: () => import('@/views/ArticleView.vue'), props: true, meta: { title: 'المقالات' } },

  { path: '/contact', name: 'contact', component: () => import('@/views/ContactView.vue'), meta: { page: 'contact', title: 'تواصل معي' } },
  { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue'), meta: { page: 'about', title: 'من أنا' } },
  { path: '/login', name: 'login', component: () => import('@/views/auth/LoginView.vue'), meta: { title: 'تسجيل الدخول', bare: true } },
  { path: '/register', name: 'register', component: () => import('@/views/auth/RegisterView.vue'), meta: { title: 'إنشاء حساب', bare: true } },
  { path: '/reset-password', name: 'reset-password', component: () => import('@/views/auth/ResetPasswordView.vue'), meta: { title: 'كلمة مرور جديدة', bare: true } },

  // حساب الطالب (يتطلب الدخول)
  { path: '/enroll', name: 'enroll', component: () => import('@/views/EnrollView.vue'), meta: { title: 'التسجيل', auth: true } },
  { path: '/my-courses', name: 'my-courses', component: () => import('@/views/MyCoursesView.vue'), meta: { title: 'دوراتي', auth: true } },
  { path: '/my-courses/:slug', name: 'learn', component: () => import('@/views/LearnView.vue'), props: true, meta: { title: 'دوراتي', auth: true } },
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

router.afterEach((to) => {
  document.title = pageTitle(to)
  trackPageView(to.fullPath)
})

export default router
