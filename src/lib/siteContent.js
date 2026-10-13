// محتوى الموقع من لوحة التحكم (محتوى الموقع): الإعلان، الرئيسية، "من أنا"، الخدمات، الباقات، الأعمال، الآراء، الأسئلة،
// ونصوص الصفحات (العناوين والمقدّمات، التذييل، صفحتا الدخول والتسجيل).
// نسخة اللوحة وقت البناء مكتوبة داخل الصفحة (vite/seo.js) فتظهر فوراً، ثم تُحدَّث بآخر نسخة من اللوحة عند وصولها.
// ملفات src/data تبقى النسخة الاحتياطية إن لم تكن هناك نسخة مكتوبة.
import {
  siVuedotjs,
  siNuxt,
  siNextdotjs,
  siReact,
  siSvelte,
  siJavascript,
  siTypescript,
  siNodedotjs,
  siLaravel,
  siPhp,
  siPython,
  siPostgresql,
  siMysql,
  siMongodb,
  siRedis,
  siPrisma,
  siSupabase,
  siFirebase,
  siTailwindcss,
  siHtml5,
  siGraphql,
  siDocker,
  siGit,
  siGithub,
  siVercel,
  siStripe,
  siFigma,
  siWordpress,
  siFlutter,
  siX,
  siYoutube,
  siInstagram,
  siFacebook,
  siTiktok,
  siBehance,
  siDribbble,
} from 'simple-icons'
import { brand, legal, announcement, heroWords, technologies, services, reasons, faqs, packages, processSteps, testimonials } from '@/data/site'
import { profile, LINKEDIN_PATH } from '@/data/profile'
import { texts } from '@/data/texts'
import { ref } from 'vue'
import { api } from '@/lib/api'

// the logos the dashboard offers (SiteContent::TECHNOLOGIES and NETWORKS), by simple-icons slug;
// named imports keep the rest of the icon set out of the bundle
const LOGOS = { vuedotjs: siVuedotjs, nuxt: siNuxt, nextdotjs: siNextdotjs, react: siReact, svelte: siSvelte, javascript: siJavascript, typescript: siTypescript, nodedotjs: siNodedotjs, laravel: siLaravel, php: siPhp, python: siPython, postgresql: siPostgresql, mysql: siMysql, mongodb: siMongodb, redis: siRedis, prisma: siPrisma, supabase: siSupabase, firebase: siFirebase, tailwindcss: siTailwindcss, html5: siHtml5, graphql: siGraphql, docker: siDocker, git: siGit, github: siGithub, vercel: siVercel, stripe: siStripe, figma: siFigma, wordpress: siWordpress, flutter: siFlutter, x: siX, youtube: siYoutube, instagram: siInstagram, facebook: siFacebook, tiktok: siTiktok, behance: siBehance, dribbble: siDribbble }
const logo = (slug) => LOGOS[slug]
const replace = (list, items) => list.splice(0, list.length, ...items)
const initial = (name) => [...String(name).trim()][0] ?? ''

// pages with no bundled text (privacy, terms) show an error and a retry instead of waiting forever
export const contentStatus = ref('loading')

// the dashboard's texts the build wrote into the page (vite/seo.js), applied before the app mounts
export function applyEmbeddedContent() {
  const embedded = document.getElementById('site-content')
  if (!embedded) return
  try {
    apply(JSON.parse(embedded.textContent))
    contentStatus.value = 'ready'
  } catch {
    // an older dashboard's shape: the bundled texts stay until the live ones arrive
  }
}

export async function loadSiteContent() {
  const ready = contentStatus.value === 'ready'
  if (!ready) contentStatus.value = 'loading'
  let c
  try {
    c = (await api.get('content')).data
  } catch (err) {
    if (!ready) contentStatus.value = err.message
    return // the embedded or bundled texts stay
  }
  apply(c)
  contentStatus.value = 'ready'
}

function apply(c) {
  // a dashboard older than the brand section sends none
  Object.assign(legal, { privacy: c.privacy ?? null, terms: c.terms ?? null })
  if (c.brand) Object.assign(brand, { name: c.brand.name, logo: c.brand.logo, logoDark: c.brand.logo_dark })
  Object.assign(announcement, { enabled: c.announcement.enabled, text: c.announcement.text ?? '', link: c.announcement.link || '/', linkLabel: c.announcement.link_label ?? '' })
  replace(heroWords, c.hero.words.length ? c.hero.words : heroWords.slice())
  replace(technologies, c.technologies.map(logo).filter(Boolean).map((i) => ({ name: i.title, path: i.path, color: `#${i.hex}` })))
  replace(services, c.services)
  replace(reasons, c.reasons)
  replace(faqs, c.faqs)
  replace(processSteps, c.process)
  replace(packages, c.packages.map(({ price_note: priceNote, ...p }) => ({ ...p, priceNote })))
  replace(testimonials, c.testimonials.map((t) => ({ ...t, initial: initial(t.name) })))
  Object.assign(texts, { home: c.texts_home, pages: c.texts_pages, learning: c.texts_learning, general: c.texts_general, ui: c.texts_ui, seo: c.seo })
  // the build already wrote this into index.html (vite.config.js); this keeps a running dev server current too
  document.querySelector('meta[name="description"]')?.setAttribute('content', c.seo.description)

  Object.assign(profile, {
    ...c.profile,
    initial: initial(c.profile.name),
    highlights: c.highlights,
    journey: c.journey,
    values: c.values,
    photo: c.photo,
    socials: c.socials.map((s) => ({ name: s.network === 'x' ? 'X' : (logo(s.network)?.title ?? s.network), url: s.url, path: s.network === 'linkedin' ? LINKEDIN_PATH : logo(s.network)?.path ?? '' })),
  })
}
