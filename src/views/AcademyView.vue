<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHero from '@/components/ui/PageHero.vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import FilterChips from '@/components/ui/FilterChips.vue'
import CoursesPanel from '@/components/academy/CoursesPanel.vue'
import WorkshopsPanel from '@/components/academy/WorkshopsPanel.vue'
import { useCourses, useWorkshops } from '@/composables/useContent'
import { texts } from '@/data/texts'

// الدورات والورش في صفحة واحدة: "الكل" يعرض الورش القادمة أولاً (لها موعد) ثم الدورات.
// ?type=courses أو ?type=workshops يختار النوع (والروابط القديمة /courses و/workshops تصل هنا به).
const route = useRoute()
const router = useRouter()
const { items: courses } = useCourses()
const { items: workshops } = useWorkshops()

const TYPES = { courses: 'الدورات', workshops: 'الورش' }
const type = computed({
  // ?tab= is the older combined page's link
  get: () => TYPES[route.query.type ?? route.query.tab] ?? 'الكل',
  set: (label) => {
    const key = Object.keys(TYPES).find((k) => TYPES[k] === label)
    const { type: _, tab: __, ...query } = route.query
    router.replace({ query: key ? { ...query, type: key } : query })
  },
})
const showWorkshops = computed(() => type.value !== 'الدورات')
const showCourses = computed(() => type.value !== 'الورش')
</script>

<template>
  <div>
    <PageHero title="الدورات والورش" :eyebrow="texts.ui.pages.academy" subtitle="دورات مسجّلة تنتهي بمشروع حقيقي، وورش مباشرة أونلاين وحضورياً، والتسجيل فيها كلها مجاني.">
      <span><BaseIcon name="play" :size="16" /><b>{{ courses.length }}</b> دورات</span>
      <span><BaseIcon name="calendar" :size="16" /><b>{{ workshops.length }}</b> ورش قادمة</span>
    </PageHero>

    <section class="page-body">
      <div class="container">
        <FilterChips v-model="type" :options="Object.values(TYPES)" />

        <div v-if="showWorkshops" class="group">
          <h2 v-if="type === 'الكل'" class="section-title"><BaseIcon name="calendar" :size="20" />الورش القادمة</h2>
          <WorkshopsPanel show-kind />
        </div>

        <div v-if="showCourses" class="group">
          <h2 v-if="type === 'الكل'" class="section-title"><BaseIcon name="play" :size="20" />الدورات</h2>
          <CoursesPanel show-kind />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.group {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
}
.section-title .icon {
  color: var(--primary-600);
}
</style>
