<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import FilterChips from '@/components/ui/FilterChips.vue'
import CourseCard from '@/components/cards/CourseCard.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { useCourses } from '@/composables/useContent'

const levels = ['مبتدئ', 'متوسط', 'متقدم']
const { items: courses, loading, error, reload } = useCourses()

// ?level= in the link pre-selects the filter
const route = useRoute()
const fromQuery = () => (levels.includes(route.query.level) ? route.query.level : 'الكل')
const level = ref(fromQuery())
watch(() => route.query.level, () => (level.value = fromQuery()))
const filtered = computed(() => courses.value.filter((c) => level.value === 'الكل' || c.level === level.value))
</script>

<template>
  <div class="panel">
    <FilterChips v-model="level" :options="levels" />
    <div class="grid g3">
      <CourseCard v-for="c in filtered" :key="c.id" :course="c" />
      <LoadState :loading="loading" :error="error" :empty="!filtered.length" empty-text="لا توجد دورات بهذا المستوى حالياً." @retry="reload" />
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
