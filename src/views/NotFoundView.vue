<script setup>
import BrandLogo from '@/components/ui/BrandLogo.vue'
import { onMounted, onUnmounted } from 'vue'
import { texts } from '@/data/texts'

// unknown addresses answer 200 (one page app), so tell search engines not to index them
let robots
onMounted(() => {
  robots = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex' })
  document.head.append(robots)
})
onUnmounted(() => robots?.remove())
</script>

<template>
  <section class="not-found">
    <div class="container inner">
      <BrandLogo :size="72" :with-name="false" />
      <h1>404</h1>
      <p>{{ texts.ui.not_found.text }}</p>
      <RouterLink class="btn btn-primary" to="/">{{ texts.ui.not_found.button }}</RouterLink>
    </div>
  </section>
</template>

<style scoped>
.not-found {
  padding-block: 120px;
}
.inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
}
h1 {
  font-size: 72px;
  line-height: 1;
}
p {
  color: var(--muted);
  font-size: 18px;
}
</style>
