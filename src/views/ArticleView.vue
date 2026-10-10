<script setup>
import { computed, ref, onMounted, onBeforeUnmount, watch, watchEffect } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import ProfilePhoto from '@/components/ui/ProfilePhoto.vue'
import TopoPattern from '@/components/ui/TopoPattern.vue'
import ArticleCard from '@/components/cards/ArticleCard.vue'
import ArticleBody from '@/components/article/ArticleBody.vue'
import CommentsSection from '@/components/comments/CommentsSection.vue'
import SectionHeading from '@/components/ui/SectionHeading.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { profile } from '@/data/profile'
import { texts } from '@/data/texts'
import { api } from '@/lib/api'
import { toArticle, useArticles } from '@/composables/useContent'
import { useToast } from '@/composables/useToast'
import { siteTitle } from '@/router'

const props = defineProps({
  id: { type: String, required: true },
})

const { showToast } = useToast()
const { items: articles } = useArticles()
const author = { name: profile.name, role: profile.role }

// the full article (body included) from the dashboard; each visit counts one view there
const article = ref(null)
const loading = ref(true)
const error = ref('')
const missing = ref(false)
async function load() {
  loading.value = true
  error.value = ''
  missing.value = false
  try {
    article.value = toArticle((await api.get(`articles/${encodeURIComponent(props.id)}`)).data)
  } catch (err) {
    article.value = null
    if (err.status === 404) missing.value = true
    else error.value = err.message
  } finally {
    loading.value = false
  }
}
watch(() => props.id, load, { immediate: true })

watchEffect(() => {
  if (article.value) document.title = siteTitle(article.value.title)
})

const toc = computed(() => (article.value?.body ?? []).filter((b) => b.type === 'h2').map((b, i) => ({ id: `section-${i + 1}`, text: b.text })))

const index = computed(() => articles.value.findIndex((a) => a.id === props.id))
const newer = computed(() => (index.value > 0 ? articles.value[index.value - 1] : null))
const older = computed(() => (index.value >= 0 ? articles.value[index.value + 1] : null))

const related = computed(() => {
  const same = articles.value.filter((a) => a.id !== props.id && a.category === article.value?.category)
  const others = articles.value.filter((a) => a.id !== props.id && a.category !== article.value?.category)
  return [...same, ...others].slice(0, 3)
})

// reading progress bar
const progress = ref(0)
function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  progress.value = max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    showToast('تم نسخ رابط المقال')
  } catch {
    showToast('تعذّر النسخ، انسخ الرابط من شريط العنوان')
  }
}
</script>

<template>
  <NotFoundView v-if="missing" />
  <section v-else-if="!article" class="page-body"><div class="container"><LoadState :loading="loading" :error="error" @retry="load" /></div></section>

  <div v-else>
    <div class="progress" :style="{ width: `${progress}%` }" />

    <header class="article-hero">
      <TopoPattern tone="dark" />
      <div class="container narrow">
        <span class="pill">{{ article.category }}</span>
        <h1>{{ article.title }}</h1>
        <p class="lead">{{ article.excerpt }}</p>
        <div class="byline">
          <ProfilePhoto :size="44" />
          <div>
            <b>{{ article.author || author.name }}</b>
            <div class="meta">
              <span><BaseIcon name="calendar" :size="15" />{{ article.date }}</span>
              <span><BaseIcon name="clock" :size="15" />{{ article.minutes }} دقيقة قراءة</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <section class="page-body">
      <div class="container layout">
        <article class="content">
          <img v-if="article.cover" class="article-cover" :src="article.cover" :alt="article.title" />
          <ArticleBody :blocks="article.body" />

          <div v-if="article.tags?.length" class="tags">
            <span v-for="tag in article.tags" :key="tag" class="pill line mono">#{{ tag }}</span>
          </div>

          <div class="author-box card">
            <ProfilePhoto :size="64" />
            <div>
              <b>{{ author.name }}</b>
              <p>{{ author.role }}. {{ texts.learning.articles.author_bio }}</p>
              <RouterLink to="/about" class="link-more">{{ texts.ui.buttons.about_author }}</RouterLink>
            </div>
          </div>

          <nav class="pager" aria-label="مقالات أخرى">
            <RouterLink v-if="older" class="card hover pager-link" :to="{ name: 'article', params: { id: older.id } }">
              <span class="dir"><BaseIcon name="prev" :size="16" />المقال السابق</span>
              <b>{{ older.title }}</b>
            </RouterLink>
            <span v-else />
            <RouterLink v-if="newer" class="card hover pager-link end" :to="{ name: 'article', params: { id: newer.id } }">
              <span class="dir">المقال التالي<BaseIcon name="next" :size="16" /></span>
              <b>{{ newer.title }}</b>
            </RouterLink>
          </nav>

          <CommentsSection type="article" :target="props.id" />
        </article>

        <aside class="sidebar">
          <div v-if="toc.length" class="card toc">
            <h4>في هذا المقال</h4>
            <ol>
              <li v-for="item in toc" :key="item.id"><a :href="`#${item.id}`">{{ item.text }}</a></li>
            </ol>
          </div>
          <button class="btn btn-ghost btn-block" type="button" @click="copyLink">
            <BaseIcon name="link" :size="18" />نسخ رابط المقال
          </button>
        </aside>
      </div>
    </section>

    <section v-if="related.length" class="section tinted">
      <div class="container">
        <SectionHeading :eyebrow="texts.learning.articles.related_eyebrow" :title="texts.learning.articles.related_title" />
        <div class="grid g3">
          <ArticleCard v-for="a in related" :key="a.id" :article="a" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.progress {
  position: fixed;
  top: 0;
  inset-inline-start: 0;
  height: 3px;
  background: var(--primary);
  z-index: 50;
  transition: width 0.1s linear;
}
.article-hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: var(--ink-panel);
  padding-block: 56px 48px;
}
.article-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(45% 90% at 85% 0%, rgba(0, 102, 255, 0.35), transparent 70%);
}
.narrow {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.narrow > * {
  max-width: 760px;
}
.article-hero .pill {
  background: var(--primary);
  color: #fff;
}
h1 {
  font-size: clamp(28px, 4.2vw, 42px);
  line-height: 1.45;
  color: #fff;
}
.lead {
  font-size: 19px;
  color: var(--ink-text);
}
.byline {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 6px;
}
.byline b {
  color: #fff;
}
.byline .meta {
  color: var(--ink-text);
}
.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--surface);
  border: 1px solid var(--line);
  display: grid;
  place-items: center;
  flex: none;
}
.avatar.lg {
  width: 64px;
  height: 64px;
}

.layout {
  display: grid !important;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 48px;
  align-items: start;
}
.content {
  max-width: 760px;
  min-width: 0;
}
.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 36px;
}
.author-box {
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-top: 28px;
}
.author-box b {
  color: var(--fg);
  font-size: 16px;
}
.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 28px;
}
.pager-link {
  gap: 6px;
  padding: 18px 20px;
}
.pager-link.end {
  text-align: left;
}
.pager-link.end .dir {
  justify-content: flex-end;
}
.dir {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--muted);
}
.pager-link b {
  color: var(--fg);
  font-size: 15px;
  line-height: 1.6;
}
.pager-link:hover b {
  color: var(--primary-600);
}

.sidebar {
  position: sticky;
  top: calc(var(--header-h) + 24px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.toc h4 {
  font-size: 15px;
}
.toc ol {
  margin: 0;
  padding-inline-start: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14.5px;
  color: var(--muted);
}
.toc li::marker {
  color: var(--primary);
  font-weight: 700;
}
.toc a:hover {
  color: var(--primary-600);
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .sidebar {
    position: static;
    order: -1;
  }
}
@media (max-width: 620px) {
  .pager {
    grid-template-columns: 1fr;
  }
}
.article-cover {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--r);
  border: 1px solid var(--line);
  margin-bottom: 28px;
  background: var(--tint);
}
</style>
