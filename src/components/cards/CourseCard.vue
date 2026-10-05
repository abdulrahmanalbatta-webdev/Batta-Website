<script setup>
import { computed } from 'vue'
import BaseIcon from '@/components/ui/BaseIcon.vue'

const props = defineProps({
  course: { type: Object, required: true },
})

const isFree = computed(() => props.course.price === 0)
</script>

<template>
  <article class="card hover course">
    <div class="cover">
      <span class="pill" :class="isFree ? 'free' : 'lvl'">{{ isFree ? 'مجانية' : course.level }}</span>
      <span class="glyph">{{ course.glyph }}</span>
    </div>

    <div class="body">
      <h3>{{ course.title }}</h3>
      <div class="meta">
        <span><BaseIcon name="clock" :size="16" />{{ course.hours }} ساعة</span>
        <span><BaseIcon name="play" :size="16" />{{ course.lessons }} درساً</span>
        <span class="rating"><BaseIcon name="star" :size="16" filled /><b>{{ course.rating }}</b></span>
      </div>

      <div v-if="course.cohort" class="cohort">{{ course.cohort }}</div>

      <ul class="outcomes">
        <li v-for="item in course.outcomes" :key="item">
          <BaseIcon name="check" :size="16" />{{ item }}
        </li>
      </ul>

      <div class="card-foot">
        <div class="price">
          {{ isFree ? 'مجاناً' : `${course.price}$` }}
          <s v-if="course.oldPrice">{{ course.oldPrice }}$</s>
        </div>
        <RouterLink class="btn" :class="isFree ? 'btn-soft' : 'btn-primary'" :to="{ name: 'register', query: { next: '/courses' } }">
          {{ isFree ? 'ابدأ الآن' : 'سجّل الآن' }}
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
.pill.free {
  background: var(--primary);
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
.price {
  font-weight: 800;
  font-size: 24px;
  color: var(--fg);
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-variant-numeric: tabular-nums;
}
.price s {
  font-size: 15px;
  color: var(--muted);
  font-weight: 600;
}
</style>
