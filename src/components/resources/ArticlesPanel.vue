<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FilterChips from '@/components/ui/FilterChips.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import ArticleCard from '@/components/cards/ArticleCard.vue'
import { articles, articleCategories } from '@/data/articles'

const route = useRoute()
const router = useRouter()

// ?cat= in the link pre-selects the category
const catFromQuery = () => (articleCategories.includes(route.query.cat) ? route.query.cat : 'الكل')
const category = ref(catFromQuery())
watch(() => route.query.cat, () => (category.value = catFromQuery()))
const query = ref(String(route.query.q ?? ''))

// keep the search box in sync with ?q= (hero search), without losing other filters
watch(() => route.query.q, (q) => (query.value = String(q ?? '')))
watch(query, (q) => {
  const next = { ...route.query }
  if (q.trim()) next.q = q.trim()
  else delete next.q
  router.replace({ query: next })
})

const featured = articles.find((a) => a.featured)
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return articles.filter(
    (a) =>
      (q || !a.featured) &&
      (category.value === 'الكل' || a.category === category.value) &&
      (!q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)),
  )
})
</script>

<template>
  <div class="panel">
    <RouterLink v-if="featured && !query" class="card hover featured" :to="{ name: 'article', params: { id: featured.id } }">
      <div class="cover">
        <pre><span class="k">export async function</span> middleware(req) {
  const session = await auth(req)
  <span class="k">if</span> (!session)
    return redirect("/login")
}</pre>
      </div>
      <div class="body">
        <span class="pill">مقال مميز · {{ featured.category }}</span>
        <h3>{{ featured.title }}</h3>
        <p>{{ featured.excerpt }}</p>
        <div class="meta">
          <span><BaseIcon name="calendar" :size="16" />{{ featured.date }}</span>
          <span><BaseIcon name="clock" :size="16" />{{ featured.minutes }} دقيقة قراءة</span>
        </div>
        <span class="link-more">اقرأ المقال <BaseIcon name="arrow" :size="16" /></span>
      </div>
    </RouterLink>

    <div class="toolbar">
      <FilterChips v-model="category" :options="articleCategories" />
      <label class="search">
        <BaseIcon name="search" :size="16" />
        <input v-model="query" type="search" placeholder="ابحث بعنوان المقال…" aria-label="بحث في المقالات" />
      </label>
    </div>

    <div class="grid g3">
      <ArticleCard v-for="a in filtered" :key="a.id" :article="a" />
      <div v-if="!filtered.length" class="empty">لا توجد مقالات مطابقة. جرّب كلمة أخرى أو قسماً مختلفاً.</div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.featured {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  padding: 0;
  overflow: hidden;
  gap: 0;
}
.cover {
  background: var(--cover);
  border-inline-start: 4px solid var(--primary);
  padding: 32px;
  display: flex;
  align-items: center;
  min-height: 260px;
  direction: ltr;
  min-width: 0;
}
pre {
  margin: 0;
  font-family: var(--mono);
  font-size: 14px;
  line-height: 1.85;
  color: #c9d4e3;
  overflow-x: auto;
  max-width: 100%;
}
.k {
  color: #6ea8ff;
}
.body {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  justify-content: center;
}
.body h3 {
  font-size: 24px;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 0 12px;
  flex: 0 1 300px;
  color: var(--muted);
}
.search:focus-within {
  border-color: var(--primary);
}
.search input {
  border: 0;
  background: transparent;
  padding: 10px 0;
  flex: 1;
  min-width: 0;
  color: var(--fg);
}
.search input:focus {
  outline: none;
}
@media (max-width: 820px) {
  .featured {
    grid-template-columns: 1fr;
  }
}
</style>
