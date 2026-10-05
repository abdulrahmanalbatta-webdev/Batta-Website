<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import FilterChips from '@/components/ui/FilterChips.vue'
import CourseCard from '@/components/cards/CourseCard.vue'
import { courses, levels } from '@/data/courses'

// ?level= in the link pre-selects the filter
const route = useRoute()
const fromQuery = () => (levels.includes(route.query.level) ? route.query.level : 'الكل')
const level = ref(fromQuery())
watch(() => route.query.level, () => (level.value = fromQuery()))
const filtered = computed(() => courses.filter((c) => level.value === 'الكل' || c.level === level.value))
</script>

<template>
  <div class="panel">
    <FilterChips v-model="level" :options="levels" />
    <div class="grid g3">
      <CourseCard v-for="c in filtered" :key="c.id" :course="c" />
    </div>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
</style>
