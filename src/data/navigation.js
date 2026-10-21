// القائمة الرئيسية. العناصر التي لها children تفتح قائمة منسدلة بسيطة
// (على الجوال تتحول إلى قائمة قابلة للطي). match = المسارات التي تجعل العنصر "نشطاً".
import { computed } from 'vue'
import { texts } from './texts'

// computed: أسماء الصفحات من لوحة التحكم (محتوى الموقع ← نصوص الصفحات ← أسماء الصفحات)
export const nav = computed(() => [
  { label: 'الرئيسية', to: '/' },
  { label: texts.ui.pages.services, to: '/services' },
  {
    label: texts.ui.pages.academy,
    match: ['/academy', '/paths', '/courses', '/workshops', '/mentorship'],
    children: [
      { label: 'الدورات والورش', desc: 'دورات مسجّلة وورش مباشرة، والتسجيل مجاني', icon: 'play', to: '/academy' },
      { label: texts.ui.pages.paths, desc: texts.ui.menu.paths, icon: 'pin', to: '/paths' },
      { label: 'الإرشاد', desc: 'متابعة شخصية بخطة وجلسات فردية', icon: 'users', to: '/mentorship' },
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
  { label: texts.ui.pages.contact, to: '/contact' },
])
