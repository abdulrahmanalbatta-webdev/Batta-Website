<script setup>
import { computed } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'
import { useRegistrations } from '@/composables/useRegistrations'

const props = defineProps({
  course: { type: Object, required: true },
})

const { isRegistered } = useRegistrations()
const registered = computed(() => isRegistered('course', props.course.slug))
const page = computed(() => ({ name: 'course', params: { slug: props.course.slug } }))
</script>

<template>
  <article class="card hover course">
    <div class="cover" :class="{ 'has-image': course.cover }">
      <img v-if="course.cover" class="cover-img" :src="course.cover" alt="" loading="lazy" />
      <span class="pill" :class="registered ? 'mine' : 'lvl'">{{ registered ? 'أنت مسجّل' : course.level }}</span>
      <span v-if="!course.cover" class="glyph">{{ course.glyph }}</span>
    </div>

    <div class="body">
      <h3><RouterLink :to="page" class="title-link">{{ course.title }}</RouterLink></h3>
      <div class="meta">
        <span><BaseIcon name="award" :size="16" />{{ course.level }}</span>
        <span><BaseIcon name="users" :size="16" />{{ course.students }} طالب</span>
        <span class="rating"><BaseIcon name="star" :size="16" filled /><b>{{ course.rating }}</b></span>
      </div>

      <div v-if="course.cohort" class="cohort">{{ course.cohort }}</div>

      <ul class="outcomes">
        <li v-for="item in course.outcomes" :key="item">
          <BaseIcon name="check" :size="16" />{{ item }}
        </li>
      </ul>

      <div class="card-foot">
        <RouterLink class="btn btn-block" :class="registered ? 'btn-soft' : 'btn-primary'" :to="page">
          {{ registered ? 'صفحة الدورة' : 'التفاصيل والتسجيل' }}
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.course {
  padding: 0;
  overflow: hidden;
  gap: 0;
}
.cover {
  height: 150px;
  display: grid;
  place-items: center;
  position: relative;
  background: var(--cover);
  border-bottom: 3px solid var(--primary);
  color: #fff;
}
.cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 16px 16px;
  pointer-events: none;
}
.glyph {
  font-family: var(--mono);
  font-size: 32px;
  direction: ltr;
}
.cover .pill {
  position: absolute;
  top: 14px;
  inset-inline-start: 14px;
  z-index: 1;
}
.pill.lvl {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.pill.mine {
  background: var(--green);
  color: #fff;
}
.body {
  padding: 20px 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}
.rating {
  color: #f5b301;
}
.rating b {
  color: var(--fg);
}
.cohort {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary-600);
  background: var(--primary-soft);
  border-radius: 8px;
  padding: 6px 10px;
}
.outcomes {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14.5px;
}
.outcomes li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.outcomes .icon {
  color: var(--green);
}
.title-link {
  color: inherit;
}
.title-link:hover {
  color: var(--primary);
}
/* the cover from the dashboard fills the band; the level pill stays on top */
.cover-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover.has-image::after {
  display: none;
}
.cover.has-image .pill.lvl {
  background: rgba(11, 13, 18, 0.65);
}
</style>
