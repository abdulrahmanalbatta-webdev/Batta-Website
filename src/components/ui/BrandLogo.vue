<script setup>
import { computed } from 'vue'
import logoLight from '@/assets/images/logo-light.png'
import logoDark from '@/assets/images/logo-dark.png'

const props = defineProps({
  size: { type: Number, default: 42 },
  withName: { type: Boolean, default: true },
  // inverse: light-on-dark version for dark panels (footer, newsletter, auth side panel)
  inverse: { type: Boolean, default: false },
})

const src = computed(() => (props.inverse ? logoDark : logoLight))
</script>

<template>
  <span class="brand" :class="{ inverse }">
    <img class="mark" :src="src" alt="" :width="size" :height="size" />
    <span v-if="withName" class="name">عبد الرحمن البطه</span>
  </span>
</template>

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-weight: 800;
  font-size: 21px;
  color: var(--fg);
  white-space: nowrap;
}
.mark {
  flex: none;
  object-fit: contain;
}
.inverse {
  color: #fff;
}
</style>
