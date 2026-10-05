// القائمة الرئيسية. العناصر التي لها children تفتح قائمة منسدلة بسيطة
// (على الجوال تتحول إلى قائمة قابلة للطي). match = المسارات التي تجعل العنصر "نشطاً".
import { computed } from 'vue'
import { services } from './site'

// computed: قائمة الخدمات المنسدلة تتبع الخدمات القادمة من لوحة التحكم
export const nav = computed(() => [
  { label: 'الرئيسية', to: '/' },
  {
    label: 'الخدمات',
    to: '/services',
    match: ['/services'],
    wide: true,
    children: [
      ...services.map((s) => ({ label: s.title, desc: s.text, icon: s.icon, to: { path: '/services', hash: `#${s.id}` } })),
    ],
    footer: { label: 'اطلب عرض سعر', to: { path: '/services', hash: '#contact' } },
  },
  { label: 'أعمالي', to: '/work' },
  {
    label: 'الأكاديمية',
    match: ['/courses', '/workshops'],
    children: [
      { label: 'الدورات', desc: 'دورات مسجّلة تنتهي بمشروع حقيقي', icon: 'play', to: '/courses' },
      { label: 'الورش', desc: 'جلسات مباشرة أونلاين وحضورياً', icon: 'calendar', to: '/workshops' },
    ],
  },
  {
    label: 'الموارد',
    match: ['/articles', '/tools'],
    children: [
      { label: 'المقالات', desc: 'دروس وتجارب من مشاريع حقيقية', icon: 'article', to: '/articles' },
      { label: 'أدواتي', desc: 'الأدوات التي أعمل بها يومياً', icon: 'code', to: '/tools' },
    ],
  },
  { label: 'من أنا', to: '/about' },
])
