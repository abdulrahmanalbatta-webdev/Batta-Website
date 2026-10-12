// محركات البحث والذكاء الاصطناعي: صفحات HTML جاهزة وقت البناء.
// معظم زواحف الذكاء الاصطناعي (GPTBot, ClaudeBot, PerplexityBot…) وروابط المشاركة لا تشغّل JavaScript، فترى صفحة فارغة.
// لذلك يُكتب لكل صفحة ملف HTML فيه عنوانها ووصفها ونصها الكامل وبياناتها المنظّمة (JSON-LD)، ثم يستلمها Vue عند التحميل.
// ومعها sitemap.xml وrobots.txt وllms.txt (فهرس للموقع بصيغة يقرؤها الذكاء الاصطناعي) وllms-full.txt (النصوص كاملة).
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { markdownToBlocks } from '../src/lib/markdown.js'

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
const clip = (text, max = 160) => {
  const flat = String(text ?? '').replace(/\s+/g, ' ').trim()
  return flat.length > max ? `${flat.slice(0, max - 1).trim()}…` : flat
}
const list = (items, render) => (items?.length ? `<ul>${items.map((item) => `<li>${render(item)}</li>`).join('')}</ul>` : '')
const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`

async function fetchApi(apiUrl, path) {
  let lastError
  // two tries: the free host may be asleep
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

async function tryFetch(apiUrl, path, fallback) {
  try {
    return await fetchApi(apiUrl, path)
  } catch (err) {
    console.warn(`[batta] تعذّر جلب ${path} (${err.message})`)
    return fallback
  }
}

function markdownToHtml(source) {
  return markdownToBlocks(source)
    .map((b) => {
      if (b.type === 'h2') return `<h2>${esc(b.text)}</h2>`
      if (b.type === 'list') return list(b.items, esc)
      if (b.type === 'code') return `<pre><code>${esc(b.code)}</code></pre>`
      if (b.type === 'tip') return `<blockquote>${esc(b.text)}</blockquote>`
      return `<p>${esc(b.text)}</p>`
    })
    .join('\n')
}

function markdownToText(source) {
  return markdownToBlocks(source)
    .map((b) => (b.type === 'h2' ? `## ${b.text}` : b.type === 'list' ? b.items.map((i) => `- ${i}`).join('\n') : b.type === 'code' ? '```\n' + b.code + '\n```' : b.text))
    .join('\n\n')
}

// everything the pages are built from; a part that fails to load leaves its pages out
async function loadData(apiUrl) {
  const content = await tryFetch(apiUrl, 'content', null)
  const settings = await tryFetch(apiUrl, 'settings', {})
  const courses = await tryFetch(apiUrl, 'courses', [])
  const workshops = await tryFetch(apiUrl, 'workshops', [])
  const paths = await tryFetch(apiUrl, 'paths', [])
  const tools = await tryFetch(apiUrl, 'tools', [])
  const articleList = await tryFetch(apiUrl, 'articles?per_page=50', [])

  const courseDetails = []
  for (const c of courses) courseDetails.push((await tryFetch(apiUrl, `courses/${encodeURIComponent(c.slug)}`, null)) ?? c)
  const articles = []
  for (const a of articleList) articles.push((await tryFetch(apiUrl, `articles/${encodeURIComponent(a.slug)}`, null)) ?? a)
  const pathDetails = []
  for (const p of paths) pathDetails.push((await tryFetch(apiUrl, `paths/${encodeURIComponent(p.id)}`, null)) ?? p)

  return { content, settings, courses: courseDetails, workshops, paths: pathDetails, tools, articles }
}

function buildPages(data, site) {
  const { content, settings, courses, workshops, paths, tools, articles } = data
  const name = content?.brand?.name || content?.profile?.name || settings.site_name || 'Batta'
  const role = content?.profile?.role || ''
  const seo = content?.seo ?? {}
  const pagesText = content?.texts_ui?.pages ?? {}
  const socials = (content?.socials ?? []).map((s) => s.url).filter(Boolean)
  const url = (path) => site + (path === '/' ? '/' : path)

  const person = {
    '@type': 'Person',
    '@id': `${site}/#person`,
    name,
    jobTitle: role || undefined,
    description: content?.profile?.short || undefined,
    url: url('/about'),
    image: content?.photo || undefined,
    email: settings.contact_email || undefined,
    sameAs: socials.length ? socials : undefined,
    knowsAbout: (content?.technologies ?? []).length ? content.technologies : undefined,
  }
  const website = { '@type': 'WebSite', '@id': `${site}/#website`, name, url: url('/'), inLanguage: 'ar', publisher: { '@id': `${site}/#person` } }
  const breadcrumbs = (trail) => ({
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: pagesText.home || 'الرئيسية', path: '/' }, ...trail].map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: url(t.path) })),
  })
  const faqs = content?.faqs ?? []
  const faqPage = faqs.length ? { '@type': 'FAQPage', mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) } : null

  const pages = []
  const add = (page) => pages.push({ description: seo.description, ...page })

  const courseLinks = list(courses, (c) => `${link(`/courses/${c.slug}`, c.title)}: ${esc(c.short_description)}`)
  const articleLinks = list(articles, (a) => `${link(`/articles/${a.slug}`, a.title)}: ${esc(a.excerpt)}`)
  const pathLinks = list(paths, (p) => `${link(`/paths/${p.id}`, p.title)}: ${esc(p.summary)}`)
  const workshopLinks = list(workshops, (w) => `${link(`/workshops/${w.id}`, w.title)} (${esc(w.date)})`)
  const services = content?.services ?? []
  const serviceList = list(services, (s) => `<strong>${esc(s.title)}</strong>: ${esc(s.text)}${s.features?.length ? list(s.features, esc) : ''}`)
  const faqList = faqs.length ? `<h2>الأسئلة الشائعة</h2>${faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}` : ''

  add({
    path: '/',
    title: seo.title || name,
    body: `<h1>${esc(name)}${role ? ` — ${esc(role)}` : ''}</h1>
<p>${esc(content?.profile?.short)}</p>
${services.length ? `<h2>${esc(pagesText.services || 'الخدمات')}</h2>${serviceList}` : ''}
${paths.length ? `<h2>${esc(pagesText.paths || 'المسارات')}</h2>${pathLinks}` : ''}
${courses.length ? `<h2>${esc(pagesText.courses || 'الدورات')}</h2>${courseLinks}` : ''}
${articles.length ? `<h2>${esc(pagesText.articles || 'المقالات')}</h2>${list(articles.slice(0, 10), (a) => link(`/articles/${a.slug}`, a.title))}` : ''}
${faqList}`,
    jsonLd: [person, website, faqPage],
  })

  const profile = content?.profile ?? {}
  add({
    path: '/about',
    title: `${pagesText.about || 'من أنا'} | ${name}`,
    description: clip(profile.short) || seo.description,
    body: `<h1>${esc(name)}</h1>
${role ? `<p><strong>${esc(role)}</strong></p>` : ''}
${(profile.story ?? []).map((p) => `<p>${esc(p)}</p>`).join('\n')}
${(content?.highlights ?? []).length ? `<h2>ماذا أفعل</h2>${list(content.highlights, (h) => `<strong>${esc(h.title)}</strong>: ${esc(h.text)}`)}` : ''}
${(content?.journey ?? []).length ? `<h2>المسيرة</h2>${list(content.journey, (j) => `<strong>${esc(j.label)} — ${esc(j.title)}</strong>: ${esc(j.text)}`)}` : ''}
${(content?.values ?? []).length ? `<h2>قيمي في العمل</h2>${list(content.values, (v) => `<strong>${esc(v.title)}</strong>: ${esc(v.text)}`)}` : ''}
${socials.length ? `<h2>حساباتي</h2>${list(socials, (s) => link(s, s))}` : ''}`,
    jsonLd: [{ '@type': 'ProfilePage', mainEntity: person }, breadcrumbs([{ name: pagesText.about || 'من أنا', path: '/about' }])],
  })

  add({
    path: '/services',
    title: `${pagesText.services || 'الخدمات'} | ${name}`,
    description: clip(services.map((s) => s.title).join('، ')) || seo.description,
    body: `<h1>${esc(pagesText.services || 'الخدمات')}</h1>
${serviceList}
${(content?.packages ?? []).length ? `<h2>الباقات</h2>${list(content.packages, (p) => `<strong>${esc(p.title)}</strong> (${esc(p.price)}${p.price_note ? ` ${esc(p.price_note)}` : ''})${p.features?.length ? list(p.features, esc) : ''}`)}` : ''}
${(content?.process ?? []).length ? `<h2>مراحل العمل</h2>${list(content.process, (s) => `<strong>${esc(s.title)}</strong>: ${esc(s.text)}`)}` : ''}
${faqList}`,
    jsonLd: [
      ...services.map((s) => ({ '@type': 'Service', name: s.title, description: s.text, provider: { '@id': `${site}/#person` }, areaServed: 'Worldwide', availableLanguage: 'ar' })),
      faqPage,
      breadcrumbs([{ name: pagesText.services || 'الخدمات', path: '/services' }]),
    ],
  })

  add({
    path: '/courses',
    title: `${pagesText.courses || 'الدورات'} | ${name}`,
    description: clip(content?.texts_learning?.courses?.text) || seo.description,
    body: `<h1>${esc(pagesText.courses || 'الدورات')}</h1>${courseLinks}`,
    jsonLd: [{ '@type': 'ItemList', itemListElement: courses.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: url(`/courses/${c.slug}`), name: c.title })) }],
  })
  for (const c of courses) {
    add({
      path: `/courses/${c.slug}`,
      title: `${c.title} | ${name}`,
      description: clip(c.short_description),
      image: c.cover_url,
      body: `<h1>${esc(c.title)}</h1>
<p>${esc(c.short_description)}</p>
${c.level_label ? `<p>المستوى: ${esc(c.level_label)}</p>` : ''}
${c.description ? markdownToHtml(c.description) : ''}
${c.outcomes?.length ? `<h2>ماذا ستتعلّم</h2>${list(c.outcomes, esc)}` : ''}
${c.tags?.length ? `<p>${c.tags.map(esc).join(' · ')}</p>` : ''}`,
      jsonLd: [
        {
          '@type': 'Course',
          name: c.title,
          description: c.short_description,
          url: url(`/courses/${c.slug}`),
          image: c.cover_url || undefined,
          inLanguage: 'ar',
          educationalLevel: c.level_label || undefined,
          teaches: c.outcomes?.length ? c.outcomes : undefined,
          provider: { '@id': `${site}/#person` },
          instructor: { '@id': `${site}/#person` },
          aggregateRating: c.reviews ? { '@type': 'AggregateRating', ratingValue: c.rating, reviewCount: c.reviews } : undefined,
        },
        breadcrumbs([
          { name: pagesText.courses || 'الدورات', path: '/courses' },
          { name: c.title, path: `/courses/${c.slug}` },
        ]),
      ],
    })
  }

  add({
    path: '/articles',
    title: `${pagesText.articles || 'المقالات'} | ${name}`,
    body: `<h1>${esc(pagesText.articles || 'المقالات')}</h1>${articleLinks}`,
    jsonLd: [{ '@type': 'Blog', name: `${pagesText.articles || 'المقالات'} | ${name}`, url: url('/articles'), author: { '@id': `${site}/#person` } }],
  })
  for (const a of articles) {
    add({
      path: `/articles/${a.slug}`,
      title: `${a.meta_title || a.title} | ${name}`,
      description: clip(a.meta_description || a.excerpt),
      image: a.cover_url,
      type: 'article',
      body: `<article><h1>${esc(a.title)}</h1>
<p>${esc(a.author || name)}${a.published_at ? ` · <time datetime="${esc(a.published_at)}">${esc(a.published_at.slice(0, 10))}</time>` : ''}</p>
<p>${esc(a.excerpt)}</p>
${a.body ? markdownToHtml(a.body) : ''}</article>`,
      jsonLd: [
        {
          '@type': 'BlogPosting',
          headline: a.title,
          description: a.meta_description || a.excerpt,
          url: url(`/articles/${a.slug}`),
          mainEntityOfPage: url(`/articles/${a.slug}`),
          image: a.cover_url || undefined,
          datePublished: a.published_at || undefined,
          dateModified: a.updated_at || a.published_at || undefined,
          inLanguage: 'ar',
          articleSection: a.category_label || undefined,
          author: { '@id': `${site}/#person` },
          publisher: { '@id': `${site}/#person` },
        },
        breadcrumbs([
          { name: pagesText.articles || 'المقالات', path: '/articles' },
          { name: a.title, path: `/articles/${a.slug}` },
        ]),
      ],
    })
  }

  add({
    path: '/paths',
    title: `${pagesText.paths || 'المسارات'} | ${name}`,
    description: clip(content?.texts_learning?.paths?.text) || seo.description,
    body: `<h1>${esc(pagesText.paths || 'المسارات')}</h1>${pathLinks}`,
  })
  for (const p of paths) {
    add({
      path: `/paths/${p.id}`,
      title: `${p.title} | ${name}`,
      description: clip(p.summary),
      body: `<h1>${esc(p.title)}</h1>
<p>${esc(p.summary)}</p>
${p.audience ? `<p>لمن: ${esc(p.audience)}</p>` : ''}
${p.duration ? `<p>المدة: ${esc(p.duration)}</p>` : ''}
${p.outcomes?.length ? `<h2>ماذا ستحقق</h2>${list(p.outcomes, esc)}` : ''}
${(p.stages ?? []).map((s, i) => `<h2>${i + 1}. ${esc(s.title)}</h2><p>${esc(s.text)}</p>${s.topics?.length ? list(s.topics, esc) : ''}`).join('\n')}`,
      jsonLd: [
        { '@type': 'Course', name: p.title, description: p.summary, url: url(`/paths/${p.id}`), inLanguage: 'ar', provider: { '@id': `${site}/#person` }, teaches: p.outcomes?.length ? p.outcomes : undefined },
        breadcrumbs([
          { name: pagesText.paths || 'المسارات', path: '/paths' },
          { name: p.title, path: `/paths/${p.id}` },
        ]),
      ],
    })
  }

  add({ path: '/workshops', title: `${pagesText.workshops || 'الورش'} | ${name}`, body: `<h1>${esc(pagesText.workshops || 'الورش')}</h1>${workshopLinks}` })
  for (const w of workshops) {
    const online = /online|أونلاين|عن بعد/i.test(`${w.format} ${w.format_label}`)
    add({
      path: `/workshops/${w.id}`,
      title: `${w.title} | ${name}`,
      description: clip(w.description),
      body: `<h1>${esc(w.title)}</h1>
<p>${esc(w.date)} ${esc(w.time)} · ${esc(w.format_label)}${w.place ? ` · ${esc(w.place)}` : ''}</p>
${w.description ? markdownToHtml(w.description) : ''}`,
      jsonLd: [
        {
          '@type': 'Event',
          name: w.title,
          description: clip(w.description, 500),
          startDate: w.time ? `${w.date}T${w.time}` : w.date,
          eventAttendanceMode: `https://schema.org/${online ? 'Online' : 'Offline'}EventAttendanceMode`,
          location: online ? { '@type': 'VirtualLocation', url: url(`/workshops/${w.id}`) } : { '@type': 'Place', name: w.place || name },
          organizer: { '@id': `${site}/#person` },
          url: url(`/workshops/${w.id}`),
          inLanguage: 'ar',
        },
      ],
    })
  }

  add({
    path: '/tools',
    title: `${pagesText.tools || 'أدواتي'} | ${name}`,
    body: `<h1>${esc(pagesText.tools || 'أدواتي')}</h1>
${tools.map((cat) => `<h2>${esc(cat.name)}</h2>${list(cat.tools, (t) => `<strong>${esc(t.name)}</strong>${t.why ? `: ${esc(t.why)}` : ''}`)}`).join('\n')}`,
  })

  add({
    path: '/contact',
    title: `${pagesText.contact || 'تواصل معي'} | ${name}`,
    body: `<h1>${esc(pagesText.contact || 'تواصل معي')}</h1>
${settings.contact_email ? `<p>${link(`mailto:${settings.contact_email}`, settings.contact_email)}</p>` : ''}
${settings.whatsapp ? `<p>واتساب: ${esc(settings.whatsapp)}</p>` : ''}`,
    jsonLd: [{ '@type': 'ContactPage', about: { '@id': `${site}/#person` } }],
  })

  for (const key of ['privacy', 'terms']) {
    const legal = content?.[key]
    if (!legal) continue
    add({
      path: `/${key}`,
      title: `${legal.title} | ${name}`,
      description: clip(legal.intro),
      body: `<h1>${esc(legal.title)}</h1>
<p>${esc(legal.intro)}</p>
${legal.sections.map((s, i) => `<h2 id="section-${i + 1}">${i + 1}. ${esc(s.title)}</h2>${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}`).join('\n')}`,
    })
  }

  return { pages, name, role, person, services }
}

function renderPage(template, page, site, name) {
  const pageUrl = site + (page.path === '/' ? '/' : page.path)
  const title = esc(page.title)
  const description = esc(clip(page.description, 300))
  const image = page.image || `${site}/icon-512.png`
  const graph = (page.jsonLd ?? []).filter(Boolean)
  const jsonLd = graph.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>\n  ` : ''
  const nav = [
    ['/', 'الرئيسية'],
    ['/services', 'الخدمات'],
    ['/paths', 'المسارات'],
    ['/courses', 'الدورات'],
    ['/workshops', 'الورش'],
    ['/articles', 'المقالات'],
    ['/about', 'من أنا'],
    ['/contact', 'تواصل معي'],
  ]
    .map(([href, text]) => link(href, text))
    .join(' · ')

  return template
    .replace(/<title>.*?<\/title>/s, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${description}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${description}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${esc(pageUrl)}`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${esc(image)}`)
    .replace(/(<meta property="og:type" content=")[^"]*/, `$1${page.type || 'website'}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${esc(pageUrl)}`)
    .replace('</head>', `  ${jsonLd}</head>`)
    .replace('<div id="app"></div>', `<div id="app"><div class="prerender"><nav>${link('/', name)} — ${nav}</nav><main>${page.body}</main></div></div>`)
}

function llmsTxt({ pages, name, role }, data, site) {
  const { content, courses, articles, paths, workshops, settings } = data
  const line = (path, title, text) => `- [${title}](${site}${path})${text ? `: ${clip(text, 200)}` : ''}`
  const section = (title, items) => (items.length ? `\n## ${title}\n\n${items.join('\n')}\n` : '')
  const index = `# ${name}

> ${clip(content?.seo?.description || content?.profile?.short || role, 400)}

${clip(content?.profile?.short, 800)}
${section('عني', [line('/about', 'من أنا', role), line('/services', 'الخدمات', (content?.services ?? []).map((s) => s.title).join('، ')), line('/contact', 'تواصل معي', settings.contact_email)])}${section(
    'مسارات التعلّم',
    paths.map((p) => line(`/paths/${p.id}`, p.title, p.summary)),
  )}${section(
    'الدورات',
    courses.map((c) => line(`/courses/${c.slug}`, c.title, c.short_description)),
  )}${section(
    'الورش',
    workshops.map((w) => line(`/workshops/${w.id}`, w.title, `${w.date} — ${clip(w.description, 140)}`)),
  )}${section(
    'المقالات',
    articles.map((a) => line(`/articles/${a.slug}`, a.title, a.excerpt)),
  )}
## Optional

- [النصوص كاملة](${site}/llms-full.txt)
- [خريطة الموقع](${site}/sitemap.xml)
`

  const full = [
    index,
    ...courses.map((c) => `\n---\n\n# ${c.title}\n\n${site}/courses/${c.slug}\n\n${c.short_description ?? ''}\n\n${c.description ? markdownToText(c.description) : ''}\n${c.outcomes?.length ? `\nماذا ستتعلّم:\n${c.outcomes.map((o) => `- ${o}`).join('\n')}\n` : ''}`),
    ...paths.map((p) => `\n---\n\n# ${p.title}\n\n${site}/paths/${p.id}\n\n${p.summary ?? ''}\n\n${(p.stages ?? []).map((s, i) => `## ${i + 1}. ${s.title}\n\n${s.text ?? ''}${s.topics?.length ? '\n' + s.topics.map((t) => `- ${t}`).join('\n') : ''}`).join('\n\n')}\n`),
    ...articles.map((a) => `\n---\n\n# ${a.title}\n\n${site}/articles/${a.slug}\n${a.published_at ? `${a.published_at.slice(0, 10)} · ` : ''}${a.author || name}\n\n${a.body ? markdownToText(a.body) : (a.excerpt ?? '')}\n`),
  ].join('')

  return { index, full, count: pages.length }
}

export function seo({ apiUrl, siteUrl }) {
  const site = siteUrl.replace(/\/$/, '')
  let outDir = 'dist'

  return {
    name: 'batta-seo',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    async writeBundle() {
      const data = await loadData(apiUrl)
      const built = buildPages(data, site)
      // Google Search Console and Bing ownership (dashboard → Settings → Analytics), on every page
      const verification = [
        ['google-site-verification', data.settings.google_site_verification],
        ['msvalidate.01', data.settings.bing_site_verification],
      ]
        .filter(([, code]) => /^[A-Za-z0-9_-]{10,100}$/.test(code ?? ''))
        .map(([name, code]) => `<meta name="${name}" content="${code}" />\n  `)
        .join('')
      const template = (await readFile(join(outDir, 'index.html'), 'utf8')).replace('</head>', `  ${verification}</head>`)
      if (verification) await writeFile(join(outDir, 'index.html'), template)

      if (!data.content) {
        console.warn('[batta] لم أصل للوحة التحكم: بقيت index.html كما هي، بلا صفحات جاهزة')
      } else {
        for (const page of built.pages) {
          // /courses/x → courses/x.html (vercel.json: cleanUrls); the home page is index.html itself
          const file = page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`
          await mkdir(dirname(join(outDir, file)), { recursive: true })
          await writeFile(join(outDir, file), renderPage(template, page, site, built.name))
        }
        const { index, full } = llmsTxt(built, data, site)
        await writeFile(join(outDir, 'llms.txt'), index)
        await writeFile(join(outDir, 'llms-full.txt'), full)
      }

      const paths = data.content ? built.pages.map((p) => p.path) : ['/']
      const urls = paths.map((path) => `  <url><loc>${esc(site + (path === '/' ? '/' : encodeURI(path)))}</loc></url>`).join('\n')
      await writeFile(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
      // AI crawlers are welcome by name (some sites block them; this one wants to be cited)
      const bots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'meta-externalagent', 'Bingbot']
      await writeFile(
        join(outDir, 'robots.txt'),
        `${bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n')}\nUser-agent: *\nAllow: /\nDisallow: /my-courses\nDisallow: /reset-password\n\nSitemap: ${site}/sitemap.xml\n`,
      )
      console.log(`[batta] ${data.content ? built.pages.length : 0} صفحة جاهزة، وsitemap.xml وrobots.txt${data.content ? ' وllms.txt' : ''}`)
    },
  }
}
