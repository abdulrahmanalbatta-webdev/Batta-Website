<script setup>
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import TopoPattern from '@/components/ui/TopoPattern.vue'
import LoadState from '@/components/ui/LoadState.vue'
import ProjectCover from '@/components/work/ProjectCover.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { caseStudies } from '@/data/site'
import { texts } from '@/data/texts'
import { contentState } from '@/lib/siteContent'
import { siteTitle } from '@/router'

// صفحة مشروع واحد: الصورة، بيانات المشروع، التحدي والحل، النتائج، معرض الصور، والمشروع التالي
const props = defineProps({
  id: { type: String, required: true },
})

const index = computed(() => caseStudies.findIndex((p) => p.id === props.id))
const project = computed(() => caseStudies[index.value] ?? null)
const next = computed(() => (caseStudies.length > 1 && index.value >= 0 ? caseStudies[(index.value + 1) % caseStudies.length] : null))
const host = computed(() => {
  try {
    return new URL(project.value.link).host.replace(/^www\./, '')
  } catch {
    return ''
  }
})
const facts = computed(() =>
  project.value
    ? [
        ['العميل', project.value.client],
        ['القطاع', project.value.sector],
        ['السنة', project.value.year],
        ['النوع', project.value.tag],
      ].filter(([, value]) => value)
    : [],
)

watchEffect(() => {
  if (project.value) document.title = siteTitle(project.value.title)
})

// the gallery opens in a simple viewer (arrows, Esc)
const viewing = ref(-1)
const gallery = computed(() => project.value?.gallery ?? [])
const open = (i) => (viewing.value = i)
const close = () => (viewing.value = -1)
const step = (d) => (viewing.value = (viewing.value + d + gallery.value.length) % gallery.value.length)
function onKey(e) {
  if (viewing.value < 0) return
  if (e.key === 'Escape') close()
  // RTL: the right arrow goes back
  if (e.key === 'ArrowLeft') step(1)
  if (e.key === 'ArrowRight') step(-1)
}
watch(viewing, (v) => (v >= 0 ? window.addEventListener('keydown', onKey) : window.removeEventListener('keydown', onKey)))
watch(() => props.id, close)
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <NotFoundView v-if="!project && contentState.loaded" />
  <section v-else-if="!project" class="page-body"><div class="container"><LoadState :loading="true" /></div></section>

  <div v-else>
    <header class="hero">
      <TopoPattern tone="dark" />
      <div class="container inner">
        <nav class="crumbs" aria-label="مسار التنقل">
          <RouterLink to="/">الرئيسية</RouterLink><span>/</span>
          <RouterLink to="/work">{{ texts.ui.pages.work }}</RouterLink><span>/</span>
          <span>{{ project.title }}</span>
        </nav>
        <span class="pill">{{ project.tag }}</span>
        <h1>{{ project.title }}</h1>
        <p class="lead">{{ project.solution }}</p>
        <dl v-if="facts.length || project.link" class="facts">
          <div v-for="[label, value] in facts" :key="label">
            <dt>{{ label }}</dt>
            <dd>{{ value }}</dd>
          </div>
          <div v-if="project.link" class="visit">
            <a class="btn btn-primary" :href="project.link" target="_blank" rel="noopener">
              زيارة الموقع<span v-if="host" class="host">{{ host }}</span><BaseIcon name="link" :size="16" />
            </a>
          </div>
        </dl>
      </div>
    </header>

    <section class="page-body">
      <div class="container">
        <div class="cover-frame">
          <ProjectCover :project="project" eager />
        </div>

        <div class="story">
          <article class="card">
            <span class="num">01</span>
            <h2>التحدي</h2>
            <p>{{ project.problem }}</p>
          </article>
          <article class="card">
            <span class="num">02</span>
            <h2>الحل</h2>
            <p>{{ project.solution }}</p>
            <div v-if="project.tech?.length" class="tech">
              <span v-for="t in project.tech" :key="t" class="pill line mono">{{ t }}</span>
            </div>
          </article>
        </div>

        <div v-if="project.kpis?.length" class="results">
          <h2>النتائج</h2>
          <div class="kpis">
            <div v-for="[value, label] in project.kpis" :key="label" class="kpi">
              <b>{{ value }}</b>
              <span>{{ label }}</span>
            </div>
          </div>
        </div>

        <div v-if="gallery.length" class="gallery-block">
          <h2>من المشروع</h2>
          <div class="gallery">
            <button v-for="(src, i) in gallery" :key="src" type="button" class="shot" :aria-label="`عرض الصورة ${i + 1}`" @click="open(i)">
              <img :src="src" alt="" loading="lazy" />
            </button>
          </div>
        </div>

        <RouterLink v-if="next" :to="{ name: 'project', params: { id: next.id } }" class="next">
          <div class="next-text">
            <span>المشروع التالي</span>
            <b>{{ next.title }}</b>
            <span class="link-more">شاهد المشروع <BaseIcon name="arrow" :size="16" /></span>
          </div>
          <div class="next-cover"><ProjectCover :project="next" /></div>
        </RouterLink>

        <div class="ink-panel cta">
          <div>
            <h2>{{ texts.pages.work.cta_title }}</h2>
            <p>{{ texts.pages.work.cta_text }}</p>
          </div>
          <RouterLink class="btn btn-primary btn-lg" :to="{ path: '/services', hash: '#contact' }">{{ texts.ui.buttons.work_cta }}</RouterLink>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="viewing >= 0" class="viewer" role="dialog" aria-modal="true" aria-label="معرض الصور" @click.self="close">
        <button type="button" class="v-close" aria-label="إغلاق" @click="close">✕</button>
        <button v-if="gallery.length > 1" type="button" class="v-nav v-prev" aria-label="السابقة" @click="step(-1)"><BaseIcon name="next" :size="22" /></button>
        <img :src="gallery[viewing]" alt="" />
        <button v-if="gallery.length > 1" type="button" class="v-nav v-next" aria-label="التالية" @click="step(1)"><BaseIcon name="prev" :size="22" /></button>
        <span class="v-count">{{ viewing + 1 }} / {{ gallery.length }}</span>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: var(--ink-panel);
  padding-block: 56px 64px;
  color: #fff;
}
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(45% 90% at 85% 0%, rgba(0, 102, 255, 0.35), transparent 70%);
}
.inner {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.crumbs {
  display: flex;
  gap: 8px;
  font-size: 14px;
  color: var(--ink-text);
  flex-wrap: wrap;
}
.crumbs a {
  color: var(--ink-text);
}
.crumbs a:hover {
  color: #fff;
}
.hero .pill {
  align-self: flex-start;
  background: var(--primary);
  color: #fff;
}
h1 {
  font-size: clamp(30px, 4.4vw, 48px);
  line-height: 1.25;
  color: #fff;
  max-width: 900px;
}
.lead {
  font-size: 18px;
  color: var(--ink-text);
  max-width: 760px;
}
.facts {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px 40px;
  margin: 18px 0 0;
  padding-top: 22px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}
dt {
  font-size: 13px;
  color: var(--ink-text);
}
dd {
  margin: 4px 0 0;
  font-weight: 700;
  color: #fff;
}
.visit {
  margin-inline-start: auto;
}
.host {
  font-family: var(--mono);
  font-size: 12px;
  opacity: 0.85;
  margin-inline: 6px 2px;
  direction: ltr;
}

.cover-frame {
  margin-top: -100px;
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid var(--line);
  box-shadow: var(--shadow-lg);
  position: relative;
}

.story {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}
.story .card {
  padding: 30px;
  gap: 12px;
}
.num {
  font-family: var(--mono);
  font-weight: 800;
  color: var(--primary);
  font-size: 14px;
}
.story h2,
.results h2,
.gallery-block h2 {
  font-size: 24px;
  color: var(--fg);
}
.story p {
  color: var(--text);
  font-size: 17px;
}
.tech {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
.kpi {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 3px solid var(--primary);
}
.kpi b {
  font-size: 36px;
  line-height: 1.1;
  color: var(--fg);
  direction: ltr;
  text-align: start;
}
.kpi span {
  color: var(--muted);
}

.gallery-block {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.shot {
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  cursor: zoom-in;
  aspect-ratio: 16 / 10;
  background: var(--tint);
}
.shot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}
.shot:hover img {
  transform: scale(1.04);
}
.shot:first-child:nth-last-child(odd) {
  grid-column: 1 / -1;
  aspect-ratio: 16 / 8;
}

.next {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  align-items: center;
  gap: 24px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
  color: inherit;
  transition: box-shadow 0.3s;
}
.next:hover {
  box-shadow: var(--shadow-lg);
}
.next-text {
  padding: 30px 34px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.next-text > span:first-child {
  color: var(--muted);
  font-size: 14px;
}
.next-text b {
  font-size: 24px;
  color: var(--fg);
}
.next-cover {
  overflow: hidden;
}
.next:hover .next-cover :deep(img),
.next:hover .next-cover :deep(.placeholder) {
  transform: scale(1.04);
}

.cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.cta h2 {
  font-size: 22px;
}

.viewer {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(5, 7, 12, 0.92);
  display: grid;
  place-items: center;
  padding: 56px 72px;
}
.viewer img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 12px;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}
.v-close,
.v-nav {
  position: absolute;
  border: 0;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: 18px;
}
.v-close:hover,
.v-nav:hover {
  background: rgba(255, 255, 255, 0.22);
}
.v-close {
  top: 16px;
  inset-inline-end: 16px;
}
.v-nav {
  top: 50%;
  transform: translateY(-50%);
}
.v-prev {
  inset-inline-start: 16px;
}
.v-next {
  inset-inline-end: 16px;
}
.v-count {
  position: absolute;
  bottom: 18px;
  color: #c9d4e3;
  font-size: 14px;
}

@media (max-width: 900px) {
  .story,
  .gallery,
  .next {
    grid-template-columns: 1fr;
  }
  .visit {
    margin-inline-start: 0;
  }
  .cover-frame {
    margin-top: -70px;
    border-radius: 16px;
  }
  .viewer {
    padding: 56px 12px;
  }
}
</style>
