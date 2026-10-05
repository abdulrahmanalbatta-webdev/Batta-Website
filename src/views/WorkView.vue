<script setup>
import { computed, ref } from 'vue'
import PageHero from '@/components/ui/PageHero.vue'
import FilterChips from '@/components/ui/FilterChips.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import ProjectCover from '@/components/work/ProjectCover.vue'
import { caseStudies } from '@/data/site'
import { texts } from '@/data/texts'

// الأعمال من لوحة التحكم (محتوى الموقع ← الأعمال): شبكة بصور المشاريع وفلترة حسب النوع، وكل مشروع يفتح صفحته
const ALL = 'الكل'
const category = ref(ALL)
const categories = computed(() => [...new Set(caseStudies.map((p) => p.tag).filter(Boolean))])
const shown = computed(() => (category.value === ALL ? caseStudies : caseStudies.filter((p) => p.tag === category.value)))
const sectors = computed(() => new Set(caseStudies.map((p) => p.sector).filter(Boolean)).size)
</script>

<template>
  <div>
    <PageHero :title="texts.ui.pages.work" :subtitle="texts.pages.work.text">
      <span><BaseIcon name="briefcase" :size="16" /><b>{{ caseStudies.length }}</b> مشروعاً</span>
      <span v-if="sectors"><BaseIcon name="globe" :size="16" /><b>{{ sectors }}</b> قطاعات</span>
    </PageHero>

    <section class="page-body">
      <div class="container">
        <FilterChips v-if="categories.length > 1" v-model="category" :options="categories" :all-label="ALL" />

        <TransitionGroup tag="div" name="projects" class="projects">
          <RouterLink
            v-for="(p, i) in shown"
            :key="p.id"
            :to="{ name: 'project', params: { id: p.id } }"
            class="project"
            :class="{ wide: i === 0 && shown.length > 2 }"
          >
            <div class="media">
              <ProjectCover :project="p" :eager="i < 2" />
              <span class="view">شاهد المشروع <BaseIcon name="arrow" :size="16" /></span>
            </div>
            <div class="info">
              <div class="meta">
                <span class="pill">{{ p.tag }}</span>
                <span v-if="p.sector">{{ p.sector }}</span>
                <span v-if="p.year">{{ p.year }}</span>
              </div>
              <h2>{{ p.title }}</h2>
              <p>{{ p.solution }}</p>
              <div v-if="p.kpis?.length" class="kpis">
                <div v-for="[value, label] in p.kpis.slice(0, 2)" :key="label">
                  <b>{{ value }}</b><span>{{ label }}</span>
                </div>
              </div>
            </div>
          </RouterLink>
        </TransitionGroup>

        <div class="ink-panel cta">
          <div>
            <h2>{{ texts.pages.work.cta_title }}</h2>
            <p>{{ texts.pages.work.cta_text }}</p>
          </div>
          <RouterLink class="btn btn-primary btn-lg" :to="{ path: '/services', hash: '#contact' }">{{ texts.ui.buttons.work_cta }}</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.projects {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}
.project {
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  overflow: hidden;
  color: inherit;
  transition:
    transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1),
    box-shadow 0.35s,
    border-color 0.35s;
}
.project:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: transparent;
}
.media {
  position: relative;
  overflow: hidden;
}
.project:hover .media :deep(img),
.project:hover .media :deep(.placeholder) {
  transform: scale(1.04);
}
.view {
  position: absolute;
  bottom: 16px;
  inset-inline-start: 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 99px;
  background: var(--surface);
  color: var(--fg);
  font-weight: 700;
  font-size: 14px;
  box-shadow: var(--shadow);
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.project:hover .view,
.project:focus-visible .view {
  opacity: 1;
  transform: none;
}
.info {
  padding: 22px 24px 26px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--muted);
  font-size: 14px;
}
.meta span:not(.pill) + span:not(.pill)::before {
  content: '·';
  margin-inline-end: 10px;
}
.info h2 {
  font-size: 22px;
  line-height: 1.4;
  color: var(--fg);
  transition: color 0.2s;
}
.project:hover h2 {
  color: var(--primary-600);
}
.info p {
  color: var(--muted);
}
.kpis {
  display: flex;
  gap: 28px;
  margin-top: 6px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}
.kpis div {
  display: flex;
  flex-direction: column;
}
.kpis b {
  font-size: 24px;
  color: var(--fg);
  direction: ltr;
  text-align: start;
}
.kpis span {
  font-size: 13px;
  color: var(--muted);
}

/* the first project, large, when the whole list shows */
.project.wide {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1.35fr 1fr;
}
.project.wide .media,
.project.wide :deep(.project-cover) {
  height: 100%;
}
.project.wide .info {
  justify-content: center;
  padding: 36px 40px;
}
.project.wide .info h2 {
  font-size: 28px;
}

.projects-move,
.projects-enter-active {
  transition:
    opacity 0.35s,
    transform 0.35s;
}
.projects-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.projects-leave-active {
  display: none;
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

@media (max-width: 900px) {
  .projects {
    grid-template-columns: 1fr;
  }
  .project.wide {
    display: flex;
  }
  .project.wide .info {
    padding: 22px 24px 26px;
  }
  .project.wide .info h2 {
    font-size: 22px;
  }
}
</style>
