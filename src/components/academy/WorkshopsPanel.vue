<script setup>
import WorkshopCard from '@/components/cards/WorkshopCard.vue'
import LoadState from '@/components/ui/LoadState.vue'
import { useWorkshops } from '@/composables/useContent'
import { texts } from '@/data/texts'

const { items: workshops, loading, error, reload } = useWorkshops()
</script>

<template>
  <div class="panel">
    <div class="list">
      <WorkshopCard v-for="w in workshops" :key="w.id" :workshop="w" />
      <LoadState :loading="loading" :error="error" :empty="!workshops.length" empty-text="لا توجد ورش قادمة حالياً، تابعنا لتعرف بالورشة التالية." @retry="reload" />
    </div>

    <div class="ink-panel cta">
      <div>
        <h2>{{ texts.learning.workshops.private_title }}</h2>
        <p>{{ texts.learning.workshops.private_text }}</p>
      </div>
      <RouterLink class="btn btn-primary btn-lg" :to="{ path: '/services', hash: '#contact' }">اطلب عرضاً</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.panel,
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.panel {
  gap: 28px;
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
</style>
