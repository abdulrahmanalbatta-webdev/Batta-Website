<script setup>
import { computed } from 'vue'
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { usePaths } from '@/composables/useContent'
import { texts } from '@/data/texts'

// صفحة المسارات: كرت لكل تخصص، يفتح خريطته بالمراحل والمصادر المجانية (من لوحة التحكم ← المسارات)
const { items: paths, loading, error, reload } = usePaths()
const total = computed(() => paths.value.reduce((sum, path) => sum + path.resources_count, 0))
</script>

<template>
  <div>
    <PageHero :title="texts.ui.pages.paths" :eyebrow="texts.ui.pages.academy" :subtitle="texts.learning.paths.text">
      <span><BaseIcon name="pin" :size="16" /><b>{{ paths.length }}</b> مسارات</span>
      <span><BaseIcon name="link" :size="16" /><b>{{ total }}</b> مصدراً</span>
      <span v-if="texts.learning.paths.badge"><BaseIcon name="check" :size="16" />{{ texts.learning.paths.badge }}</span>
    </PageHero>

    <section class="page-body">
      <div class="container">
        <div class="grid g3">
          <RouterLink v-for="p in paths" :key="p.id" class="card hover path" :to="{ name: 'path', params: { id: p.id } }">
            <span class="ico-box"><BaseIcon :name="p.icon" /></span>
            <h2>{{ p.title }}</h2>
            <p class="summary">{{ p.summary }}</p>
            <p class="audience"><BaseIcon name="user" :size="15" />{{ p.audience }}</p>
            <ol class="mini-map" aria-hidden="true">
              <li v-for="s in p.stages" :key="s.title"><i />{{ s.title }}</li>
            </ol>
            <div class="foot">
              <span><BaseIcon name="clock" :size="15" />{{ p.duration }}</span>
              <span>{{ p.stages.length }} مراحل · {{ p.resources_count }} مصدراً</span>
              <span class="go">الخريطة <BaseIcon name="arrow" :size="15" /></span>
            </div>
          </RouterLink>
          <LoadState :loading="loading" :error="error" :empty="!paths.length" empty-text="لا توجد مسارات بعد." @retry="reload" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.path {
  gap: 12px;
  color: inherit;
}
.path h2 {
  font-size: 20px;
  margin-top: 4px;
}
.summary {
  color: var(--text);
  font-size: 15px;
}
.audience {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 13.5px;
}
/* the path's stages as a small dotted line, a preview of the map */
.mini-map {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13.5px;
  color: var(--text);
}
.mini-map li {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
}
.mini-map i {
  flex: none;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--primary-soft);
  border: 2px solid var(--primary);
}
.mini-map li:not(:last-child)::after {
  content: '';
  position: absolute;
  inset-inline-start: 4px;
  top: 14px;
  height: 12px;
  width: 1px;
  background: var(--line-2);
}
.foot {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--line);
  display: flex;
  align-items: center;
  gap: 8px 14px;
  flex-wrap: wrap;
  font-size: 13.5px;
  color: var(--muted);
}
.foot span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.go {
  margin-inline-start: auto;
  color: var(--primary-600);
  font-weight: 700;
}
</style>
