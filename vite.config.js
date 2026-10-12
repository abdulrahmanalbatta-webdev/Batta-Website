import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// يُقرأ من لوحة التحكم وقت البناء، لأن جوجل وواتساب وفيسبوك يقرؤون الصفحة قبل تشغيل JavaScript.
// محاولتان (الاستضافة المجانية قد تكون نائمة)؛ إن تعذّر الوصول يبقى ما في index.html ولا تُضاف الصفحات التفصيلية للـ sitemap.
async function fetchApi(apiUrl, path) {
  let lastError
  for (const timeout of [10000, 30000]) {
    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/${path}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(timeout) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()).data
    } catch (err) {
      lastError = err
    }
  }
  throw lastError
}

// الصفحات الثابتة في sitemap.xml، والتفصيلية (الدورات والمقالات والورش والمسارات) من اللوحة
const STATIC_PAGES = ['/', '/services', '/about', '/contact', '/paths', '/courses', '/workshops', '/articles', '/tools', '/privacy', '/terms']

function seo({ apiUrl, siteUrl }) {
  const site = siteUrl.replace(/\/$/, '')

  return {
    name: 'batta-seo',
    apply: 'build',
    transformIndexHtml: {
      order: 'pre',
      // عنوان الموقع ووصفه من اللوحة (محتوى الموقع ← محركات البحث والمشاركة)، وروابط المشاركة كاملة
      async handler(html) {
        let seo
        try {
          seo = (await fetchApi(apiUrl, 'content')).seo
        } catch (err) {
          console.warn(`\n[batta] لم أصل للوحة التحكم (${err.message})، بقي عنوان الموقع ووصفه كما في index.html`)
          return html
        }
        const title = escapeHtml(seo.title)
        const description = escapeHtml(seo.description)
        const share = escapeHtml(seo.share_description || seo.description)
        return html
          .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${share}`)
      },
    },
    async generateBundle() {
      const pages = [...STATIC_PAGES]
      const detail = [
        ['courses', (c) => `/courses/${c.slug}`],
        ['articles?per_page=50', (a) => `/articles/${a.slug}`],
        ['workshops', (w) => `/workshops/${w.id}`],
        ['paths', (p) => `/paths/${p.slug ?? p.id}`],
      ]
      for (const [path, url] of detail) {
        try {
          pages.push(...(await fetchApi(apiUrl, path)).map(url))
        } catch (err) {
          console.warn(`[batta] sitemap: تعذّر جلب ${path} (${err.message})`)
        }
      }
      const urls = pages.map((page) => `  <url><loc>${escapeHtml(site + encodeURI(page))}</loc></url>`).join('\n')
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n` })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nDisallow: /my-courses\nDisallow: /reset-password\n\nSitemap: ${site}/sitemap.xml\n` })
    },
  }
}

// الرابط العام في وسوم المشاركة (في التطوير والبناء)
const siteUrlTags = (siteUrl) => ({ name: 'batta-site-url', transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', siteUrl.replace(/\/$/, '')) })

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  const siteUrl = env.VITE_SITE_URL || 'https://batta-website.vercel.app'

  return {
    // same default as src/lib/api.js; the public address goes into the share tags, robots.txt and sitemap.xml
    plugins: [vue(), siteUrlTags(siteUrl), seo({ apiUrl: env.VITE_API_URL || 'http://localhost:8000/api/v1', siteUrl })],
    define: { __SITE_URL__: JSON.stringify(siteUrl.replace(/\/$/, '')) },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
