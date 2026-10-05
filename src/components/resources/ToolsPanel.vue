<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import FilterChips from '@/components/ui/FilterChips.vue'
import ToolCard from '@/components/cards/ToolCard.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { useTools } from '@/composables/useContent'

const route = useRoute()
const { items: tools, loading, error, reload } = useTools()
const categories = computed(() => [...new Set(tools.value.map((t) => t.category))])
const catFromQuery = () => (categories.value.includes(route.query.cat) ? route.query.cat : 'الكل')
const category = ref(catFromQuery())
watch([() => route.query.cat, categories], () => (category.value = catFromQuery()))
const filtered = computed(() => tools.value.filter((t) => category.value === 'الكل' || t.category === category.value))
</script>

<template>
  <div class="panel">
    <FilterChips v-model="category" :options="categories" />
    <div class="grid g3">
      <ToolCard v-for="t in filtered" :key="t.id" :tool="t" />
      <LoadState :loading="loading" :error="error" :empty="!filtered.length" empty-text="لا توجد أدوات بعد." @retry="reload" />
    </div>
    <p class="note">الأدوات المعلّمة "إحالة" روابط إحالة؛ لا تغيّر السعر عليك وتدعم المحتوى المجاني.</p>
  </div>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: 28px;
}
.note {
  color: var(--muted);
  font-size: 14px;
  text-align: center;
}
</style>
