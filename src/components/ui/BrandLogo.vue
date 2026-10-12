<script setup>
import { computed } from 'vue'
import logoLight from '@/assets/images/logo-light.png'
import logoDark from '@/assets/images/logo-dark.png'
import { brand } from '@/data/site'

const props = defineProps({
  size: { type: Number, default: 42 },
  withName: { type: Boolean, default: true },
  // inverse: light-on-dark version for dark panels (footer, auth side panel)
  inverse: { type: Boolean, default: false },
})

// the logos uploaded in the dashboard (محتوى الموقع ← الاسم والشعار), else the original ones;
// on dark panels the light logo stands in when no dark one was uploaded
const uploaded = computed(() => (props.inverse ? brand.logoDark || brand.logo : brand.logo))
const src = computed(() => uploaded.value || (props.inverse ? logoDark : logoLight))
</script>

<template>
  <span class="brand" :class="{ inverse }">
    <img class="mark" :class="{ uploaded }" :src="src" alt="" :width="size" :height="size" />
    <span v-if="withName && brand.name" class="name">{{ brand.name }}</span>
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
/* an uploaded logo keeps its own proportions: as tall as the original mark, as wide as it needs */
.mark.uploaded {
  width: auto;
  max-width: 220px;
}
.inverse {
  color: #fff;
}
</style>
