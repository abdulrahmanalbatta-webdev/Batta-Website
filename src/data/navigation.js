// القائمة الرئيسية. العناصر التي لها children تفتح قائمة منسدلة بسيطة
// (على الجوال تتحول إلى قائمة قابلة للطي). match = المسارات التي تجعل العنصر "نشطاً".
import { computed } from 'vue'
import { services } from './site'
import { texts } from './texts'

// computed: قائمة الخدمات المنسدلة تتبع الخدمات القادمة من لوحة التحكم
export const nav = computed(() => [
  { label: 'الرئيسية', to: '/' },
  {
    label: texts.ui.pages.services,
    to: '/services',
    match: ['/services'],
    wide: true,
    children: [
      ...services.map((s) => ({ label: s.title, desc: s.text, icon: s.icon, to: { path: '/services', hash: `#${s.id}` } })),
    ],
    footer: { label: texts.ui.buttons.quote, to: { path: '/services', hash: '#contact' } },
  },
  { label: texts.ui.pages.work, to: '/work' },
  {
    label: texts.ui.pages.academy,
    match: ['/courses', '/workshops'],
    children: [
      { label: texts.ui.pages.courses, desc: texts.ui.menu.courses, icon: 'play', to: '/courses' },
      { label: texts.ui.pages.workshops, desc: texts.ui.menu.workshops, icon: 'calendar', to: '/workshops' },
    ],
  },
  {
    label: texts.ui.pages.resources,
    match: ['/articles', '/tools'],
    children: [
      { label: texts.ui.pages.articles, desc: texts.ui.menu.articles, icon: 'article', to: '/articles' },
      { label: texts.ui.pages.tools, desc: texts.ui.menu.tools, icon: 'code', to: '/tools' },
    ],
  },
  { label: texts.ui.pages.about, to: '/about' },
])
