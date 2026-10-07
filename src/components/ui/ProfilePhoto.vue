<script setup>
import { computed } from 'vue'
import { profile } from '@/data/profile'

// صورتك من لوحة التحكم (محتوى الموقع ← صورتك الشخصية)، وبدونها أول حرف من اسمك

const props = defineProps({
  size: { type: [Number, String], default: 64 },
  rounded: { type: String, default: '50%' },
})

const src = computed(() => profile.photo || null)
const dim = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <span class="photo" :style="{ width: dim, height: dim, borderRadius: rounded }">
    <img v-if="src" :src="src" :alt="profile.name" />
    <span v-else class="placeholder" aria-hidden="true">{{ profile.initial }}</span>
  </span>
</template>

<style scoped>
.photo {
  display: inline-grid;
  place-items: center;
  overflow: hidden;
  flex: none;
  background: var(--cover);
  container-type: inline-size;
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
}
.placeholder {
  color: #fff;
  font-weight: 800;
  font-size: 42cqi;
  line-height: 1;
}
</style>
