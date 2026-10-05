// محتوى الموقع من لوحة التحكم (محتوى الموقع): الإعلان، الرئيسية، "من أنا"، الخدمات، الباقات، الأعمال، الآراء، الأسئلة،
// ونصوص الصفحات (العناوين والمقدّمات، التذييل، صفحتا الدخول والتسجيل).
// ملفات src/data تبقى النسخة الاحتياطية: يظهر محتواها فوراً، ثم يُستبدل بما في اللوحة عند وصوله.
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
import { announcement, heroWords, technologies, services, reasons, faqs, caseStudies, packages, processSteps, testimonials } from '@/data/site'
import { profile, LINKEDIN_PATH } from '@/data/profile'
import { texts } from '@/data/texts'
import { api } from '@/lib/api'

// the logos the dashboard offers (SiteContent::TECHNOLOGIES and NETWORKS), by simple-icons slug;
// named imports keep the rest of the icon set out of the bundle
const LOGOS = { vuedotjs: siVuedotjs, nuxt: siNuxt, nextdotjs: siNextdotjs, react: siReact, svelte: siSvelte, javascript: siJavascript, typescript: siTypescript, nodedotjs: siNodedotjs, laravel: siLaravel, php: siPhp, python: siPython, postgresql: siPostgresql, mysql: siMysql, mongodb: siMongodb, redis: siRedis, prisma: siPrisma, supabase: siSupabase, firebase: siFirebase, tailwindcss: siTailwindcss, html5: siHtml5, graphql: siGraphql, docker: siDocker, git: siGit, github: siGithub, vercel: siVercel, stripe: siStripe, figma: siFigma, wordpress: siWordpress, flutter: siFlutter, x: siX, youtube: siYoutube, instagram: siInstagram, facebook: siFacebook, tiktok: siTiktok, behance: siBehance, dribbble: siDribbble }
const logo = (slug) => LOGOS[slug]
const replace = (list, items) => list.splice(0, list.length, ...items)
const initial = (name) => [...String(name).trim()][0] ?? ''

export async function loadSiteContent() {
  let c
  try {
    c = (await api.get('content')).data
  } catch {
    return // the bundled texts stay
  }

  Object.assign(announcement, { enabled: c.announcement.enabled, text: c.announcement.text ?? '', link: c.announcement.link || '/', linkLabel: c.announcement.link_label ?? '' })
  replace(heroWords, c.hero.words.length ? c.hero.words : heroWords.slice())
  replace(technologies, c.technologies.map(logo).filter(Boolean).map((i) => ({ name: i.title, path: i.path, color: `#${i.hex}` })))
  replace(services, c.services)
  replace(reasons, c.reasons)
  replace(faqs, c.faqs)
  replace(processSteps, c.process)
  replace(packages, c.packages.map(({ price_note: priceNote, ...p }) => ({ ...p, priceNote })))
  replace(caseStudies, c.case_studies.map((s) => ({ ...s, kpis: s.kpis.map((k) => [k.value, k.label]) })))
  replace(testimonials, c.testimonials.map((t) => ({ ...t, initial: initial(t.name) })))
  Object.assign(texts, { home: c.texts_home, pages: c.texts_pages, learning: c.texts_learning, general: c.texts_general })

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
