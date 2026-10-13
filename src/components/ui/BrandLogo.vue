<script setup>
import { computed } from 'vue'
import logoLight from '@/assets/images/logo-light.png'
import logoDark from '@/assets/images/logo-dark.png'
import lockupLight from '@/assets/images/lockup-light.png'
import lockupDark from '@/assets/images/lockup-dark.png'
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
// the original logo with the name comes as one image (the mark and the name drawn together);
// an uploaded one gets the name as text beside it, unless it already has the name drawn in
const lockup = computed(() => props.withName && !uploaded.value)
const src = computed(() => {
  if (uploaded.value) return uploaded.value
  if (lockup.value) return props.inverse ? lockupDark : lockupLight
  return props.inverse ? logoDark : logoLight
})
const showName = computed(() => props.withName && uploaded.value && !brand.logoHasName && brand.name)
</script>

<template>
  <span class="brand" :class="{ inverse }">
    <img
      class="mark"
      :class="{ uploaded, lockup }"
      :src="src"
      :alt="lockup || (uploaded && brand.logoHasName) ? brand.name : ''"
      :width="size"
      :height="size"
    />
    <span v-if="showName" class="name">{{ brand.name }}</span>
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
/* the mark and the name in one image: a little taller than the mark alone so the name reads well */
.mark.lockup {
  width: auto;
  height: calc(v-bind(size) * 1.15px);
}
.inverse {
  color: #fff;
}
</style>
