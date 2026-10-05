import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// عنوان الموقع ووصفه لمحركات البحث والمشاركة من لوحة التحكم (محتوى الموقع ← محركات البحث والمشاركة).
// يُكتب في index.html وقت البناء، لأن جوجل وواتساب وفيسبوك يقرؤون الصفحة قبل تشغيل JavaScript.
// إن تعذّر الوصول للوحة يبقى النص الموجود في index.html.
function dashboardMeta(apiUrl) {
  return {
    name: 'batta-dashboard-meta',
    apply: 'build',
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        let seo
        try {
          const res = await fetch(`${apiUrl.replace(/\/$/, '')}/content`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(8000) })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          seo = (await res.json()).data.seo
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
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    // same default as src/lib/api.js
    plugins: [vue(), dashboardMeta(env.VITE_API_URL || 'http://localhost:8000/api/v1')],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
