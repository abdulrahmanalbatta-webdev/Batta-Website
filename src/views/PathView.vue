<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import LoadState from '@/components/ui/LoadState.vue'
import CourseCard from '@/components/cards/CourseCard.vue'
import WorkshopCard from '@/components/cards/WorkshopCard.vue'
import ArticleCard from '@/components/cards/ArticleCard.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { api } from '@/lib/api'
import { toPath, usePaths } from '@/composables/useContent'
import { texts } from '@/data/texts'
import { siteTitle } from '@/router'

// خريطة مسار واحد: مراحله بالترتيب على خط عمودي، وفي كل مرحلة مواضيعها ومصادر مجانية تفتح في تبويب جديد،
// ودوراتي وورشي ومقالاتي المرتبطة بها من لوحة التحكم
const props = defineProps({
  id: { type: String, required: true },
})

const path = ref(null)
const loading = ref(true)
const error = ref('')
const missing = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  missing.value = false
  try {
    path.value = toPath((await api.get(`paths/${encodeURIComponent(props.id)}`)).data)
  } catch (err) {
    path.value = null
    if (err.status === 404) missing.value = true
    else error.value = err.message
  } finally {
    loading.value = false
  }
}
watch(() => props.id, load, { immediate: true })
watchEffect(() => {
  if (path.value) document.title = siteTitle(path.value.title)
})

const linkedIn = (stage) => stage.courses.length + stage.workshops.length + stage.articles.length
const { items: allPaths } = usePaths()
const others = computed(() => allPaths.value.filter((p) => p.id !== props.id).slice(0, 3))

const TYPES = {
  video: { label: 'فيديو', icon: 'play' },
  course: { label: 'دورة', icon: 'award' },
  docs: { label: 'توثيق', icon: 'article' },
  article: { label: 'مقال', icon: 'article' },
  book: { label: 'كتاب', icon: 'article' },
  practice: { label: 'تمارين', icon: 'code' },
}
const LANGS = { ar: 'عربي', en: 'English' }
const host = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
</script>

<template>
  <NotFoundView v-if="missing" />
  <section v-else-if="!path" class="page-body">
    <div class="container"><LoadState :loading="loading" :error="error" @retry="load" /></div>
  </section>
  <div v-else>
    <PageHero :title="path.title" :eyebrow="texts.ui.pages.paths" :subtitle="path.summary">
      <span><BaseIcon name="clock" :size="16" />{{ path.duration }}</span>
      <span><BaseIcon name="pin" :size="16" /><b>{{ path.stages.length }}</b> مراحل</span>
      <span><BaseIcon name="link" :size="16" /><b>{{ path.resources_count }}</b> مصدراً مجانياً</span>
    </PageHero>

    <section class="page-body">
      <div class="container layout">
        <ol class="roadmap">
          <li v-for="(s, i) in path.stages" :key="s.title" class="stage">
            <span class="num" aria-hidden="true">{{ i + 1 }}</span>
            <div class="card stage-card">
              <span class="step">المرحلة {{ i + 1 }}</span>
              <h2>{{ s.title }}</h2>
              <p class="text">{{ s.text }}</p>
              <ul v-if="s.topics.length" class="topics" aria-label="المواضيع">
                <li v-for="t in s.topics" :key="t">{{ t }}</li>
              </ul>
              <div v-if="s.resources.length" class="resources">
                <h3>مصادر مجانية</h3>
                <a v-for="r in s.resources" :key="r.url" class="resource" :href="r.url" target="_blank" rel="noopener noreferrer">
                  <span class="r-ico"><BaseIcon :name="TYPES[r.type]?.icon ?? 'link'" :size="18" /></span>
                  <span class="r-main">
                    <b>{{ r.title }}</b>
                    <small dir="ltr">{{ host(r.url) }}</small>
                  </span>
                  <span class="r-tags">
                    <span class="tag">{{ TYPES[r.type]?.label }}</span>
                    <span class="tag" :class="{ ar: r.lang === 'ar' }">{{ LANGS[r.lang] }}</span>
                  </span>
                  <span class="r-go" aria-hidden="true"><BaseIcon name="arrow" :size="16" /></span>
                </a>
              </div>
              <div v-if="linkedIn(s)" class="linked">
                <h3>تعلّم معي في هذه المرحلة</h3>
                <div v-if="s.courses.length || s.articles.length" class="linked-grid">
                  <CourseCard v-for="c in s.courses" :key="'c' + c.id" :course="c" />
                  <ArticleCard v-for="a in s.articles" :key="'a' + a.id" :article="a" />
                </div>
                <WorkshopCard v-for="w in s.workshops" :key="'w' + w.id" :workshop="w" />
              </div>
            </div>
          </li>
          <li class="stage finish">
            <span class="num" aria-hidden="true"><BaseIcon name="check" :size="16" /></span>
            <div class="finish-text">
              <b>خلّصت المسار؟</b>
              <span>اعرض مشاريعك، وإن أردت تعلّماً أعمق مع متابعة، تصفّح <RouterLink to="/courses">الدورات</RouterLink> و<RouterLink to="/workshops">الورش</RouterLink>.</span>
            </div>
          </li>
        </ol>

        <aside class="side">
          <div class="card about">
            <h2>عن المسار</h2>
            <p class="for"><BaseIcon name="user" :size="16" />{{ path.audience }}</p>
            <template v-if="path.outcomes.length">
              <h3>في آخره تستطيع</h3>
              <ul class="outcomes">
                <li v-for="o in path.outcomes" :key="o"><BaseIcon name="check" :size="16" />{{ o }}</li>
              </ul>
            </template>
            <p class="free"><BaseIcon name="star" :size="16" />كل المصادر مجانية، وتفتح في تبويب جديد.</p>
          </div>
          <div v-if="others.length" class="card more">
            <h3>مسارات أخرى</h3>
            <RouterLink v-for="o in others" :key="o.id" class="other" :to="{ name: 'path', params: { id: o.id } }">
              <span class="ico-box sm"><BaseIcon :name="o.icon" :size="18" /></span>
              <span>{{ o.title }}</span>
            </RouterLink>
            <RouterLink class="link-more" to="/paths">كل المسارات <BaseIcon name="arrow" :size="16" /></RouterLink>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 32px;
  align-items: start;
}

/* the map: numbered dots on one line, a card per stage */
.roadmap {
  list-style: none;
  margin: 0;
  padding: 0;
}
.stage {
  position: relative;
  padding-inline-start: 58px;
  padding-bottom: 24px;
}
.stage::before {
  content: '';
  position: absolute;
  top: 40px;
  bottom: 0;
  inset-inline-start: 19px;
  width: 2px;
  background: linear-gradient(to bottom, var(--primary), color-mix(in srgb, var(--primary) 25%, var(--line)));
}
.stage.finish::before {
  display: none;
}
.num {
  position: absolute;
  inset-inline-start: 0;
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--primary) 12%, transparent);
}
.stage-card {
  gap: 10px;
}
.step {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary-600);
}
.stage-card h2 {
  font-size: 21px;
}
.text {
  color: var(--text);
  line-height: 1.9;
}
.topics {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.topics li {
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--tint-2);
  border: 1px solid var(--line);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--fg);
}
.resources {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.resources h3 {
  font-size: 14px;
  color: var(--muted);
}
.resource {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: 12px;
  color: inherit;
  transition:
    border-color 0.2s,
    background 0.2s,
    transform 0.2s;
}
.resource:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
  transform: translateX(-3px);
}
.r-ico {
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--primary-soft);
  color: var(--primary-600);
}
.r-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.r-main b {
  color: var(--fg);
  font-size: 15px;
}
.r-main small {
  color: var(--muted);
  font-size: 12.5px;
  text-align: start;
}
.r-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.tag {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--tint-2);
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
}
.tag.ar {
  background: var(--green-soft);
  color: var(--green);
}
.r-go {
  color: var(--muted);
}
.linked {
  margin-top: 10px;
  padding-top: 16px;
  border-top: 1px dashed var(--line);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.linked h3 {
  font-size: 14px;
  color: var(--muted);
}
.linked-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.finish .num {
  background: var(--green);
  box-shadow: 0 0 0 6px var(--green-soft);
}
.finish-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 8px;
}
.finish-text b {
  color: var(--fg);
}
.finish-text span {
  color: var(--muted);
}
.finish-text a {
  color: var(--primary-600);
  font-weight: 700;
}

/* the side */
.side {
  position: sticky;
  top: calc(var(--header-h) + 24px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.about,
.more {
  gap: 12px;
}
.about h2 {
  font-size: 19px;
}
.about h3,
.more h3 {
  font-size: 15px;
}
.for,
.free {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 14px;
  color: var(--text);
}
.free {
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--green-soft);
  color: var(--green);
  font-weight: 600;
}
.outcomes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14.5px;
}
.outcomes li {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}
.outcomes .icon {
  flex: none;
  margin-top: 4px;
  color: var(--green);
}
.other {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--fg);
  font-weight: 700;
  font-size: 14.5px;
}
.other:hover {
  color: var(--primary-600);
}
.ico-box.sm {
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .side {
    position: static;
  }
}
@media (max-width: 560px) {
  .stage {
    padding-inline-start: 46px;
  }
  .num {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  .stage::before {
    inset-inline-start: 15px;
    top: 32px;
  }
  .resource {
    flex-wrap: wrap;
  }
  .r-tags {
    width: 100%;
    justify-content: flex-start;
    padding-inline-start: 50px;
  }
  .r-go {
    display: none;
  }
}
</style>
