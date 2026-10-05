<script setup>
import BaseIcon from '@/components/ui/BaseIcon.vue'

defineProps({
  article: { type: Object, required: true },
})
</script>

<template>
  <RouterLink class="card hover article" :to="{ name: 'article', params: { id: article.id } }">
    <div class="top">
      <span class="pill">{{ article.category }}</span>
      <span class="meta"><span><BaseIcon name="clock" :size="16" />{{ article.minutes }} د</span></span>
    </div>
    <h3>{{ article.title }}</h3>
    <p>{{ article.excerpt }}</p>
    <div class="card-foot">
      <span>{{ article.date }}</span>
      <span class="link-more">اقرأ <BaseIcon name="arrow" :size="16" /></span>
    </div>
  </RouterLink>
</template>

<style scoped>
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.article:hover h3 {
  color: var(--primary-600);
}
h3 {
  transition: color 0.2s;
}
</style>
