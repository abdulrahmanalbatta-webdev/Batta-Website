import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { seo } from './vite/seo.js'

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
