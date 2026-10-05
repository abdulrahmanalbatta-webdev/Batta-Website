<script setup>
import BaseIcon from './BaseIcon.vue'

defineProps({
  count: { type: Number, default: 5 },
  size: { type: Number, default: 16 },
})
</script>

<template>
  <span class="stars" :aria-label="`${count} من 5`">
    <BaseIcon v-for="n in count" :key="n" name="star" :size="size" filled />
  </span>
</template>

<style scoped>
.stars {
  display: inline-flex;
  gap: 1px;
  color: #f5b301;
  vertical-align: middle;
}
</style>
