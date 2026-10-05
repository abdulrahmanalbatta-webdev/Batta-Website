# Batta

منصة شخصية متكاملة: دورات، مقالات، ورش، أدوات، دراسات حالة، وخدمات تطوير ويب.
مبنية بـ **Vue 3 + Vite + Vue Router**، بخط **Cairo** (مستضاف محلياً عبر `@fontsource/cairo`)، وتدعم العربية (RTL)، بوضع فاتح فقط.

## الصفحات

| المسار | الصفحة |
| --- | --- |
| `/` | الرئيسية |
| `/services` | الخدمات ونموذج طلب مشروع (`#contact`) |
| `/work` | أعمالي (دراسات الحالة) |
| `/courses` | الدورات (فلتر المستوى: `?level=مبتدئ`) — ضمن قائمة "الأكاديمية" |
| `/workshops` | الورش — ضمن قائمة "الأكاديمية" |
| `/articles` | المقالات (تصنيف `?cat=` وبحث `?q=`) — ضمن قائمة "الموارد" |
| `/articles/:id` | تفاصيل المقال: فهرس، تقدم القراءة، مقالات ذات صلة |
| `/tools` | أدواتي (تصنيف `?cat=`) — ضمن قائمة "الموارد" |
| `/about` | من أنا |
| `/login` | تسجيل الدخول (صفحة مستقلة بدون هيدر وفوتر) |
| `/register` | إنشاء حساب (تحقق من البيانات وقوة كلمة المرور) |

الروابط القديمة `/academy` و `/resources` و `/stack` تحوّل تلقائياً إلى الصفحة الصحيحة.
القائمة الرئيسية وقوائمها المنسدلة معرّفة في `src/data/navigation.js`.

## التشغيل

```bash
npm install      # أول مرة فقط
npm run dev      # خادم التطوير: http://localhost:5173
npm run build    # نسخة الإنتاج في مجلد dist
npm run preview  # معاينة نسخة الإنتاج
```

يتطلب Node.js 20 أو أحدث.

## هيكلية المشروع

```
src/
├── main.js                 نقطة البداية: الخطوط، الأنماط، الراوتر
├── App.vue                 الهيكل العام: هيدر + الصفحة + فوتر + الإشعارات
├── router/index.js         المسارات وعناوين الصفحات
├── assets/
│   ├── images/             الشعار (نسخة فاتحة ونسخة للخلفيات الداكنة)
│   └── styles/
│       ├── tokens.css      ألوان الهوية والخطوط والمسافات (فاتح + ليلي)
│       └── base.css        الأساسيات والعناصر المشتركة (أزرار، كروت، شبكات، نماذج)
├── components/
│   ├── layout/             AppHeader, AppFooter
│   ├── ui/                 مكونات عامة: BaseIcon, BrandLogo, SectionHeading, PageHero, FilterChips, StarRating, ToastHost
│   ├── cards/              CourseCard, ArticleCard, WorkshopCard, ToolCard, CaseStudyCard
│   ├── home/               أقسام الصفحة الرئيسية
│   ├── article/            ArticleBody (عرض محتوى المقال: عناوين، فقرات، قوائم، كود، نصائح)
│   └── auth/               AuthLayout, PasswordField, OAuthButtons
├── composables/            حالة مشتركة: useToast
├── data/                   بيانات تجريبية: courses, articles (مع محتوى كل مقال), site (ورش، أدوات، أعمال، باقات...)
└── views/                  صفحات الموقع، و views/auth لصفحتي الدخول والتسجيل
```

## التعديل

- **الألوان والخط:** `src/assets/styles/tokens.css`
- **المحتوى:** ملفات `src/data/`. لاحقاً استبدلها باستدعاءات API أو CMS دون تغيير المكونات.
- **أيقونة جديدة:** أضف مسارها في `src/components/ui/BaseIcon.vue`.
- **صفحة جديدة:** أنشئ ملفاً في `src/views/` وأضف مساره في `src/router/index.js` ورابطه في `AppHeader.vue`.

## ما يحتاج ربطاً قبل الإطلاق

ابحث عن `TODO` في الكود:

| الميزة | الملف | خيارات مقترحة |
| --- | --- | --- |
| تسجيل الدخول والحسابات | `views/auth/LoginView.vue`، `views/auth/RegisterView.vue`، `components/auth/OAuthButtons.vue` | Supabase Auth، Firebase، أو API خاص |
| النشرة البريدية | `components/home/NewsletterCta.vue` | ConvertKit، Buttondown، Mailchimp |
| نموذج طلب مشروع | `views/ServicesView.vue` | Formspree، Resend، أو API خاص |
| الدفع للدورات والورش | `cards/CourseCard.vue`، `cards/WorkshopCard.vue` | Lemon Squeezy، Paddle |
| محتوى المقالات | `data/articles.js` | ملفات Markdown أو CMS مثل Sanity / Strapi |

## النشر

- **Vercel:** ارفع المشروع مباشرة؛ ملف `vercel.json` يوجّه كل المسارات إلى `index.html`.
- **Netlify:** أمر البناء `npm run build` ومجلد النشر `dist`؛ ملف `public/_redirects` جاهز لتوجيه المسارات.
